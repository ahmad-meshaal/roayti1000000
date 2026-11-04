import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Check, Trash2, Heart, Users, Sparkles, TrendingUp, Calendar, 
  ExternalLink, CheckCircle2, BookOpen, Clock, AlertCircle, ShieldAlert, Crown, MessageSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Novel, Follow } from '../types';
import * as api from '../lib/api';

export interface AppNotification {
  id: string;
  type: 'welcome_weekly' | 'new_follower' | 'novel_milestone' | 'system' | 'admin_message';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  createdAt: number;
  read: boolean;
  link?: string;
  actionView?: string;
  isServer?: boolean;
}

interface NotificationBellProps {
  currentUserId?: string | null;
  userDisplayName?: string;
  novels?: Novel[];
  follows?: Follow[];
  onNavigateView?: (view: any, extraId?: string) => void;
  className?: string;
  isMobileProfile?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  currentUserId,
  userDisplayName = 'مبدع روايتي',
  novels = [],
  follows = [],
  onNavigateView,
  className = '',
  isMobileProfile = false
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const safeUserId = currentUserId || '';
  const storageKey = safeUserId 
    ? `roayti_notifications_${safeUserId}` 
    : 'roayti_notifications_guest';

  // Load and generate dynamic notifications with bulletproof guards & server sync
  const loadNotifications = async () => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null;
      let list: AppNotification[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];
      const now = Date.now();
      let updated = false;

      // Safe arrays
      const safeNovels = Array.isArray(novels) ? novels : [];
      const safeFollows = Array.isArray(follows) ? follows : [];
      const displayName = userDisplayName || (isAr ? 'مبدع روايتي' : 'Roayti Creator');

      // 1. Weekly Welcome Message (every 7 days = 7 * 24 * 60 * 60 * 1000 ms)
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const lastWelcomeKey = `roayti_last_welcome_${safeUserId || 'guest'}`;
      const lastWelcomeTime = parseInt((typeof localStorage !== 'undefined' ? localStorage.getItem(lastWelcomeKey) : '0') || '0', 10);

      if (!lastWelcomeTime || now - lastWelcomeTime >= SEVEN_DAYS_MS) {
        const welcomeNotif: AppNotification = {
          id: `welcome_${now}`,
          type: 'welcome_weekly',
          titleAr: 'مرحباً بك مجدداً في روايتي! ✨',
          titleEn: 'Welcome back to Roayti! ✨',
          messageAr: `أهلاً بك يا ${displayName}! أسبوع أدبي ملهم جديد بانتظارك لكتابة فصول جديدة أو استكشاف أحدث الروايات والقصص.`,
          messageEn: `Welcome back, ${displayName}! A new inspiring week awaits you to craft new chapters or explore the latest trending novels.`,
          createdAt: now,
          read: false,
          actionView: 'explore'
        };
        list = [welcomeNotif, ...list.filter(n => n.type !== 'welcome_weekly')];
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(lastWelcomeKey, now.toString());
        }
        updated = true;
      }

      // 2. Follower milestone notification (if user has followers)
      if (safeUserId && safeFollows.length > 0) {
        const userFollowers = safeFollows.filter(f => f && f.followedUid === safeUserId);
        if (userFollowers.length > 0) {
          const followerKey = `roayti_last_follower_count_${safeUserId}`;
          const lastCount = parseInt((typeof localStorage !== 'undefined' ? localStorage.getItem(followerKey) : '0') || '0', 10);

          if (userFollowers.length > lastCount) {
            const diff = userFollowers.length - lastCount;
            const followerNotif: AppNotification = {
              id: `follower_${now}`,
              type: 'new_follower',
              titleAr: 'متابع جديد ينضم لجمهورك! 👤',
              titleEn: 'New Follower Joined Your Audience! 👤',
              messageAr: diff === 1 
                ? 'قام كاتب أو قارئ جديد بمتابعة حسابك ومؤلفاتك الأدبية.' 
                : `لديك ${diff} متابعين جدد انضموا إلى صفحتك الأدبية!`,
              messageEn: diff === 1 
                ? 'A reader or fellow author just started following your profile and stories.' 
                : `You have ${diff} new followers exploring your literary stories!`,
              createdAt: now,
              read: false,
              actionView: 'profile'
            };
            list = [followerNotif, ...list];
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(followerKey, userFollowers.length.toString());
            }
            updated = true;
          }
        }
      }

      // 3. Novel milestone: 1,000 views milestone (and other major thresholds)
      if (safeUserId && safeNovels.length > 0) {
        const myNovels = safeNovels.filter(n => n && n.authorUid === safeUserId);
        myNovels.forEach(novel => {
          if (!novel) return;
          const views = novel.viewsCount || 0;
          if (views >= 1000) {
            const milestoneKey = `roayti_milestone_1k_${novel.id}`;
            const alreadyCelebrated = typeof localStorage !== 'undefined' ? localStorage.getItem(milestoneKey) : null;

            if (!alreadyCelebrated) {
              const milestoneNotif: AppNotification = {
                id: `milestone_1k_${novel.id}_${now}`,
                type: 'novel_milestone',
                titleAr: `تهانينا! رواية «${novel.title || ''}» حققت 1,000 مشاهدة! 🎉`,
                titleEn: `Milestone! "${novel.title || ''}" reached 1,000 views! 🎉`,
                messageAr: `وصلت روايتك «${novel.title || ''}» إلى إنجاز رائع بتخطي حاجز 1,000 قراءة ومشاهدة. استمر في نشر الفصول ومشاركة إبداعك مع القراء!`,
                messageEn: `Your novel "${novel.title || ''}" just crossed the 1,000 views milestone! Keep publishing chapters and inspiring your readers!`,
                createdAt: now,
                read: false,
                actionView: 'editor'
              };
              list = [milestoneNotif, ...list];
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(milestoneKey, 'true');
              }
              updated = true;
            }
          }
        });
      }

      // 4. Fetch Server-side notifications (Admin messages, system alerts)
      if (safeUserId) {
        try {
          const serverItems = await api.getNotifications(safeUserId);
          if (Array.isArray(serverItems) && serverItems.length > 0) {
            const serverFormatted: AppNotification[] = serverItems.map((s: any) => ({
              id: s.id,
              type: s.type === 'admin_message' ? 'admin_message' : 'system',
              titleAr: s.title,
              titleEn: s.title,
              messageAr: s.body,
              messageEn: s.body,
              createdAt: s.createdAt ? new Date(s.createdAt).getTime() : now,
              read: !!s.read,
              isServer: true,
            }));

            // Merge by unique ID
            const existingIds = new Set(list.map(x => x.id));
            const newServerItems = serverFormatted.filter(item => !existingIds.has(item.id));
            
            // Also update read status of existing server items
            const serverStatusMap = new Map(serverFormatted.map(item => [item.id, item.read]));
            list = list.map(item => {
              if (serverStatusMap.has(item.id)) {
                return { ...item, read: serverStatusMap.get(item.id)! };
              }
              return item;
            });

            if (newServerItems.length > 0) {
              list = [...newServerItems, ...list];
              updated = true;
            }
          }
        } catch (serverErr) {
          // Graceful fallback if server unavailable
        }
      }

      // Sort by newest first
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      // Limit list to last 30 notifications
      list = list.slice(0, 30);
      setNotifications(list);
      if (typeof localStorage !== 'undefined' && (updated || !saved)) {
        localStorage.setItem(storageKey, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Notification load error:', e);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll for new admin notifications every 45 seconds if user is logged in
    if (safeUserId) {
      const interval = setInterval(loadNotifications, 45000);
      return () => clearInterval(interval);
    }
  }, [safeUserId, userDisplayName, novels, follows, storageKey, isAr]);

  // When opening dropdown, reload notifications
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => n && !n.read).length;

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      if (safeUserId) {
        await api.markAllNotificationsRead(safeUserId).catch(() => {});
      }
    } catch (_) {}
  };

  const markSingleAsRead = async (id: string, isServer?: boolean) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      if (isServer) {
        await api.markNotificationRead(id).catch(() => {});
      }
    } catch (_) {}
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
    } catch (_) {}
  };

  const handleNotificationClick = (item: AppNotification) => {
    markSingleAsRead(item.id, item.isServer);
    setIsOpen(false);
    if (item.actionView && onNavigateView) {
      onNavigateView(item.actionView);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffHours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (diffHours < 1) return isAr ? 'منذ قليل' : 'Just now';
    if (diffHours < 24) return isAr ? `منذ ${diffHours} س` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          isMobileProfile
            ? "monochrome-button-outline p-2 rounded-full active:scale-90 relative cursor-pointer"
            : "p-2 rounded-full opacity-60 hover:opacity-100 hover:bg-black/5 transition-all relative cursor-pointer active:scale-95"
        }
        title={t('notifications', 'الإشعارات')}
        aria-label={t('notifications', 'الإشعارات')}
      >
        <Bell size={isMobileProfile ? 16 : 18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute ${isMobileProfile ? (isAr ? 'left-0' : 'right-0') : (isAr ? 'left-0 sm:left-auto sm:right-0' : 'right-0 sm:right-auto sm:left-0')} mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-black/10 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 bg-gray-50/80">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-900" />
              <h3 className="text-sm font-bold text-gray-900">
                {t('notifications', 'الإشعارات')}
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-mono font-bold">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg text-black/60 hover:text-black hover:bg-black/5 transition-colors flex items-center gap-1"
                  title={isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}
                >
                  <Check size={13} />
                  <span className="text-[11px]">{isAr ? 'قراءة الكل' : 'Mark read'}</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="p-1.5 rounded-lg text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={isAr ? 'مسح الإشعارات' : 'Clear all'}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-black/5">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-black/5 mx-auto mb-3 flex items-center justify-center text-black/30">
                  <Bell size={20} />
                </div>
                <p className="text-xs font-bold text-gray-600">
                  {isAr ? 'لا توجد إشعارات جديدة حالياً' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {isAr 
                    ? 'ستظهر هنا رسائل الترحيب الأسبوعية، الرسائل الإدارية، وإشعارات المتابعين الجدد ومعالم القراءة.' 
                    : 'Weekly welcomes, admin alerts, follower updates, and reading milestones will appear here.'}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                if (!item) return null;
                let Icon = Sparkles;
                let iconColor = "text-purple-600 bg-purple-50";

                if (item.type === 'admin_message') {
                  Icon = Crown;
                  iconColor = "text-amber-700 bg-amber-50 border border-amber-200";
                } else if (item.type === 'new_follower') {
                  Icon = Users;
                  iconColor = "text-blue-600 bg-blue-50";
                } else if (item.type === 'novel_milestone') {
                  Icon = TrendingUp;
                  iconColor = "text-emerald-600 bg-emerald-50";
                } else if (item.type === 'welcome_weekly') {
                  Icon = Calendar;
                  iconColor = "text-amber-600 bg-amber-50";
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 transition-colors cursor-pointer flex gap-3 text-start ${
                      item.type === 'admin_message'
                        ? (item.read ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'bg-amber-50/70 hover:bg-amber-50/90')
                        : (item.read ? 'bg-white hover:bg-black/[0.02]' : 'bg-emerald-50/30 hover:bg-emerald-50/50')
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                      <Icon size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {isAr ? item.titleAr : item.titleEn}
                          </h4>
                          {item.type === 'admin_message' && (
                            <span className="shrink-0 text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold shadow-xs">
                              {isAr ? 'إدارة روايتي' : 'Admin'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {isAr ? item.messageAr : item.messageEn}
                      </p>
                    </div>

                    {!item.read && (
                      <span className={`w-2 h-2 rounded-full shrink-0 self-center ${item.type === 'admin_message' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer status */}
          <div className="px-4 py-2 border-t border-black/5 bg-gray-50 text-center">
            <span className="text-[10px] text-gray-400">
              {isAr ? 'تنبيهات فورية ورسائل الإدارة ونشاطك في منصة روايتي' : 'Real-time milestones, admin notices & community alerts'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
