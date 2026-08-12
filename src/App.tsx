import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  useUser, 
  useClerk, 
  SignIn, 
  SignUp,
  UserButton,
  SignInButton,
  SignUpButton,
  SignedOut,
  SignedIn,
  ClerkProvider
} from '@clerk/clerk-react';
import * as api from './lib/api';
import mammoth from 'mammoth';
import { encryptData, decryptData } from './lib/encryption';
import { Novel, Chapter, Character, UserProfile, Follow, Comment, LibraryItem, ReadingProgress, ExternalLink } from './types';
import { generateText } from './services/gemini';
import AdSense from './components/AdSense';
import { SitemapView } from './components/SitemapView';

// --- Error Handling & Boundary ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  UPLOAD = 'upload'
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined,
      email: undefined,
      emailVerified: undefined,
      isAnonymous: undefined,
      tenantId: undefined,
      providerInfo: []
    },
    operationType,
    path
  }
  console.error('Firestore/Storage Error: ', JSON.stringify(errInfo));
  const finalError = new Error(JSON.stringify(errInfo));
  (finalError as any).isFirestoreError = true;
  throw finalError;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorDetails: FirestoreErrorInfo | null = null;
      try {
        if (this.state.error?.message) {
          errorDetails = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8 text-center">
          <div className="mb-6 text-red-600">
            <Settings size={64} className="mx-auto mb-4 opacity-20" />
            <h2 className="text-2xl font-bold mb-2">عذراً، حدث خطأ غير متوقع / Sorry, an unexpected error occurred</h2>
            <p className="text-black/60 max-w-md mx-auto">
              {errorDetails ? `خطأ في عملية / Error in operation ${errorDetails.operationType}: ${errorDetails.error}` : this.state.error?.message || 'حدث خطأ غير معروف / Unknown error'}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="monochrome-button px-8"
          >
            إعادة تحميل التطبيق / Reload application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
import { 
  Book, 
  Plus, 
  PlusCircle,
  User as UserIcon, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  PenTool, 
  Users, 
  Sparkles, 
  Heart,
  Share2,
  Eye,
  Trash2, 
  ArrowLeft,
  Save,
  FileText,
  UserPlus,
  UserCheck,
  Search,
  Lock,
  Camera,
  Cloud,
  ExternalLink as ExternalLinkIcon,
  Info,
  Copy,
  Check,
  Bookmark,
  MessageSquare,
  TrendingUp,
  Clock,
  BarChart2,
  Download,
  Menu,
  X,
  Globe,
  Map as MapIcon,
  Languages,
  Youtube,
  Twitter,
  Instagram,
  Facebook,
  Github,
  Linkedin,
  RefreshCw,
  RotateCcw,
  BookOpen,
  Zap,
  ZapOff,
  Image as ImageIcon,
  MoreVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Baseline,
  Maximize2,
  Minimize2,
  Loader2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Send,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ReactQuill from 'react-quill-new';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { 
  generatePlot, 
  generateChapterContent, 
  generateShortSummary, 
  generateChapterDescription, 
  suggestChapterTitle, 
  chatAboutNovel,
  editChapterContent,
  continueChapterContent
} from './services/gemini';
import { uploadBase64Image, uploadFile } from './services/storage';
import { resizeAndCompressImage } from './utils/image';
import {
  serverTimestamp,
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  where,
} from 'firebase/firestore';
import { signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
// ↓ عدّل المسار إذا كان ملف إعداد Firebase عندك في مكان مختلف
import { auth, db } from './firebase';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// --- Components ---

const Logo = ({ size = 64, className = "" }: { size?: number, className?: string }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full w-full flex items-center justify-center"
    >
      <BookOpen size={size * 0.8} strokeWidth={1.5} className="text-[#1A1A1A]" />
      <div className="absolute -right-1 -top-1 text-[#1A1A1A]/20">
        <div className="h-2 w-2 rounded-full bg-current" />
      </div>
    </motion.div>
  </div>
);

const Loading = () => (
  <div className="flex h-screen items-center justify-center bg-white">
    <div className="h-8 w-8 animate-spin border-4 border-black border-t-transparent"></div>
  </div>
);

// ===== BADGE SYSTEM =====
const getBadgeType = (
  libraryCount: number,
  followersCount: number,
  novelsCount: number,
  manualBadge?: string | null
): 'reader' | 'writer' | 'both' | null => {
  if (manualBadge === 'reader' || manualBadge === 'writer' || manualBadge === 'both') {
    return manualBadge;
  }
  const isReader = libraryCount >= 1000;
  const isWriter = followersCount >= 1000 && novelsCount > 0;
  if (isReader && isWriter) return 'both';
  if (isReader) return 'reader';
  if (isWriter) return 'writer';
  return null;
};

const BadgeIcon = ({ type }: { type: 'reader' | 'writer' | 'both' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const labels: Record<string, string> = {
    reader: 'قارئ مميز — أضاف 1000 رواية مفضلة',
    writer: 'الكاتب المميز — وصل 1000 متابع',
    both:   'قارئ وكاتب مميز',
  };
  const symbols: Record<string, string> = { reader: '✦', writer: '✧', both: '𖣘' };
  return (
    <div className="relative inline-flex" onClick={e => { e.stopPropagation(); setShowTooltip(v => !v); }}>
      <span
        className="cursor-pointer select-none leading-none text-black drop-shadow-sm"
        style={{ fontSize: '14px' }}
      >
        {symbols[type]}
      </span>
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999] whitespace-nowrap rounded bg-black text-white px-2 py-1 font-bold shadow-lg"
          style={{ fontSize: '10px', direction: 'rtl' }}
          onClick={e => e.stopPropagation()}
        >
          {labels[type]}
        </div>
      )}
    </div>
  );
};
// ===== END BADGE SYSTEM =====

const Auth = () => {
  const { t } = useTranslation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFCFB] p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full"
      >
        <div className="mb-8 flex justify-center">
          <Logo size={64} />
        </div>

        {IS_CLERK_ENABLED ? (
          <div className="flex flex-col items-center">
            <SignIn 
              signUpUrl="/sign-up"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#1A1A1A] text-white hover:bg-black transition-all rounded-lg font-bold py-3 text-sm h-12',
                  card: 'shadow-none border-none bg-transparent',
                  headerTitle: 'font-display font-bold text-2xl tracking-tight text-[#1A1A1A] mt-4',
                  headerSubtitle: 'text-black/40 text-sm font-medium mb-6',
                  socialButtonsBlockButton: 'border border-black/10 rounded-lg hover:bg-black/5 transition-all h-12 mb-2',
                  socialButtonsBlockButtonText: 'font-medium text-sm text-[#1A1A1A]',
                  formFieldInput: 'border border-black/10 rounded-lg bg-white p-3 text-sm focus:ring-1 focus:ring-black/20 focus:border-black transition-all h-12',
                  footerActionLink: 'text-black font-bold hover:underline',
                  dividerRow: 'my-6',
                  dividerText: 'text-xs text-black/20 font-bold uppercase tracking-widest'
                }
              }}
            />
            {!ENV_CLERK_KEY && (
              <p className="mt-4 text-[10px] text-black/30 font-medium italic">
                {t('using_demo_auth', 'Using Demo Authentication Mode')}
              </p>
            )}
          </div>
        ) : (
          <div className="p-8 bg-white border border-black/5">
            <h2 className="text-xl font-bold mb-4">{t('welcome_back', 'مرحباً بعودتك')}</h2>
            <p className="text-sm text-black/60 mb-8">{t('please_fill_details', 'يرجى إدخال البيانات المذكورة للبدء')}</p>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="monochrome-button-outline w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              <span className="font-bold uppercase tracking-widest text-xs">{t('login_google', 'الدخول عبر جوجل')}</span>
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs border border-red-100 italic">
                {error}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-black/5 opacity-50">
              <p className="text-[10px] font-bold uppercase tracking-widest">
                Firebase Mode (Clerk key invalid)
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-black/5">
          <p className="text-[10px] uppercase tracking-widest text-black/30 font-bold">
            Hikaya &copy; 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string 
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-white p-8">
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="mb-8 text-sm text-black/60">{message}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className="monochrome-button flex-grow bg-red-600 hover:bg-red-700"
          >
            {t('delete')}
          </button>
          <button onClick={onClose} className="monochrome-button-outline flex-grow">{t('cancel')}</button>
        </div>
      </motion.div>
    </div>
  );
};

const FileUploadComponent = ({ 
  path, 
  onUploadSuccess, 
  currentUrl, 
  label, 
  description 
}: { 
  path: string, 
  onUploadSuccess: (url: string) => void, 
  currentUrl?: string,
  label: string,
  description?: string
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file, `${path}/${Date.now()}_${file.name}`);
      onUploadSuccess(url);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{label}</label>
      <div className="flex gap-2 items-center">
        <input 
          type="file" 
          ref={inputRef}
          onChange={handleUpload}
          className="hidden"
        />
        <button 
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="monochrome-button text-[10px] px-4 py-2 flex items-center gap-2 border border-black/10 rounded"
        >
          {uploading ? (
            <div className="h-3 w-3 animate-spin border-2 border-black border-t-transparent rounded-full" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? t('uploading') : t('upload_file')}
        </button>
        {currentUrl && (
          <button 
            type="button"
            onClick={() => window.open(currentUrl, '_blank')}
            className="monochrome-button text-[10px] px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          >
            <Download size={14} />
            {t('open_folder')}
          </button>
        )}
      </div>
      {description && <p className="text-[9px] opacity-30 italic leading-relaxed">{description}</p>}
    </div>
  );
};

const PublishModal = ({ 
  isOpen, 
  onClose, 
  onPublish, 
  novelId,
  initialName,
  initialCover,
  showToast
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onPublish: (name: string, cover: string) => void,
  novelId: string,
  initialName?: string,
  initialCover?: string,
  showToast: (msg: string, type?: 'success' | 'error') => void
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName || '');
  const [cover, setCover] = useState(initialCover || '');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      const fileAsBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Compress first
      const compressed = await resizeAndCompressImage(fileAsBase64, 800, 1000, 0.7);

      try {
        const url = await uploadBase64Image(compressed, `covers/${novelId}.png`);
        setCover(url);
      } catch (storageErr) {
        console.warn("Storage upload failed, falling back to base64", storageErr);
        setCover(compressed);
      }
    } catch (e: any) {
      console.error("Error processing cover", e);
      showToast(`${t('error_uploading_cover')} ${e.message || t('unknown_error')}`, 'error');
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white p-8">
        <h3 className="mb-6 text-2xl font-bold">{t('publish_settings')}</h3>
        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('author_name')}</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="monochrome-input" 
              placeholder={t('literary_name')} 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('novel_cover')}</label>
            <div className="flex items-center gap-4">
              <div className="h-32 w-24 shrink-0 border border-black/10 bg-black/5 flex items-center justify-center overflow-hidden">
                {cover ? (
                  <img src={cover} alt="Cover" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Logo size={32} className="opacity-10" />
                )}
              </div>
              <div className="flex-grow">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="hidden" 
                  id="cover-upload"
                />
                <label htmlFor="cover-upload" className="monochrome-button-outline cursor-pointer py-2 text-xs">
                  {uploading ? t('uploading') : t('upload_image')}
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => onPublish(name, cover)} 
              disabled={uploading}
              className="monochrome-button flex-grow"
            >
              {t('confirm_publish')}
            </button>
            <button onClick={onClose} className="monochrome-button-outline flex-grow">{t('cancel')}</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProfileView = ({ 
  uid, 
  currentUser, 
  currentUserId,
  onBack, 
  onOpenNovel, 
  onOpenProfile,
  onFollow, 
  onUnfollow, 
  isFollowing,
  showToast,
  setView,
  isPro,
  isAdmin
}: { 
  uid: string, 
  currentUser: any | null, 
  currentUserId: string | null,
  onBack: () => void, 
  onOpenNovel: (novel: Novel) => void,
  onOpenProfile: (uid: string) => void,
  onFollow: (uid: string) => void,
  onUnfollow: (uid: string) => void,
  isFollowing: boolean,
  showToast: (msg: string, type?: 'success' | 'error') => void,
  setView: (v: any) => void,
  isPro: boolean,
  isAdmin: boolean
}) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userNovels, setUserNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [followingList, setFollowingList] = useState<UserProfile[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [libraryCount, setLibraryCount] = useState(0);

  const handleDeleteUser = async () => {
    if (!isAdmin || !currentUserId) return;
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.")) {
      setIsDeletingUser(true);
      try {
        await api.updateUser(uid, { role: 'deleted' });
        showToast("تم حذف بيانات المستخدم بنجاح", "success");
        onBack();
      } catch(e: any) {
        showToast("فشل في حذف الحساب: " + e.message, "error");
      }
      setIsDeletingUser(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileData, novels, followers, following, stats] = await Promise.all([
          api.getUser(uid).catch(() => null),
          api.getNovels({ authorUid: uid, status: 'published' }),
          api.getFollowers(uid),
          api.getFollows(uid),
          api.getUserStats(uid),
        ]);
        if (cancelled) return;
        if (profileData) setProfile(profileData as UserProfile);
        setUserNovels(novels as Novel[]);
        setFollowersCount(stats.followersCount || 0);
        setFollowingCount(stats.followingCount || 0);
        setLibraryCount(stats.libraryCount || 0);

        const followerUids = followers.map((f: any) => f.followerUid);
        const followingUids = following.map((f: any) => f.followedUid);
        const [folProfiles, fingProfiles] = await Promise.all([
          Promise.all(followerUids.slice(0, 50).map((u: string) => api.getUser(u).catch(() => null))),
          Promise.all(followingUids.slice(0, 50).map((u: string) => api.getUser(u).catch(() => null))),
        ]);
        if (cancelled) return;
        setFollowers(folProfiles.filter(Boolean) as UserProfile[]);
        setFollowingList(fingProfiles.filter(Boolean) as UserProfile[]);
      } catch (e) {
        console.error("Error fetching profile data", e);
      }
      if (!cancelled) setLoading(false);
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, [uid]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?profileUid=${uid}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('profile_share_title', { name: profile?.displayName }),
          text: t('profile_share_text', { name: profile?.displayName }),
          url: shareUrl,
        });
      } catch (e) {
        console.error("Error sharing", e);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      showToast(t('link_copied', 'تم نسخ الرابط!'));
    }
  };

  if (loading) return <div className="flex py-20 justify-center"><div className="h-8 w-8 animate-spin border-4 border-black border-t-transparent"></div></div>;
  if (!profile) return (
    <div className="py-20 text-center space-y-4">
      <div className="text-4xl opacity-20">👤</div>
      <p className="text-lg font-bold opacity-40">{t('user_not_found', 'هذا الحساب غير مسجّل بعد')}</p>
      <p className="text-sm opacity-30">قد يكون المستخدم لم يسجّل دخوله في النظام الجديد بعد.</p>
      <button onClick={onBack} className="monochrome-button py-2 text-sm mt-4">
        {t('go_back', 'رجوع')}
      </button>
    </div>
  );

  const getLinkIcon = (url: string) => {
    const lowercaseUrl = url.toLowerCase();
    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) return <Youtube size={14} />;
    if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) return <Twitter size={14} />;
    if (lowercaseUrl.includes('instagram.com')) return <Instagram size={14} />;
    if (lowercaseUrl.includes('facebook.com')) return <Facebook size={14} />;
    if (lowercaseUrl.includes('github.com')) return <Github size={14} />;
    if (lowercaseUrl.includes('linkedin.com')) return <Linkedin size={14} />;
    return <Globe size={14} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl"
    >
      {/* Banner */}
      <div className="relative w-full h-40 sm:h-56 bg-gradient-to-br from-black/5 to-black/10 overflow-hidden">
        {(profile as any).bannerURL ? (
          <img
            src={(profile as any).bannerURL}
            alt={`${profile.displayName} banner`}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-stone-100 via-stone-50 to-white" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
      </div>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-xs sm:text-sm opacity-40 hover:opacity-100 transition-opacity">
          <ArrowLeft size={16} /> {t('back')}
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="monochrome-button-outline p-2 rounded-full active:scale-90"
            title={t('share_profile')}
          >
            <Share2 size={16} />
          </button>
          {isAdmin && currentUserId !== uid && (
            <button 
              onClick={handleDeleteUser}
              disabled={isDeletingUser}
              className="monochrome-button-outline !text-red-500 !border-red-200 p-2 rounded-full active:scale-90 disabled:opacity-50"
              title="حذف هذا الحساب نهائياً (صلاحية المسؤول)"
            >
              {isDeletingUser ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
          )}
          {currentUserId && currentUserId !== uid && (
            <button 
              onClick={() => isFollowing ? onUnfollow(uid) : onFollow(uid)}
              className={`monochrome-button px-6 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm active:scale-95 ${isFollowing ? 'bg-black/5 !text-black border border-black/10' : ''}`}
            >
              {isFollowing ? (
                <><UserCheck size={16} /> {t('following')}</>
              ) : (
                <><UserPlus size={16} /> {t('follow')}</>
              )}
            </button>
          )}
          {currentUserId && currentUserId === uid && (
            <button 
              onClick={() => setView('settings')}
              className="monochrome-button-outline p-2 rounded-full active:scale-90"
              title={t('settings')}
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="mb-12 flex flex-col items-center text-center sm:flex-row sm:text-start gap-6 sm:gap-10">
        <div className="relative group flex flex-col items-center">
          <div className="relative">
            <div 
              className="h-24 w-24 sm:h-32 sm:w-32 overflow-hidden border border-black/5 bg-white flex items-center justify-center text-4xl sm:text-6xl"
              style={{ fontFamily: profile.fontFamily || 'var(--font-serif)' }}
            >
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profile.displayName ? profile.displayName[0].toUpperCase() : '?'
              )}
            </div>
            {(() => {
              const badge = getBadgeType(libraryCount, followersCount, userNovels.length, (profile as any).manualBadge);
              return badge ? (
                <div className="absolute -top-1 -right-1 z-10 bg-white rounded-full p-0.5 shadow-sm">
                  <BadgeIcon type={badge} />
                </div>
              ) : null;
            })()}
          </div>
          {isAdmin && currentUserId !== uid && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <span className="bg-red-100 text-red-600 text-[10px] px-3 py-1 uppercase tracking-widest leading-none font-bold whitespace-nowrap rounded-sm">
                {t('admin_privileges_active', 'صلاحيات المسؤول نشطة')}
              </span>
              <div className="flex gap-1 flex-wrap justify-center">
                {(['reader', 'writer', 'both', 'none'] as const).map((b) => {
                  const currentManual = (profile as any).manualBadge;
                  const symbols: Record<string, string> = { reader: '✦', writer: '✧', both: '𖣘', none: '✕' };
                  const labels: Record<string, string> = { reader: 'قارئ مميز', writer: 'كاتب مميز', both: 'قارئ وكاتب', none: 'إزالة' };
                  const isActive = b === 'none' ? !currentManual : currentManual === b;
                  return (
                    <button
                      key={b}
                      title={labels[b]}
                      onClick={async () => {
                        try {
                          await api.updateUser(uid, { manualBadge: b === 'none' ? null : b });
                        } catch (e: any) {
                          showToast('فشل تعيين الشارة: ' + e.message, 'error');
                        }
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded border font-bold transition-all ${isActive ? 'bg-black text-white border-black' : 'bg-white text-black border-black/20 hover:border-black'}`}
                    >
                      {symbols[b]} {labels[b]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex-grow text-center sm:text-start">
          <h2 className="mb-2 text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#1A1A1A]">
            {profile.displayName}
          </h2>
          <p className="mb-4 text-black/40 text-sm sm:text-base max-w-md mx-auto sm:mx-0">{profile.bio || t('no_bio')}</p>

          {profile.teraboxLink && currentUserId === profile.uid && (
            <div className="mb-4 flex justify-center sm:justify-start">
              <button 
                onClick={() => window.open(profile.teraboxLink, '_blank')}
                className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all hover:bg-black hover:text-white"
              >
                <Cloud size={14} /> {t('cloud_assets', 'الأصول السحابية')}
              </button>
            </div>
          )}
            <div className="mb-6 flex flex-wrap justify-center sm:justify-start gap-2">
              {(profile.links || []).map((link, idx) => (
                <button 
                  key={idx}
                  onClick={() => window.open(link.url.startsWith('http') ? link.url : `https://${link.url}`, '_blank')}
                  className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-[10px] font-bold transition-all hover:bg-black hover:text-white"
                  title={link.title}
                >
                  {getLinkIcon(link.url)}
                  {link.title}
                </button>
              ))}
            </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-10">
            <div className="text-center sm:text-start">
              <div className="text-xl sm:text-2xl font-display font-bold">{userNovels.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-black/30 font-bold">{t('novels')}</div>
            </div>
            <button 
              onClick={() => setShowFollowers(true)}
              className="text-center sm:text-start cursor-pointer hover:opacity-70 transition-opacity"
            >
              <div className="text-xl sm:text-2xl font-display font-bold">{followersCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-black/30 font-bold">{t('followers')}</div>
            </button>
            <button
              onClick={() => setShowFollowingList(true)}
              className="text-center sm:text-start cursor-pointer hover:opacity-70 transition-opacity"
            >
              <div className="text-xl sm:text-2xl font-display font-bold">{followingCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-black/30 font-bold">{t('following_count')}</div>
            </button>
          </div>
        </div>
      </div>

      {(showFollowers || showFollowingList) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => { setShowFollowers(false); setShowFollowingList(false); }}>
          <div className="w-full max-w-md bg-white p-6 relative max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 left-4 opacity-50 hover:opacity-100" onClick={() => { setShowFollowers(false); setShowFollowingList(false); }}>
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold font-serif mb-6 text-center">
              {showFollowers ? t('followers', 'المتابعون') : t('following_count', 'أتابع')}
            </h3>
            <div className="overflow-y-auto pr-2 space-y-4">
              {(showFollowers ? followers : followingList).length === 0 ? (
                <div className="text-center text-black/40 py-8">لا يوجد أي مستخدمين هنا.</div>
              ) : (
                (showFollowers ? followers : followingList).map(u => (
                  <button 
                    key={u.uid} 
                    onClick={() => { 
                      setShowFollowers(false); 
                      setShowFollowingList(false);
                      onOpenProfile(u.uid); 
                    }}
                    className="flex w-full items-center gap-3 hover:bg-black/5 p-2 rounded transition-colors text-right"
                  >
                    <div 
                      className="h-10 w-10 shrink-0 overflow-hidden bg-white border border-black/10 flex items-center justify-center font-bold"
                      style={{ fontFamily: u.fontFamily || 'var(--font-serif)' }}
                    >
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        u.displayName ? u.displayName[0].toUpperCase() : '?'
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="font-bold text-sm">{u.displayName}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 border-b border-black/5 pb-4">
        <h3 className="text-lg sm:text-xl font-display font-bold tracking-tight">{t('published_novels')}</h3>
      </div>

      <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {userNovels.map(novel => (
          <div 
            key={novel.id} 
            onClick={() => onOpenNovel(novel)}
            className="flex flex-col gap-3 group cursor-pointer"
          >
            <div className="aspect-[2/3] w-full bg-black/5 flex items-center justify-center border border-black/5 overflow-hidden shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              {novel.coverImage ? (
                <img src={novel.coverImage} alt={novel.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
              ) : (
                <Logo size={40} className="opacity-10" />
              )}
            </div>
            <div className="text-right">
              <span className="text-[8px] uppercase tracking-widest text-black/40 font-bold mb-1 block">{t(novel.genre)}</span>
              <h4 className="text-sm font-bold line-clamp-1 leading-tight">{novel.title}</h4>
            </div>
          </div>
        ))}
        {userNovels.length === 0 && (
          <div className="col-span-full py-20 text-center text-black/20">
            <Logo size={64} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm">{t('no_published_novels')}</p>
          </div>
        )}
      </div>
    </div>{/* end px-4 content */}
    </motion.div>
  );
};

const FollowingView = ({ 
  profiles, 
  onOpenProfile, 
  onBack,
  currentUser
}: { 
  profiles: UserProfile[], 
  onOpenProfile: (uid: string) => void,
  onBack: () => void,
  currentUser: any | null
}) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl px-6 py-12"
    >
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-black/50 hover:text-black">
        <ArrowLeft size={20} /> <span>{t('back_to_library', 'العودة للمكتبة')}</span>
      </button>

      <div className="mb-12">
        <h2 className="text-4xl font-serif font-bold">{t('following')}</h2>
        <p className="text-black/50">{t('following_slogan', 'اكتشف جديد الكتاب المفضلين لديك.')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map(profile => (
          <button 
            key={profile.uid}
            onClick={() => onOpenProfile(profile.uid)}
            disabled={profile.uid === currentUser?.uid}
            className={`monochrome-card flex items-center gap-4 transition-all ${profile.uid === currentUser?.uid ? 'opacity-50 cursor-not-allowed' : 'hover:border-black'}`}
          >
            <div 
              className="h-12 w-12 shrink-0 overflow-hidden bg-white border border-black/5 flex items-center justify-center text-xl"
              style={{ fontFamily: profile.fontFamily || 'var(--font-serif)' }}
            >
              {profile.displayName ? profile.displayName[0].toUpperCase() : '?'}
            </div>
            <div className="text-right">
              <div className="font-bold">{profile.displayName}</div>
              <div className="text-[10px] text-black/40">
                {profile.uid === currentUser?.uid ? t('this_is_you', 'هذا أنت') : t('view_profile', 'عرض الملف الشخصي')}
              </div>
            </div>
          </button>
        ))}
        {profiles.length === 0 && (
          <div className="col-span-full py-20 text-center text-black/30">
            {t('no_following_message', 'أنت لا تتابع أحداً بعد. استكشف الروايات لتجد كتابك المفضلين!')}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CommentsSection = ({ novelId, chapterId, currentUser, currentUserId, isAdmin, onDeleteComment }: { 
  novelId: string, 
  chapterId: string, 
  currentUser: any | null,
  currentUserId: string | null,
  isAdmin: boolean,
  onDeleteComment: (commentId: string) => void
}) => {
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getComments(novelId, chapterId).then(setComments).catch(console.error);
  }, [novelId, chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const created = await api.createComment(novelId, chapterId, {
        novelId,
        chapterId,
        authorUid: currentUserId,
        authorName: currentUser?.displayName || currentUser?.fullName || t('anonymous_user'),
        authorPhoto: currentUser?.photoURL || currentUser?.imageUrl || '',
        text: newComment.trim(),
      });
      setComments(prev => [...prev, created]);
      setNewComment('');
    } catch (e) {
      console.error('Comment submit failed:', e);
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-12 border-t border-black/10 pt-12">
      <h3 className="mb-8 flex items-center gap-2 text-xl font-bold">
        <MessageSquare size={20} /> {t('comments')} ({comments.length})
      </h3>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-12">
          <textarea 
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={t('leave_comment_placeholder')}
            className="monochrome-input mb-4 min-h-[100px] resize-none"
          />
          <button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="monochrome-button"
          >
            {submitting ? t('posting') : t('post_comment')}
          </button>
        </form>
      ) : (
        <div className="mb-12 rounded-xl bg-black/5 p-8 text-center">
          <p className="text-black/50">{t('login_to_comment')}</p>
        </div>
      )}

      <div className="space-y-8">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-black/5">
              {comment.authorPhoto ? (
                <img src={comment.authorPhoto} alt={comment.authorName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-black/20">
                  <UserIcon size={20} />
                </div>
              )}
            </div>
            <div className="flex-grow text-right">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{comment.authorName}</span>
                  {(isAdmin || (currentUserId && currentUserId === comment.authorUid)) && (
                    <button 
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title={t('delete_comment')}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <span className="text-[10px] opacity-30">
                  {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') : t('now')}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-black/70">{comment.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="py-8 text-center text-black/20">{t('no_comments_yet', 'لا توجد تعليقات بعد. كن أول من يعلق!')}</p>
        )}
      </div>
    </div>
  );
};

const LibraryView = ({ library, novels, readingProgress, onOpenNovel, isGuest }: { 
  library: LibraryItem[], 
  novels: Novel[], 
  readingProgress: ReadingProgress[],
  onOpenNovel: (n: Novel) => void,
  isGuest?: boolean
}) => {
  const { t } = useTranslation();
  const libraryNovels = Array.from(new Map(novels.map(n => [n.id, n])).values())
    .filter((n: Novel) => library.some(l => l.novelId === n.id));

  const getProgress = (novelId: string) => {
    return readingProgress.find(p => p.novelId === novelId);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#1A1A1A]">{t('library')}</h2>
        <p className="text-black/40 text-xs sm:text-sm font-medium">{t('library_slogan', 'رواياتك المفضلة في مكان واحد')}</p>
        {isGuest && (
          <p className="mt-2 text-xs text-amber-600/70 font-medium">
            {t('guest_library_notice', 'أنت تتصفح كزائر — ستختفي المفضلة عند إغلاق الصفحة. سجّل دخولك لحفظها.')}
          </p>
        )}
      </div>

      <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {libraryNovels.map(novel => {
          const progress = getProgress(novel.id);

          return (
            <div 
              key={novel.id} 
              onClick={() => onOpenNovel(novel)}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              <div className="aspect-[2/3] w-full bg-black/5 flex items-center justify-center border border-black/5 overflow-hidden shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 relative">
                {novel.coverImage ? (
                  <img src={novel.coverImage} alt={novel.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                ) : (
                  <Logo size={40} className="opacity-10" />
                )}
                {progress && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-black/60" style={{ width: '100%' }} />
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[8px] uppercase tracking-widest text-black/40 font-bold">{t(novel.genre)}</span>
                  {progress && (
                    <span className="text-[8px] font-bold text-black/30">{t('chapter')} {progress.lastChapterOrder}</span>
                  )}
                </div>
                <h4 className="text-sm font-bold line-clamp-1 leading-tight">{novel.title}</h4>
              </div>
            </div>
          );
        })}
        {libraryNovels.length === 0 && (
          <div className="col-span-full py-20 text-center text-black/20">
            <Bookmark size={64} strokeWidth={1} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm">{t('no_novels_in_library')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Main App ---

const ENV_CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const FALLBACK_CLERK_KEY = "pk_test_c2F2aW5nLWNyYXdkYWQtNzkuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Use environment key if it looks valid, otherwise use fallback
const CLERK_PUBLISHABLE_KEY = (ENV_CLERK_KEY && (ENV_CLERK_KEY.startsWith("pk_test_") || ENV_CLERK_KEY.startsWith("pk_live_"))) 
  ? ENV_CLERK_KEY 
  : FALLBACK_CLERK_KEY;

const IS_CLERK_ENABLED = true; // Always enable Clerk as the primary auth provider

export default function App() {
  if (!IS_CLERK_ENABLED) {
    return (
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ErrorBoundary>
        <MainAppWrapper />
      </ErrorBoundary>
    </ClerkProvider>
  );
}

function MainAppWrapper() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  return <MainApp clerkUser={clerkUser} isClerkLoaded={isClerkLoaded} clerkSignOut={clerkSignOut} />;
}

function MainApp({ clerkUser, isClerkLoaded, clerkSignOut }: { clerkUser?: any, isClerkLoaded?: boolean, clerkSignOut?: any }) {
  const { t, i18n } = useTranslation();
  const [user] = useState<any | null>(null);
  const [onboardingTeraBox, setOnboardingTeraBox] = useState('');
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);

  const isClerkEnabled = IS_CLERK_ENABLED;

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const STATIC_PAGES = ['about', 'privacy', 'terms', 'contact', 'sitemap'] as const;
  const [view, setView] = useState<'dashboard' | 'explore' | 'novel' | 'editor' | 'characters' | 'settings' | 'reader' | 'profile' | 'following' | 'search' | 'library' | 'privacy' | 'terms' | 'about' | 'contact' | 'ai-writer' | 'ai-books' | 'most-read' | 'sitemap'>(() => {
    const hash = window.location.hash.replace('#', '');
    return (STATIC_PAGES as readonly string[]).includes(hash) ? hash as any : 'explore';
  });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if ((STATIC_PAGES as readonly string[]).includes(hash)) {
        setView(hash as any);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedProfileUid, setSelectedProfileUid] = useState<string | null>(null);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [publicNovels, setPublicNovels] = useState<Novel[]>([]);
  const [exploreLanguageFilter, setExploreLanguageFilter] = useState<'all' | 'ar' | 'en' | 'most-read'>('all');
  const [publicUsers, setPublicUsers] = useState<UserProfile[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
  const [followingProfiles, setFollowingProfiles] = useState<UserProfile[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [guestLibrary, setGuestLibrary] = useState<string[]>([]);
  const [guestFollows, setGuestFollows] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [showNewNovelModal, setShowNewNovelModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ novels: Novel[], users: UserProfile[] }>({ novels: [], users: [] });

  // Use Clerk user if enabled, otherwise Firebase user
  const effectiveUserId = isClerkEnabled ? clerkUser?.id : user?.uid;
  const effectiveEmail = isClerkEnabled ? clerkUser?.primaryEmailAddress?.emailAddress : user?.email;
  const isAdmin = effectiveEmail === 'ahmad.meshaal.2040@gmail.com' || userProfile?.role === 'admin';

  const isPro = true;
  const [searching, setSearching] = useState(false);
  const [newNovelTitle, setNewNovelTitle] = useState('');
  const [newNovelLanguage, setNewNovelLanguage] = useState<'ar' | 'en'>('ar');
  const [newNovelViolence, setNewNovelViolence] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [newNovelMoral, setNewNovelMoral] = useState<'moral' | 'neutral' | 'dark'>('neutral');
  const [newNovelSummary, setNewNovelSummary] = useState('');
  const [newNovelGenre, setNewNovelGenre] = useState('drama');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [showWordUploadModal, setShowWordUploadModal] = useState(false);
  const [wordUploading, setWordUploading] = useState(false);
  const [wordUploadFile, setWordUploadFile] = useState<File | null>(null);
  const [wordUploadTitle, setWordUploadTitle] = useState('');
  const [wordUploadCover, setWordUploadCover] = useState('');
  const [wordUploadAuthorName, setWordUploadAuthorName] = useState('');
  const [wordUploadLanguage, setWordUploadLanguage] = useState<'ar' | 'en'>('ar');
  const [wordUploadStep, setWordUploadStep] = useState<'file' | 'details' | 'processing'>('file');

  useEffect(() => {
    if (isClerkEnabled && isClerkLoaded) {
      setLoading(false);
    }
  }, [isClerkLoaded, isClerkEnabled]);

  // Clerk Profile Sync — create new user OR load existing saved profile
  useEffect(() => {
    if (!clerkUser) return;

    const genUsername = () => {
      if (clerkUser.username) return clerkUser.username.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (clerkUser.fullName) return clerkUser.fullName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 30);
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      return email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30);
    };

    // First check if this user already exists in the database
    api.getUser(clerkUser.id)
      .then(existing => {
        if (existing) {
          // ✅ Existing user — load their saved profile data, do NOT overwrite it
          setUserProfile(existing as UserProfile);
        } else {
          // 🆕 New user — create a record using Clerk defaults; user can edit later in Settings
          api.upsertUser({
            uid: clerkUser.id,
            username: genUsername(),
            displayName: clerkUser.fullName || clerkUser.username || t('unknown_author', 'كاتب مجهول'),
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            photoURL: clerkUser.imageUrl || '',
          })
            .then(created => { if (created) setUserProfile(created as UserProfile); })
            .catch(e => console.warn('Profile creation failed:', e));
        }
      })
      .catch(() => {
        // getUser threw (e.g. 404) — treat as new user and create
        api.upsertUser({
          uid: clerkUser.id,
          username: genUsername(),
          displayName: clerkUser.fullName || clerkUser.username || t('unknown_author', 'كاتب مجهول'),
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          photoURL: clerkUser.imageUrl || '',
        })
          .then(created => { if (created) setUserProfile(created as UserProfile); })
          .catch(e => console.warn('Profile creation failed:', e));
      });
  }, [clerkUser?.id]);

  // Load user profile (fallback refresh when effectiveUserId changes)
  useEffect(() => {
    if (!effectiveUserId) { setUserProfile(null); return; }
    // Only fetch if profile isn't already loaded for this user
    setUserProfile(prev => {
      if (prev && (prev as any).uid === effectiveUserId) return prev;
      api.getUser(effectiveUserId).then(data => {
        if (data) setUserProfile(data as UserProfile);
      }).catch(console.error);
      return prev;
    });
  }, [effectiveUserId]);

  // Load follows & following profiles
  useEffect(() => {
    if (!effectiveUserId) return;
    api.getFollows(effectiveUserId).then(async rows => {
      setFollows(rows as Follow[]);
      if (rows.length > 0) {
        const profiles = await Promise.all(rows.map((f: any) => api.getUser(f.followedUid).catch(() => null)));
        setFollowingProfiles(profiles.filter(Boolean) as UserProfile[]);
      } else {
        setFollowingProfiles([]);
      }
    }).catch(console.error);
  }, [effectiveUserId]);

  // Load library
  useEffect(() => {
    if (!effectiveUserId) return;
    api.getLibrary(effectiveUserId).then(rows => setLibrary(rows as LibraryItem[])).catch(console.error);
  }, [effectiveUserId]);

  // Load reading progress
  useEffect(() => {
    if (!effectiveUserId) return;
    api.getProgress(effectiveUserId).then(rows => setReadingProgress(rows as ReadingProgress[])).catch(console.error);
  }, [effectiveUserId]);

  // Refresh selected novel when it changes
  useEffect(() => {
    if (!selectedNovel?.id) return;
    api.getNovel(selectedNovel.id).then(data => { if (data) setSelectedNovel(data as Novel); }).catch(console.error);
  }, [selectedNovel?.id]);

  // Load user's own novels
  useEffect(() => {
    if (!effectiveUserId) return;
    api.getNovels({ authorUid: effectiveUserId }).then(rows => setNovels(rows as Novel[])).catch(console.error);
  }, [effectiveUserId]);

  // Load public novels (published)
  useEffect(() => {
    api.getNovels({ status: 'published' }).then(rows => setPublicNovels(rows as Novel[])).catch(console.error);
  }, []);

  // Load public users
  useEffect(() => {
    api.getUsers().then(rows => setPublicUsers(rows as UserProfile[])).catch(console.error);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setView('search');
    try {
      const queryLower = searchQuery.toLowerCase();

      // Search Novels (client-side filter)
      const filteredNovels = publicNovels.filter(n => 
        n.title.toLowerCase().includes(queryLower) || 
        (n.summary && n.summary.toLowerCase().includes(queryLower)) ||
        (n.authorName && n.authorName.toLowerCase().includes(queryLower))
      );

      // Search Users (client-side filter for case-insensitivity)
      const filteredUsers = publicUsers.filter(u => 
        u.displayName.toLowerCase().includes(queryLower) ||
        (u.bio && u.bio.toLowerCase().includes(queryLower))
      );

      setSearchResults({ novels: filteredNovels, users: filteredUsers });
    } catch (e) {
      console.error(e);
    }
    setSearching(false);
  };

  // Handle URL parameters for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const novelId = params.get('novelId');
    const profileUid = params.get('profileUid');
    const username = params.get('username');

    if (novelId) {
      api.getNovel(novelId).then(data => {
        if (data) { setSelectedNovel(data as Novel); setView('novel'); }
      }).catch(console.error);
    } else if (username) {
      api.getUserByUsername(username.toLowerCase()).then(data => {
        if (data) { setSelectedProfileUid((data as any).uid); setView('profile'); }
      }).catch(console.error);
    } else if (profileUid) {
      setSelectedProfileUid(profileUid);
      setView('profile');
    }
  }, []);

  if (loading) return <Loading />;

  // All views are publicly accessible — required for AdSense crawlers.
  // The publicViews list covers every route so the Auth redirect never fires.
  // Protected ACTIONS (create novel, edit settings, etc.) are guarded inline.
  const publicViews = [
    'explore', 'reader', 'profile', 'search', 'novel',
    'library', 'following', 'dashboard', 'settings',
    'editor', 'characters', 'about', 'contact', 'privacy', 'terms', 'sitemap'
  ];

  if (!effectiveUserId && !publicViews.includes(view)) {
    return <Auth />;
  }

  // Handle case where user is logged in but email is not verified (for password auth)
  const verificationOnlyViews = ['settings', 'dashboard', 'editor', 'characters'];
  if (!isClerkEnabled && user && !user.emailVerified && (user.providerData as any[]).some((p: any) => p.providerId === 'password') && verificationOnlyViews.includes(view)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFCFB] p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <div className="mb-8 flex justify-center">
            <Logo size={64} />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-[#1A1A1A]">{t('verify_email_title', 'يرجى تفعيل حسابك')}</h1>
          <p className="mb-8 text-[#1A1A1A]/60 text-sm">
            {t('verify_email_desc', 'لقد أرسلنا رابط تفعيل إلى بريدك الإلكتروني. يرجى الضغط عليه لتتمكن من استخدام التطبيق.')}
            <br />
            <strong className="block mt-2">{t('check_spam', 'تأكد من فحص البريد المزعج (Spam Folder)')}</strong>
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => {
                const actionCodeSettings = { url: window.location.origin, handleCodeInApp: true };
                console.log('sendEmailVerification not available in Clerk mode');
              }} 
              className="monochrome-button w-full py-3"
            >
              {t('resend_verification', 'إعادة إرسال رابط التفعيل')}
            </button>
            <button 
              onClick={async () => {
                if (isClerkEnabled) {
                  await clerkSignOut();
                } else {
                  await signOut(auth);
                }
              }} 
              className="monochrome-button-outline w-full py-3"
            >
              {t('sign_out', 'تسجيل الخروج')}
            </button>
            <button 
              onClick={async () => {
                if (user) {
                  await user.reload();
                  window.location.reload();
                }
              }} 
              className="flex items-center justify-center gap-2 w-full text-sm text-black/40 hover:text-black mt-4"
            >
              <RefreshCw size={14} /> {t('refresh_after_verify', 'لقد قمت بالتفعيل، حدث الصفحة')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const createNovel = async () => {
    if (!effectiveUserId) return;
    try {
      await api.createNovel({
        authorUid: effectiveUserId,
        title: newNovelTitle.trim(),
        genre: t('drama', 'دراما'),
        summary: '',
        status: 'draft',
        likesCount: 0,
        viewsCount: 0,
        sharesCount: 0,
        language: newNovelLanguage,
        violenceLevel: newNovelViolence,
        moralTone: newNovelMoral,
        fontFamily: 'var(--font-serif)',
        fontSize: '1.125rem',
        textAlign: 'right',
        lineHeight: '1.75',
      });
      setNewNovelTitle('');
      setNewNovelLanguage('ar');
      setNewNovelViolence('none');
      setNewNovelMoral('neutral');
      setShowNewNovelModal(false);
      // Refresh novels
      api.getNovels({ authorUid: effectiveUserId }).then(rows => setNovels(rows as Novel[])).catch(console.error);
    } catch (e: any) {
      showToast('فشل في إنشاء الرواية: ' + e.message, 'error');
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => res();
            script.onerror = () => rej(new Error('فشل تحميل مكتبة PDF'));
            document.head.appendChild(script);
          });
        }
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    });
  };

  const uploadWordNovel = async () => {
    if (!effectiveUserId || !wordUploadFile || !wordUploadTitle.trim()) return;
    setWordUploadStep('processing');
    setWordUploading(true);
    try {
      const arrayBuffer = await wordUploadFile.arrayBuffer();
      const isPDF = wordUploadFile.name.toLowerCase().endsWith('.pdf') || wordUploadFile.type === 'application/pdf';
      let rawText = '';
      if (isPDF) {
        rawText = await extractTextFromPDF(arrayBuffer);
      } else {
        const result = await mammoth.extractRawText({ arrayBuffer });
        rawText = result.value;
      }

      const chapterPatterns = [
        /^(الفصل\s+[\u0660-\u0669\d]+[:\s]*.*?)$/gm,
        /^(Chapter\s+\d+[:\s]*.*?)$/gim,
        /^(الجزء\s+[\u0660-\u0669\d]+[:\s]*.*?)$/gm,
        /^(\d+[.\-\s]+.*?)$/gm,
      ];

      let sections: { title: string; content: string }[] = [];
      let matched = false;

      for (const pattern of chapterPatterns) {
        const parts = rawText.split(pattern);
        if (parts.length > 2) {
          matched = true;
          let i = 1;
          while (i < parts.length - 1) {
            const title = parts[i].trim();
            const content = (parts[i + 1] || '').trim();
            if (title && content) sections.push({ title, content });
            i += 2;
          }
          break;
        }
      }

      if (!sections.length) {
        const paragraphs = rawText.split(/\n{2,}/).filter(p => p.trim().length > 50);
        const chunkSize = Math.ceil(paragraphs.length / Math.max(1, Math.ceil(paragraphs.length / 20)));
        for (let i = 0; i < paragraphs.length; i += chunkSize) {
          const chunk = paragraphs.slice(i, i + chunkSize).join('\n\n');
          sections.push({ title: `الفصل ${sections.length + 1}`, content: chunk });
        }
      }

      const novelRef = await api.createNovel({
        authorUid: effectiveUserId,
        authorName: wordUploadAuthorName.trim() || userProfile?.displayName || t('unknown_author'),
        title: wordUploadTitle.trim(),
        genre: 'drama',
        summary: sections[0]?.content?.slice(0, 300) + '...' || '',
        status: 'draft',
        likesCount: 0,
        viewsCount: 0,
        sharesCount: 0,
        language: wordUploadLanguage,
        violenceLevel: 'none',
        moralTone: 'neutral',
        fontFamily: 'var(--font-serif)',
        fontSize: '1.125rem',
        textAlign: wordUploadLanguage === 'ar' ? 'right' : 'left',
        lineHeight: '1.75',
        coverImage: wordUploadCover || '',
      });

      for (let i = 0; i < sections.length; i++) {
        await api.createChapter(novelRef.id, {
          novelId: novelRef.id,
          title: sections[i].title,
          content: sections[i].content,
          description: '',
          order: i + 1,
        });
      }
      api.getNovels({ authorUid: effectiveUserId }).then(rows => setNovels(rows as Novel[])).catch(console.error);

      showToast(`تم رفع الرواية بنجاح! تم إنشاء ${sections.length} فصل`, 'success');
      setShowWordUploadModal(false);
      setWordUploadStep('file');
      setWordUploadFile(null);
      setWordUploadTitle('');
      setWordUploadAuthorName('');
      setWordUploadCover('');
    } catch (e: any) {
      console.error('Word upload failed:', e);
      showToast('فشل في رفع الملف: ' + (e.message || 'خطأ غير معروف'), 'error');
      setWordUploadStep('details');
    }
    setWordUploading(false);
  };

  const deleteNovel = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: t('delete_novel_confirm_title', 'حذف الرواية'),
      message: t('delete_novel_confirm_message', 'هل أنت متأكد من حذف هذه الرواية؟ سيتم حذف جميع الفصول والشخصيات المرتبطة بها نهائياً.'),
      onConfirm: async () => {
        try {
          await api.deleteNovel(id);
          if (selectedNovel?.id === id) {
            setView('dashboard');
            setSelectedNovel(null);
          }
          if (effectiveUserId) api.getNovels({ authorUid: effectiveUserId }).then(rows => setNovels(rows as Novel[]));
        } catch (e: any) {
          showToast('فشل في حذف الرواية: ' + e.message, 'error');
        }
      }
    });
  };

  const deleteComment = async (novelId: string, chapterId: string, commentId: string) => {
    setConfirmModal({
      isOpen: true,
      title: t('delete_comment_confirm_title', 'حذف التعليق'),
      message: t('delete_comment_confirm_message', 'هل أنت متأكد من حذف هذا التعليق؟'),
      onConfirm: async () => {
        try {
          await api.deleteComment(novelId, chapterId, commentId);
          showToast(t('comment_deleted_success', 'تم حذف التعليق بنجاح.'));
        } catch (e: any) {
          showToast(t('error_deleting_comment', 'فشل حذف التعليق.'), 'error');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const incrementStat = async (novelId: string, stat: 'likesCount' | 'viewsCount' | 'sharesCount') => {
    try {
      if (stat === 'viewsCount') {
        const viewedKey = `viewed_${novelId}`;
        if (localStorage.getItem(viewedKey)) return;
        localStorage.setItem(viewedKey, 'true');
      }
      await api.incrementStat(novelId, stat, effectiveUserId || undefined);
    } catch (e) {
      console.error('incrementStat failed', e);
    }
  };

  const followAuthor = async (authorUid: string) => {
    if (effectiveUserId === authorUid) return;
    if (!effectiveUserId) {
      setGuestFollows(prev => prev.includes(authorUid) ? prev : [...prev, authorUid]);
      return;
    }
    try {
      await api.followUser(effectiveUserId, authorUid);
      api.getFollows(effectiveUserId).then(rows => setFollows(rows as Follow[]));
    } catch (e: any) {
      showToast('فشل المتابعة: ' + e.message, 'error');
    }
  };

  const unfollowAuthor = async (authorUid: string) => {
    if (!effectiveUserId) {
      setGuestFollows(prev => prev.filter(uid => uid !== authorUid));
      return;
    }
    try {
      await api.unfollowUser(effectiveUserId, authorUid);
      setFollows(prev => prev.filter(f => f.followedUid !== authorUid));
    } catch (e: any) {
      showToast('فشل إلغاء المتابعة: ' + e.message, 'error');
    }
  };

  const addToLibrary = async (novelId: string) => {
    if (!effectiveUserId) {
      setGuestLibrary(prev => prev.includes(novelId) ? prev : [...prev, novelId]);
      return;
    }
    try {
      await api.addToLibrary(effectiveUserId, novelId);
      api.getLibrary(effectiveUserId).then(rows => setLibrary(rows as LibraryItem[]));
    } catch (e: any) {
      showToast('فشل إضافة للمكتبة: ' + e.message, 'error');
    }
  };

  const removeFromLibrary = async (novelId: string) => {
    if (!effectiveUserId) {
      setGuestLibrary(prev => prev.filter(id => id !== novelId));
      return;
    }
    try {
      await api.removeFromLibrary(effectiveUserId, novelId);
      setLibrary(prev => prev.filter(l => l.novelId !== novelId));
    } catch (e: any) {
      showToast('فشل الحذف من المكتبة: ' + e.message, 'error');
    }
  };

  const updateReadingProgress = async (novelId: string, chapterId: string, chapterOrder: number) => {
    if (!effectiveUserId) return;
    try {
      await api.upsertProgress(effectiveUserId, novelId, chapterId, chapterOrder);
    } catch (e) {
      console.error('updateReadingProgress failed', e);
    }
  };

  const handleSaveOnboarding = async (isSkipping = false) => {
    if (!effectiveUserId || !userProfile) return;
    setIsSavingOnboarding(true);
    try {
      await api.updateUser(effectiveUserId, {
        teraboxLink: isSkipping ? '' : onboardingTeraBox.trim(),
        onboardingCompleted: true,
      });
      setUserProfile(prev => prev ? { ...prev, onboardingCompleted: true } : prev);
      showToast(isSkipping ? t('welcome_back') : t('settings_saved_success'), 'success');
    } catch (e: any) {
      showToast('فشل في الحفظ: ' + e.message, 'error');
    }
    setIsSavingOnboarding(false);
  };

  // Remove early return to avoid React Rules of Hooks error
  // if (userProfile && !userProfile.teraboxLink && !loading) { ... }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] pb-20 md:pb-0">
      {!loading ? (
        <>
          {/* Navigation - Top (Desktop) */}
          <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => {
                setView('explore');
                setSelectedNovel(null);
              }}
              className="flex items-center gap-2 transition-transform active:scale-95"
            >
              <Logo size={28} />
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight">{t('app_name')}</span>
            </button>
            <form onSubmit={handleSearch} className="relative flex-grow max-w-[120px] sm:max-w-xs">
              <input 
                type="text" 
                placeholder={t('search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-none border border-black/5 bg-black/5 py-1.5 sm:py-2 pl-3 pr-8 sm:pr-10 text-[10px] sm:text-sm focus:border-black/20 focus:outline-none transition-all"
              />
              <Search size={12} className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-black/20" />
            </form>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <button onClick={() => setView('explore')} className={`text-sm tracking-tight transition-all ${view === 'explore' ? 'font-bold' : 'opacity-40 hover:opacity-100'}`}>{t('explore')}</button>
            <button onClick={() => setView('library')} className={`text-sm tracking-tight transition-all ${view === 'library' ? 'font-bold' : 'opacity-40 hover:opacity-100'}`}>{t('library')}</button>
            {isClerkEnabled && (
              <SignedOut>
                <button 
                  onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
                  className="flex items-center gap-1 text-[10px] font-bold opacity-40 hover:opacity-100"
                >
                  <Globe size={14} />
                  {i18n.language === 'ar' ? 'EN' : 'AR'}
                </button>
                <SignInButton mode="modal">
                  <button className="monochrome-button px-4 py-1.5 text-[10px] uppercase tracking-widest">{t('login', 'تسجيل الدخول')}</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-black text-white rounded-full font-medium text-[10px] px-4 py-1.5 cursor-pointer hover:bg-black/90 transition-all uppercase tracking-widest">
                    {t('signup', 'إنشاء حساب')}
                  </button>
                </SignUpButton>
              </SignedOut>
            )}
            {isClerkEnabled && (
              <SignedIn>
                <button onClick={() => setView('dashboard')} className={`text-sm tracking-tight transition-all ${view === 'dashboard' ? 'font-bold' : 'opacity-40 hover:opacity-100'}`}>{t('write')}</button>
                <button 
                  onClick={() => {
                    setSelectedProfileUid(effectiveUserId);
                    setView('profile');
                  }} 
                  className={`flex items-center gap-2 transition-all ${view === 'profile' && selectedProfileUid === effectiveUserId ? 'font-bold' : 'opacity-40 hover:opacity-100'}`}
                >
                  <UserIcon size={18} />
                </button>
                {/* Settings only accessible from own profile or settings tab — never when viewing someone else's profile */}
                {!(view === 'profile' && selectedProfileUid && selectedProfileUid !== effectiveUserId) && (
                  <button onClick={() => setView('settings')} className={`transition-all ${view === 'settings' ? 'font-bold' : 'opacity-40 hover:opacity-100'}`}><Settings size={18} /></button>
                )}
                <div className="h-4 w-px bg-black/5"></div>
                <button 
                  onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
                  className="flex items-center gap-1 text-[10px] font-bold opacity-40 hover:opacity-100"
                >
                  <Globe size={14} />
                  {i18n.language === 'ar' ? 'EN' : 'AR'}
                </button>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            )}
            {!isClerkEnabled && effectiveUserId && (
              <button 
                onClick={async () => {
                  await signOut(auth);
                  setView('explore');
                }} 
                className="opacity-40 hover:opacity-100 hover:text-red-600"
              >
                <LogOut size={18} />
              </button>
            )}
            {!isClerkEnabled && !effectiveUserId && (
              <button onClick={() => setView('dashboard')} className="monochrome-button px-4 py-1.5 text-[10px] uppercase tracking-widest">{t('login')}</button>
            )}
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 text-[10px] font-bold opacity-40 hover:opacity-100"
            >
              <Globe size={14} />
              {i18n.language === 'ar' ? 'EN' : 'AR'}
            </button>
            {isClerkEnabled && (
              <>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-[10px] font-bold uppercase tracking-widest">{t('login')}</button>
                  </SignInButton>
                </SignedOut>
              </>
            )}
            {!isClerkEnabled && effectiveUserId && (
              <button 
                onClick={async () => {
                  await signOut(auth);
                  setView('explore');
                }} 
                className="opacity-40 hover:opacity-100 hover:text-red-600"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Navigation - Bottom (Mobile) */}
      <MobileNav view={view} setView={setView} t={t} userId={effectiveUserId} setSelectedProfileUid={setSelectedProfileUid} isPro={isPro} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-8 sm:mb-12 flex items-end justify-between">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">{t('write')}</h2>
                  <p className="text-black/40 text-xs sm:text-sm font-medium">{t('slogan')}</p>
                </div>

                <div className="flex gap-2 sm:gap-4">
                  {effectiveUserId ? (
                    <>
                      <button
                        onClick={() => setShowWordUploadModal(true)}
                        className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border border-black/20 text-black/60 hover:bg-black hover:text-white shadow-sm transition-all active:scale-95"
                        title="رفع ملف Word أو PDF"
                      >
                        <Upload size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => setShowNewNovelModal(true)} 
                        className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center bg-black text-white shadow-xl shadow-black/10 transition-all active:scale-95"
                        title={t('write')}
                      >
                        <Plus size={20} className="sm:w-6 sm:h-6" />
                      </button>
                    </>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all hover:bg-black hover:text-white">
                        <Plus size={14} /> {t('start_writing', 'ابدأ الكتابة')}
                      </button>
                    </SignInButton>
                  )}
                </div>
              </div>

              {showWordUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white p-8">
                    <h3 className="mb-2 text-2xl font-bold">رفع رواية من ملف</h3>
                    <p className="mb-6 text-xs text-black/40">Word (.docx) أو PDF — سيتم تحويله تلقائياً إلى فصول</p>

                    {wordUploadStep === 'file' && (
                      <div className="space-y-4">
                        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-black/20 p-10 cursor-pointer hover:border-black/40 transition-colors">
                          <Upload size={32} className="opacity-30" />
                          <span className="text-sm font-bold opacity-50">
                            {wordUploadFile ? wordUploadFile.name : 'اضغط لاختيار الملف'}
                          </span>
                          <input
                            type="file"
                            accept=".docx,.doc,.pdf"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setWordUploadFile(file);
                                if (!wordUploadTitle) {
                                  setWordUploadTitle(file.name.replace(/\.(docx?|pdf)$/i, ''));
                                }
                              }
                            }}
                          />
                        </label>
                        <div className="flex gap-4 pt-2">
                          <button
                            onClick={() => { if (wordUploadFile) setWordUploadStep('details'); }}
                            disabled={!wordUploadFile}
                            className="monochrome-button flex-grow disabled:opacity-30"
                          >التالي</button>
                          <button onClick={() => { setShowWordUploadModal(false); setWordUploadFile(null); setWordUploadTitle(''); }} className="monochrome-button-outline flex-grow">إلغاء</button>
                        </div>
                      </div>
                    )}

                    {wordUploadStep === 'details' && (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">عنوان الرواية</label>
                          <input value={wordUploadTitle} onChange={e => setWordUploadTitle(e.target.value)} className="monochrome-input" placeholder="أدخل عنوان الرواية" autoFocus />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">اسم الكاتب (اختياري)</label>
                          <input value={wordUploadAuthorName} onChange={e => setWordUploadAuthorName(e.target.value)} className="monochrome-input" placeholder="يُستخدم اسمك تلقائياً إن تُرك فارغاً" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">صورة الغلاف (اختياري)</label>
                          <div className="flex items-center gap-4 mt-1">
                            <FileUploadComponent
                              path="covers"
                              label=""
                              currentUrl={wordUploadCover}
                              onUploadSuccess={(url) => setWordUploadCover(url)}
                            />
                            {wordUploadCover && (
                              <img src={wordUploadCover} alt="غلاف" className="h-20 w-14 object-cover border border-black/10 shadow-sm" referrerPolicy="no-referrer" />
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">لغة الرواية</label>
                          <div className="flex gap-2">
                            <button onClick={() => setWordUploadLanguage('ar')} className={`flex-1 py-2 text-sm font-bold border transition-all ${wordUploadLanguage === 'ar' ? 'bg-black text-white border-black' : 'border-black/20 hover:border-black'}`}>العربية</button>
                            <button onClick={() => setWordUploadLanguage('en')} className={`flex-1 py-2 text-sm font-bold border transition-all ${wordUploadLanguage === 'en' ? 'bg-black text-white border-black' : 'border-black/20 hover:border-black'}`}>English</button>
                          </div>
                        </div>
                        <div className="flex gap-4 pt-2">
                          <button onClick={uploadWordNovel} disabled={!wordUploadTitle.trim()} className="monochrome-button flex-grow disabled:opacity-30">رفع الرواية</button>
                          <button onClick={() => setWordUploadStep('file')} className="monochrome-button-outline flex-grow">رجوع</button>
                        </div>
                      </div>
                    )}

                    {wordUploadStep === 'processing' && (
                      <div className="flex flex-col items-center gap-4 py-8">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-black"></div>
                        <p className="text-sm font-bold opacity-60">جارٍ معالجة الملف وإنشاء الفصول...</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}

              {showNewNovelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white p-8">
                    <h3 className="mb-6 text-2xl font-bold">{t('new_novel')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('novel_title')}</label>
                        <input 
                          value={newNovelTitle} 
                          onChange={e => setNewNovelTitle(e.target.value)} 
                          className="monochrome-input" 
                          placeholder={t('novel_title_placeholder')} 
                          autoFocus
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('language', 'اللغة')}</label>
                          <select 
                            value={newNovelLanguage} 
                            onChange={e => setNewNovelLanguage(e.target.value as any)} 
                            className="monochrome-input"
                          >
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('violence_level', 'مستوى العنف')}</label>
                          <select 
                            value={newNovelViolence} 
                            onChange={e => setNewNovelViolence(e.target.value as any)} 
                            className="monochrome-input"
                          >
                            <option value="none">{t('violence_none', 'بدون عنف')}</option>
                            <option value="low">{t('violence_low', 'منخفض')}</option>
                            <option value="medium">{t('violence_medium', 'متوسط')}</option>
                            <option value="high">{t('violence_high', 'دموي/عالي')}</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('moral_tone', 'التوجه الأخلاقي')}</label>
                        <select 
                          value={newNovelMoral} 
                          onChange={e => setNewNovelMoral(e.target.value as any)} 
                          className="monochrome-input"
                        >
                          <option value="moral">{t('moral_high', 'أخلاقي/تربوي')}</option>
                          <option value="neutral">{t('moral_neutral', 'محايد')}</option>
                          <option value="dark">{t('moral_dark', 'سوداوي/غير أخلاقي')}</option>
                        </select>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button onClick={createNovel} className="monochrome-button flex-grow">{t('start_writing')}</button>
                        <button onClick={() => setShowNewNovelModal(false)} className="monochrome-button-outline flex-grow">{t('cancel')}</button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {novels.map(novel => (
                  <div 
                    key={novel.id} 
                    onClick={() => {
                      setSelectedNovel(novel);
                      setView('novel');
                    }}
                    className="flex flex-col gap-3 group cursor-pointer"
                  >
                    <div className="aspect-[2/3] w-full bg-black/5 flex items-center justify-center border border-black/5 overflow-hidden shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 relative">
                      {novel.coverImage ? (
                        <img src={novel.coverImage} alt={novel.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                      ) : (
                        <Logo size={40} className="opacity-10" />
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNovel(novel.id);
                        }} 
                        className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-sm text-red-600 opacity-0 group-hover:opacity-100 transition-all active:scale-90 rounded-full shadow-sm"
                        title={t('delete')}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[8px] uppercase tracking-widest text-black/40 font-bold">{t(novel.genre)}</span>
                        {novel.status === 'published' && (
                          <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600">
                             <div className="w-1 h-1 rounded-full bg-emerald-600" />
                             {t('published')}
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-bold line-clamp-1 leading-tight">{novel.title}</h4>
                    </div>
                  </div>
                ))}
                {novels.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-black/30 bg-black/[0.02] border border-dashed border-black/10 rounded-lg">
                    <Logo size={64} className="mb-4 opacity-10" />
                    <p className="mb-6 text-sm">{effectiveUserId ? t('no_content') : t('login_to_write', 'سجّل دخولك لبدء كتابة روايتك')}</p>
                    {effectiveUserId ? (
                      <button 
                        onClick={() => setShowNewNovelModal(true)}
                        className="monochrome-button px-8 py-3 flex items-center gap-2"
                      >
                        <Plus size={18} />
                        {t('create_first_novel', 'ابدأ كتابة روايتك الأولى')}
                      </button>
                    ) : (
                      <SignInButton mode="modal">
                        <button className="monochrome-button px-8 py-3 flex items-center gap-2">
                          <Plus size={18} />
                          {t('create_first_novel', 'ابدأ كتابة روايتك الأولى')}
                        </button>
                      </SignInButton>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'explore' && (
            <motion.div 
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-12 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-4xl font-serif font-bold">{t('explore')}</h2>
                  <p className="text-black/50">{t('explore_slogan')}</p>
                </div>
                <div className="flex bg-black/5 p-1 rounded-full w-fit">
                  <button 
                    onClick={() => setExploreLanguageFilter('all')}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${exploreLanguageFilter === 'all' ? 'bg-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                  >
                    {t('all_languages', 'الكل')}
                  </button>
                  <button 
                    onClick={() => setExploreLanguageFilter('most-read')}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${exploreLanguageFilter === 'most-read' ? 'bg-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                  >
                    الأكثر قراءة
                  </button>
                  <button 
                    onClick={() => setExploreLanguageFilter('ar')}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${exploreLanguageFilter === 'ar' ? 'bg-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                  >
                    العربية
                  </button>
                  <button 
                    onClick={() => setExploreLanguageFilter('en')}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${exploreLanguageFilter === 'en' ? 'bg-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {(exploreLanguageFilter === 'most-read'
                  ? [...publicNovels].sort((a, b) => ((b as any).viewsCount || 0) - ((a as any).viewsCount || 0))
                  : publicNovels.filter(n => exploreLanguageFilter === 'all' || n.language === exploreLanguageFilter || (!n.language && exploreLanguageFilter === 'ar'))
                ).map(novel => (
                  <div 
                    key={novel.id} 
                    onClick={() => {
                      setSelectedNovel(novel);
                      setView('novel');
                    }}
                    className="flex flex-col gap-3 group cursor-pointer"
                  >
                    <div className="aspect-[2/3] w-full bg-black/5 flex items-center justify-center border border-black/5 overflow-hidden shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                      {novel.coverImage ? (
                        <img src={novel.coverImage} alt={novel.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                      ) : (
                        <Logo size={48} className="opacity-10" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[8px] uppercase tracking-widest text-black/40 font-bold">{t(novel.genre)}</span>
                        <div className="flex items-center gap-2 text-[8px] font-bold text-black/20">
                          <Eye size={8} /> {novel.viewsCount || 0}
                        </div>
                      </div>
                      <h3 className="mb-1 text-sm font-bold line-clamp-1 leading-tight">{novel.title}</h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProfileUid(novel.authorUid);
                          setView('profile');
                        }}
                        className="text-[10px] font-medium opacity-30 hover:opacity-100 hover:underline transition-opacity"
                      >
                        {novel.authorName}
                      </button>
                      {novel.createdAt && (
                        <p className="text-[9px] text-black/20 mt-0.5">
                          {(() => { try { const d = novel.createdAt?.toDate ? novel.createdAt.toDate() : new Date(novel.createdAt); return d.toLocaleDateString('ar', { year: 'numeric', month: 'short' }); } catch { return ''; } })()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(exploreLanguageFilter === 'most-read'
                  ? publicNovels
                  : publicNovels.filter(n => exploreLanguageFilter === 'all' || n.language === exploreLanguageFilter || (!n.language && exploreLanguageFilter === 'ar'))
                ).length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-black/30">
                    <Logo size={64} className="mb-4 opacity-10" />
                    <p className="text-sm">{t('no_published_novels')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'library' && (
            <LibraryView 
              library={effectiveUserId ? library : guestLibrary.map(id => ({ id, novelId: id, uid: '', addedAt: null as any }))} 
              novels={[...publicNovels, ...novels]} 
              readingProgress={readingProgress}
              onOpenNovel={(novel) => {
                setSelectedNovel(novel);
                setView('reader');
              }}
              isGuest={!effectiveUserId}
            />
          )}

          {view === 'most-read' && (
            <motion.div
              key="most-read"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MostReadView
                novels={publicNovels}
                onOpenNovel={(novel) => {
                  setSelectedNovel(novel);
                  setView('novel');
                }}
                setSelectedProfileUid={setSelectedProfileUid}
                setView={setView}
              />
            </motion.div>
          )}

          {view === 'novel' && selectedNovel && (
            <NovelDetail 
              novel={selectedNovel} 
              isAuthor={effectiveUserId === selectedNovel.authorUid}
              isAdmin={isAdmin}
              profile={userProfile}
              onEditChapter={(ch) => {
                setSelectedChapter(ch);
                setView('editor');
              }}
              onManageCharacters={() => setView('characters')}
              onDeleteNovel={() => deleteNovel(selectedNovel.id)}
              setView={setView}
              showToast={showToast}
              onAddToLibrary={() => addToLibrary(selectedNovel.id)}
              onRemoveFromLibrary={() => removeFromLibrary(selectedNovel.id)}
              isInLibrary={library.some(l => l.novelId === selectedNovel.id) || guestLibrary.includes(selectedNovel.id)}
              isPro={isPro}
              userProfile={userProfile}
              currentUserId={effectiveUserId}
            />
          )}

          {view === 'reader' && selectedNovel && (
            <Reader 
              novel={selectedNovel} 
              onBack={() => setView('novel')} 
              onStatUpdate={(stat) => incrementStat(selectedNovel.id, stat)}
              onOpenProfile={(uid) => {
                setSelectedProfileUid(uid);
                setView('profile');
              }}
              isFollowing={follows.some(f => f.followedUid === selectedNovel.authorUid) || guestFollows.includes(selectedNovel.authorUid)}
              onFollow={() => followAuthor(selectedNovel.authorUid)}
              onUnfollow={() => unfollowAuthor(selectedNovel.authorUid)}
              onUpdateProgress={updateReadingProgress}
              onAddToLibrary={() => addToLibrary(selectedNovel.id)}
              onRemoveFromLibrary={() => removeFromLibrary(selectedNovel.id)}
              isInLibrary={library.some(l => l.novelId === selectedNovel.id) || guestLibrary.includes(selectedNovel.id)}
              lastReadChapterId={readingProgress.find(p => p.novelId === selectedNovel.id)?.lastChapterId}
              currentUser={user}
              currentUserId={effectiveUserId}
              isAdmin={isAdmin}
              onDeleteComment={deleteComment}
              showToast={showToast}
            />
          )}

          {view === 'profile' && selectedProfileUid && (
            <ProfileView 
              uid={selectedProfileUid}
              currentUser={user}
              currentUserId={effectiveUserId}
              onBack={() => setView('explore')}
              onOpenNovel={(novel) => {
                setSelectedNovel(novel);
                setView('reader');
              }}
              onOpenProfile={(uid) => {
                setSelectedProfileUid(uid);
                setView('profile');
              }}
              onFollow={followAuthor}
              onUnfollow={unfollowAuthor}
              isFollowing={follows.some(f => f.followedUid === selectedProfileUid) || guestFollows.includes(selectedProfileUid)}
              showToast={showToast}
              setView={setView}
              isPro={isPro}
              isAdmin={isAdmin}
            />
          )}

          {view === 'following' && (
            <FollowingView 
              profiles={followingProfiles}
              onOpenProfile={(uid) => {
                setSelectedProfileUid(uid);
                setView('profile');
              }}
              onBack={() => setView('dashboard')}
              currentUser={user}
            />
          )}

          {view === 'editor' && selectedNovel && selectedChapter && (
            <Editor 
              novel={selectedNovel} 
              chapter={selectedChapter} 
              onBack={() => setView('novel')} 
              showToast={showToast}
              setConfirmModal={setConfirmModal}
              userProfile={userProfile}
              isPro={isPro}
              setView={setView}
            />
          )}

          {view === 'characters' && selectedNovel && (
            <CharacterManager 
              novel={selectedNovel} 
              onBack={() => setView('novel')} 
              showToast={showToast}
            />
          )}

          {view === 'settings' && !effectiveUserId && (
            <motion.div key="settings-guest" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32 gap-6 text-center">
              <Lock size={48} className="opacity-20" />
              <h2 className="text-2xl font-bold">{t('login_required', 'تسجيل الدخول مطلوب')}</h2>
              <p className="text-black/40 text-sm max-w-xs">{t('login_to_edit_profile', 'يرجى تسجيل الدخول لتعديل ملفك الشخصي وإعداداتك.')}</p>
              <SignInButton mode="modal"><button className="monochrome-button px-8 py-3">{t('login', 'تسجيل الدخول')}</button></SignInButton>
            </motion.div>
          )}

          {view === 'settings' && effectiveUserId && !userProfile && (
            <div 
              role="status" 
              aria-busy="true" 
              className="flex flex-col items-center justify-center py-12 sm:py-32 gap-4 w-full min-h-[300px]"
            >
              <div 
                aria-hidden="true" 
                className="h-8 w-8 animate-spin border-4 border-black border-t-transparent rounded-full" 
                style={{ willChange: 'transform' }}
              />
              <p className="text-neutral-700 font-medium text-sm">{t('loading', 'جاري التحميل...')}</p>
              <span className="sr-only">Loading settings profile...</span>
            </div>
          )}

          {view === 'settings' && userProfile && (
            <SettingsView 
              profile={userProfile} 
              isAdmin={isAdmin}
              onUpdateProfile={async (data) => {
                try {
                  let photoURL = data.photoURL;
                  if (photoURL && photoURL.startsWith('data:image/')) {
                    try {
                      const compressed = await resizeAndCompressImage(photoURL, 400, 400, 0.7);
                      try {
                        photoURL = await uploadBase64Image(compressed, `avatars/${effectiveUserId!}.png`);
                      } catch {
                        photoURL = compressed;
                      }
                    } catch (compressErr) {
                      console.error("Compression failed", compressErr);
                    }
                  }

                  let bannerURL = data.bannerURL;
                  if (bannerURL && bannerURL.startsWith('data:image/')) {
                    const compressedBanner = await resizeAndCompressImage(bannerURL, 2048, 576, 0.8);
                    bannerURL = await uploadBase64Image(compressedBanner, `banners/${effectiveUserId!}.jpg`);
                  }

                  const updateData = {
                    ...data,
                    photoURL,
                    bannerURL: bannerURL || '',
                  };

                  await api.updateUser(effectiveUserId!, updateData);
                  setUserProfile(prev => prev ? { ...prev, ...updateData } : prev);
                } catch (e: any) {
                  showToast('فشل في تحديث الملف الشخصي: ' + e.message, 'error');
                }
              }}
              showToast={showToast}
              setView={setView}
            />
          )}

          {view === 'search' && (
            <SearchView 
              query={searchQuery}
              results={searchResults}
              loading={searching}
              onOpenNovel={(n) => {
                setSelectedNovel(n);
                setView('reader');
              }}
              onOpenProfile={(uid) => {
                setSelectedProfileUid(uid);
                setView('profile');
              }}
            />
          )}

          {view === 'privacy' && (
            <LegalPage 
              title={t('privacy_policy_title', 'سياسة الخصوصية')}
              onBack={() => setView('explore')}
              content={
                <div className={`space-y-4 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p>{t('privacy_intro', 'نحن نحترم خصوصيتك. يتم جمع المعلومات فقط لتحسين تجربة المستخدم وتوفير ميزات الذكاء الاصطناعي.')}</p>
                  <h3 className="font-bold">{t('privacy_data_title', '1. البيانات التي نجمعها')}</h3>
                  <p>{t('privacy_data_desc', 'نجمع البيانات التي تقدمها عند استخدام الموقع مثل الاسم والبريد الإلكتروني والمحتوى الذي تنشئه.')}</p>
                  <h3 className="font-bold">{t('privacy_cookies_title', '2. ملفات تعريف الارتباط')}</h3>
                  <p>{t('privacy_cookies_desc', 'نستخدم ملفات تعريف الارتباط لتحسين تجربة تسجيل الدخول وتذكر تفضيلاتك.')}</p>
                  <h3 className="font-bold">{t('privacy_sharing_title', '3. مشاركة البيانات')}</h3>
                  <p>{t('privacy_sharing_desc', 'لا نقوم ببيع بياناتك لأطراف خارجية.')}</p>
                </div>
              }
            />
          )}

          {view === 'terms' && (
            <LegalPage 
              title={t('terms_title', 'شروط الاستخدام')}
              onBack={() => setView('explore')}
              content={
                <div className={`space-y-4 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p>{t('terms_intro', 'باستخدامك لموقع روايتي، أنت توافق على الشروط التالية:')}</p>
                  <h3 className="font-bold">{t('terms_content_title', '1. المحتوى')}</h3>
                  <p>{t('terms_content_desc', 'أنت المسؤول الوحيد عن المحتوى الذي تنشئه باستخدام أدوات الذكاء الاصطناعي الخاصة بنا.')}</p>
                  <h3 className="font-bold">{t('terms_behavior_title', '2. السلوك المقبول')}</h3>
                  <p>{t('terms_behavior_desc', 'يُمنع استخدام الموقع لنشر محتوى ينتهك حقوق الآخرين أو يحرض على العنف.')}</p>
                </div>
              }
            />
          )}

          {view === 'about' && (
            <LegalPage 
              title={t('about_title', 'من نحن')}
              onBack={() => setView('explore')}
              content={
                <div className={`space-y-4 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p>{t('about_intro', 'روايتي هي منصة إبداعية تهدف إلى تمكين الكتاب والقرّاء باستخدام أحدث تقنيات الذكاء الاصطناعي.')}</p>
                  <p>{t('about_mission', 'مهمتنا هي كسر حواجز الإبداع ومساعدة الجميع على سرد قصصهم بطريقة ممتعة واحترافية.')}</p>
                </div>
              }

            />
          )}

          {view === 'contact' && (
            <LegalPage 
              title={t('contact_us_title', 'اتصل بنا')}
              onBack={() => setView('explore')}
              content={
                <div className={`space-y-4 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p>{t('contact_us_p1', 'يسعدنا دائماً سماع تعليقاتك واقتراحاتك.')}</p>
                  <p>{t('contact_us_p2', 'يمكنك التواصل معنا عبر البريد الإلكتروني: ahmad.meshaalp@gmail.com')}</p>
                </div>
              }
            />
          )}

          {view === 'sitemap' && (
            <SitemapView
              onNavigateNovel={(novelId) => {
                api.getNovel(novelId).then(data => {
                  if (data) {
                    setSelectedNovel(data as Novel);
                    setView('reader');
                  }
                });
              }}
              onNavigateChapter={(novelId, chapterId) => {
                api.getNovel(novelId).then(data => {
                  if (data) {
                    setSelectedNovel(data as Novel);
                    setView('reader');
                  }
                });
              }}
              onNavigateProfile={(uid) => {
                setSelectedProfileUid(uid);
                setView('profile');
              }}
              onNavigateView={(v) => {
                window.location.hash = v;
                setView(v as any);
              }}
              showToast={showToast}
            />
          )}

        </AnimatePresence>

        <Footer setView={setView} />
      </main>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      <div id="pdf-export-content" className="fixed top-0 left-0 -z-[100] overflow-hidden pointer-events-none" style={{ width: '800px' }}>
        {/* This div will be populated dynamically during PDF export */}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 z-[100] -translate-x-1/2 rounded-full px-6 py-3 text-sm font-bold shadow-2xl backdrop-blur-md ${
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-black text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
        </>
      ) : (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin border-2 border-black border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}


const MobileNav = ({ view, setView, t, userId, setSelectedProfileUid, isPro }: { view: string, setView: (v: any) => void, t: any, userId: string | null | undefined, setSelectedProfileUid: (uid: string | null) => void, isPro: boolean }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-black/5 bg-white/80 p-1 sm:p-2 backdrop-blur-xl md:hidden">
    <button 
      onClick={() => setView('explore')} 
      className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-90 ${view === 'explore' ? 'text-black' : 'text-black/20'}`}
    >
      <Globe size={18} />
      <span className="text-[8px] font-bold uppercase tracking-widest">{t('explore')}</span>
    </button>
    <button 
      onClick={() => setView('library')} 
      className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-90 ${view === 'library' ? 'text-black' : 'text-black/20'}`}
    >
      <Bookmark size={18} />
      <span className="text-[8px] font-bold uppercase tracking-widest">{t('library')}</span>
    </button>
    <button 
      onClick={() => setView('dashboard')} 
      className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-90 ${view === 'dashboard' ? 'text-black' : 'text-black/20'}`}
    >
      <PenTool size={18} />
      <span className="text-[8px] font-bold uppercase tracking-widest">{t('write')}</span>
    </button>
    <button 
      onClick={() => { setSelectedProfileUid(userId || null); setView('profile'); }} 
      className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-90 ${view === 'profile' ? 'text-black' : 'text-black/20'}`}
    >
      <UserIcon size={18} />
      <span className="text-[8px] font-bold uppercase tracking-widest">{t('profile')}</span>
    </button>
  </div>
);

// --- Most Read View ---

const MostReadView = ({ 
  novels, 
  onOpenNovel, 
  setSelectedProfileUid, 
  setView 
}: { 
  novels: Novel[], 
  onOpenNovel: (n: Novel) => void,
  setSelectedProfileUid: (uid: string) => void,
  setView: (v: any) => void
}) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const sorted = [...novels]
    .sort((a, b) => ((b as any).viewsCount || 0) - ((a as any).viewsCount || 0))
    .slice(0, 20);

  const medalColors = ['#C9A84C', '#A0A0A0', '#A0715A'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-10 sm:mb-14">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={28} strokeWidth={1.5} className="opacity-60" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            {isRtl ? 'الأكثر قراءة' : 'Most Read'}
          </h2>
        </div>
        <p className="text-black/40 text-sm">
          {isRtl ? 'الروايات التي استقطبت أكبر عدد من القراء' : 'Stories that captivated the most readers'}
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-black/20">
          <Logo size={64} className="mb-4 opacity-10" />
          <p className="text-sm">{isRtl ? 'لا توجد روايات بعد' : 'No novels yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((novel, index) => (
            <motion.div
              key={novel.id}
              initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => onOpenNovel(novel)}
              className="group flex items-center gap-4 sm:gap-6 cursor-pointer border border-black/5 hover:border-black/20 bg-white hover:bg-black/[0.01] p-3 sm:p-4 transition-all duration-200"
            >
              {/* Rank */}
              <div className="w-10 sm:w-14 shrink-0 text-center">
                {index < 3 ? (
                  <span 
                    className="text-xl sm:text-2xl font-display font-black" 
                    style={{ color: medalColors[index] }}
                  >
                    {index + 1}
                  </span>
                ) : (
                  <span className="text-lg sm:text-xl font-display font-bold text-black/20">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Cover */}
              <div className="w-10 h-14 sm:w-12 sm:h-16 shrink-0 overflow-hidden bg-black/5 border border-black/5">
                {novel.coverImage ? (
                  <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={16} className="opacity-10" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className={`flex-grow min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h3 className="font-bold text-sm sm:text-base line-clamp-1 leading-tight mb-0.5">
                  {novel.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfileUid(novel.authorUid);
                    setView('profile');
                  }}
                  className="text-[10px] sm:text-xs text-black/40 hover:text-black hover:underline transition-colors"
                >
                  {novel.authorName}
                </button>
                {novel.summary && (
                  <p className="text-[10px] sm:text-xs text-black/30 line-clamp-1 mt-1 hidden sm:block">
                    {novel.summary}
                  </p>
                )}
              </div>

              {/* Views */}
              <div className={`shrink-0 flex flex-col items-center gap-0.5 text-black/30`}>
                <Eye size={14} />
                <span className="text-[10px] font-bold">
                  {((novel as any).viewsCount || 0).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// --- Sub-Components ---

const NovelDetail = ({ novel, isAuthor, isAdmin, profile, onEditChapter, onManageCharacters, onDeleteNovel, setView, showToast, onAddToLibrary, onRemoveFromLibrary, isInLibrary, isPro, userProfile, currentUserId }: { 
  novel: Novel, 
  isAuthor: boolean,
  isAdmin: boolean,
  profile: UserProfile | null,
  onEditChapter: (ch: Chapter) => void, 
  onManageCharacters: () => void,
  onDeleteNovel: () => void,
  setView: (v: 'dashboard' | 'explore' | 'novel' | 'editor' | 'characters' | 'settings' | 'reader' | 'profile' | 'following' | 'search' | 'library') => void,
  showToast: (msg: string, type?: 'success' | 'error') => void,
  onAddToLibrary?: () => void,
  onRemoveFromLibrary?: () => void,
  isInLibrary?: boolean,
  isPro: boolean,
  userProfile: UserProfile | null,
  currentUserId: string | null
}) => {
  const { t } = useTranslation();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeTab, setActiveTab] = useState<'chapters' | 'ai'>('chapters');
  const [aiPlot, setAiPlot] = useState('');
  const [copiedPlot, setCopiedPlot] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const privacyActive = !isAuthor && !isAdmin && novel.status === 'published';

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && privacyActive) {
        setIsBlurred(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [privacyActive]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (privacyActive) {
      e.preventDefault();
      showToast(t('copy_forbidden'), 'error');
    }
  };

  const handleCopyPlot = () => {
    if (privacyActive) {
      showToast(t('copy_forbidden'), 'error');
      return;
    }
    if (aiPlot) {
      navigator.clipboard.writeText(aiPlot);
      setCopiedPlot(true);
      setTimeout(() => setCopiedPlot(false), 2000);
    }
  };

  const handleCopySummary = () => {
    if (privacyActive) {
      showToast(t('copy_forbidden'), 'error');
      return;
    }
    if (novel.summary) {
      navigator.clipboard.writeText(novel.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleGenerateShortSummary = async () => {
    setGeneratingSummary(true);
    try {
      const summary = await generateShortSummary(
        novel.title,
        novel.genre,
        novel.summary,
        novel.language || 'ar'
      );
      if (summary) {
        await api.updateNovel(novel.id, { summary });
        showToast(t('summary_generated_success', 'تم توليد الملخص بنجاح!'), 'success');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error_generating_summary', 'حدث خطأ أثناء توليد الملخص.'), 'error');
    }
    setGeneratingSummary(false);
  };

  const handleCoverUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGeneratingCover(true);
    const path = `novels/${novel.id}`;
    try {
      const reader = new FileReader();
      const fileAsBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const compressed = await resizeAndCompressImage(fileAsBase64, 800, 1000, 0.7);
      let coverUrl = '';
      try {
        coverUrl = await uploadBase64Image(compressed, `covers/${novel.id}.png`);
      } catch (storageErr) {
        console.warn("Storage upload failed, falling back to Firestore base64", storageErr);
        coverUrl = compressed;
      }

      if (coverUrl) {
        await api.updateNovel(novel.id, { coverImage: coverUrl });
      }
    } catch (e: any) {
      showToast(`${t('error_uploading_cover', 'حدث خطأ أثناء رفع الغلاف:')} ${e.message}`, 'error');
    }
    setGeneratingCover(false);
  };
  const [confirmDeleteChapter, setConfirmDeleteChapter] = useState<{ isOpen: boolean, chapterId: string | null }>({
    isOpen: false,
    chapterId: null
  });

  useEffect(() => {
    let cancelled = false;
    api.getChapters(novel.id).then(rows => {
      if (!cancelled) setChapters(rows as Chapter[]);
    }).catch(console.error);
    return () => { cancelled = true; };
  }, [novel.id]);

  const addChapter = async () => {
    if (!newChapterTitle.trim()) return;
    try {
      await api.createChapter(novel.id, {
        novelId: novel.id,
        title: newChapterTitle.trim(),
        content: '',
        description: '',
        order: chapters.length + 1,
      });
      setNewChapterTitle('');
      setShowAddChapter(false);
      api.getChapters(novel.id).then(rows => setChapters(rows as Chapter[]));
    } catch (e: any) {
      showToast('فشل في إضافة الفصل: ' + e.message, 'error');
    }
  };

  const deleteChapter = async (chapterId: string) => {
    try {
      await api.deleteChapter(novel.id, chapterId);
      setChapters(prev => prev.filter(c => c.id !== chapterId));
    } catch (e: any) {
      showToast('فشل في حذف الفصل: ' + e.message, 'error');
    }
  };

  const handleGeneratePlot = async () => {
    setGenerating(true);
    try {
      let previousSummary = '';
      if (novel.previousPartId) {
        const prevNovel = await api.getNovel(novel.previousPartId).catch(() => null);
        if (prevNovel) previousSummary = prevNovel.summary || '';
      }

      const plot = await generatePlot(
        novel.title, 
        novel.genre, 
        novel.summary, 
        novel.language || 'ar',
        novel.violenceLevel || 'none',
        novel.moralTone || 'neutral',
        previousSummary
      );
      setAiPlot(plot || '');
    } catch (e) { 
      console.error(e);
      showToast(t('error_generating_plot', 'حدث خطأ أثناء توليد الحبكة.'), 'error');
    }
    setGenerating(false);
  };

  const getBase64FromUrl = async (url: string): Promise<string> => {
    if (url.startsWith('data:image/')) return url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Error converting image to base64:", e);
      return '';
    }
  };

  const exportToPDF = async () => {
    setExportingPDF(true);
    const toastId = showToast(t('exporting_pdf', 'جاري تجهيز الرواية بتنسيق احترافي...'), 'success');

    try {
      const element = document.getElementById('pdf-export-content');
      if (!element) throw new Error('Export element not found');

      (window as any).html2canvas = html2canvas;

      const isRtl = novel.language === 'ar';

      const formatNumber = (n: number) => {
        if (!isRtl) return n.toString();
        return n.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
      };

      const getLabel = (ar: string, en: string) => isRtl ? ar : en;

      // Map CSS variables to actual font names
      const fontMap: Record<string, string> = {
        'var(--font-serif)': '"Playfair Display", serif',
        'var(--font-sans)': '"Inter", sans-serif',
        'var(--font-amiri)': '"Amiri", serif',
        'var(--font-cairo)': '"Cairo", sans-serif',
        'var(--font-lalezar)': '"Lalezar", cursive',
        'var(--font-tajawal)': '"Tajawal", sans-serif',
        'var(--font-roboto)': '"Roboto", sans-serif',
        'var(--font-merriweather)': '"Merriweather", serif'
      };

      const resolvedFont = fontMap[novel.fontFamily || ''] || (isRtl ? '"Amiri", serif' : '"Playfair Display", serif');

      // Set element to exactly A4 width in points (595pt) to avoid scaling issues
      element.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');

          .book-container {
            font-family: ${resolvedFont};
            color: #000;
            background: white;
            width: 595px; /* Exactly A4 width in points */
            box-sizing: border-box;
            line-height: 1.8;
            direction: ${isRtl ? 'rtl' : 'ltr'};
            text-align: justify;
            padding: 0;
            margin: 0;
          }

          .cover-page {
            height: 842px; /* A4 height in points */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            text-align: center;
            padding: 60px 40px;
            page-break-after: always;
          }

          .cover-image {
            max-width: 300px;
            max-height: 400px;
            object-fit: contain;
          }

          .cover-title {
            font-size: 36pt;
            font-weight: bold;
            margin: 20px 0;
          }

          .cover-author-box {
            background: #1a1a1a;
            color: white;
            padding: 8pt 30pt;
            border-radius: 20pt;
            font-size: 14pt;
            font-weight: bold;
          }

          .title-page {
            height: 842px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 60px;
            page-break-after: always;
            position: relative;
          }

          .title-page .novel-label {
            position: absolute;
            top: 60px;
            ${isRtl ? 'right' : 'left'}: 60px;
            font-size: 16pt;
          }

          .title-page h1 { font-size: 42pt; margin-bottom: 10px; font-weight: bold; }
          .title-page .subtitle { font-size: 14pt; margin-bottom: 60px; opacity: 0.8; }
          .title-page .author { font-size: 18pt; font-weight: bold; margin-bottom: 100px; }
          .title-page .publisher { font-size: 11pt; opacity: 0.6; position: absolute; bottom: 80px; }

          .inner-page {
            padding: 60px 70px;
            min-height: 842px;
          }

          .chapter-header {
            text-align: center;
            margin-bottom: 60px;
            padding-top: 60px;
          }

          .chapter-number-large {
            font-size: 36pt;
            font-weight: bold;
            display: block;
          }

          .content-body {
            font-size: 13pt;
            line-height: 1.8;
          }

          .content-body p {
            margin: 0;
            text-indent: 2.5em;
          }

          .content-body p:first-of-type {
            text-indent: 0;
            margin-top: 20px;
          }

          .content-body p.section-break {
            text-indent: 0;
            text-align: center;
            margin: 30px 0;
            font-weight: bold;
            font-size: 16pt;
          }

          .summary-page {
            page-break-after: always;
            padding: 100px 80px;
            text-align: center;
          }

          .summary-label {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 30px;
            display: block;
            opacity: 0.3;
          }

          .summary-text {
            font-size: 14pt;
            line-height: 1.8;
            font-style: italic;
          }
        </style>

        <div class="book-container">
          <div class="cover-page">
            ${novel.coverImage ? `<img src="${await getBase64FromUrl(novel.coverImage)}" class="cover-image" />` : '<div style="height:200px"></div>'}
            <div>
              <h1 class="cover-title">${novel.title}</h1>
              <p style="font-size: 14pt; opacity: 0.7;">${novel.summary?.split('.')[0] || ''}</p>
            </div>
            <div class="cover-author-box">${novel.authorName || getLabel('كاتب مجهول', 'Unknown Author')}</div>
          </div>

          <div class="title-page">
            <div class="novel-label">${getLabel('رواية', 'Novel')}</div>
            <h1>${novel.title}</h1>
            <div class="subtitle">${novel.summary?.split('.')[0] || ''}</div>
            <div class="author">${novel.authorName || getLabel('كاتب مجهول', 'Unknown Author')}</div>
            <div class="publisher">${getLabel('أبـابـيـل للـنـشـر الإلكتروني', 'Ababil Electronic Publishing')}</div>
          </div>

          <div class="inner-page summary-page">
            <span class="summary-label">${getLabel('الملخص', 'Summary')}</span>
            <div class="summary-text">${novel.summary}</div>
          </div>

          ${chapters.map((chapter, index) => `
            <div class="inner-page" style="page-break-before: always;">
              <div class="chapter-header">
                <span class="chapter-number-large">${formatNumber(index + 1)}</span>
              </div>
              <div class="content-body">
                ${chapter.content.split('\n').filter(p => p.trim()).map(p => {
                  const trimmed = p.trim();
                  if (trimmed === '***' || trimmed === '---' || (trimmed.length < 20 && !trimmed.startsWith('-'))) {
                     return `<p class="section-break">${trimmed}</p>`;
                  }
                  return `<p>${trimmed}</p>`;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Wait for font loading
      await new Promise(resolve => setTimeout(resolve, 3500));

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
        compress: true
      });

      await new Promise<void>((resolve, reject) => {
        doc.html(element, {
          html2canvas: {
            scale: 1, // 1:1 since we set element to 595px
            useCORS: true,
            logging: false,
            letterRendering: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          },
          callback: function (doc) {
            try {
              const pageCount = doc.getNumberOfPages();
              for (let i = 3; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`${formatNumber(i - 2)}`, 297, 815, { align: 'center' });
              }

              doc.save(`${novel.title}.pdf`);
              showToast(t('saved'), 'success');
              setExportingPDF(false);
              element.innerHTML = '';
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          x: 0,
          y: 0,
          width: 595,
          windowWidth: 595,
          autoPaging: 'text'
        });
      });

    } catch (e: any) {
      console.error("PDF Export Error:", e);
      showToast(t('error_occurred'), 'error');
      setExportingPDF(false);
    }
  };

  const updateNovelSettings = async (field: string, value: string) => {
    try {
      await api.updateNovel(novel.id, { [field]: value });
    } catch (e: any) {
      showToast('فشل في تحديث الإعدادات: ' + e.message, 'error');
    }
  };

  const createSequel = async () => {
    if (!currentUserId) return;
    setGenerating(true);
    const path = 'novels';
    try {
      const sequelTitle = `${novel.title}${t('part_two_suffix')}`;
      await api.createNovel({
        authorUid: currentUserId,
        authorName: novel.authorName,
        authorPhoto: novel.authorPhoto,
        title: sequelTitle,
        genre: novel.genre,
        summary: `${t('sequel_to', 'تكملة لـ')}: ${novel.title}. ${novel.summary}`,
        status: 'draft',
        language: novel.language || 'ar',
        violenceLevel: novel.violenceLevel || 'none',
        moralTone: novel.moralTone || 'neutral',
        fontFamily: novel.fontFamily || 'var(--font-serif)',
        fontSize: novel.fontSize || '1.125rem',
        textAlign: novel.textAlign || 'right',
        lineHeight: novel.lineHeight || '1.75',
        previousPartId: novel.id,
      });
      showToast(t('sequel_created', 'تم إنشاء الجزء الثاني بنجاح!'), 'success');
      setView('dashboard');
    } catch (e: any) {
      showToast('فشل في إنشاء الجزء الثاني: ' + e.message, 'error');
    }
    setGenerating(false);
  };

  const togglePublish = async (authorName?: string, coverImage?: string) => {
    const isPublishing = novel.status !== 'published';
    const newStatus = isPublishing ? 'published' : 'draft';

    const updateData: any = { status: newStatus };
    if (isPublishing && authorName) {
      updateData.authorName = authorName;
      if (coverImage) updateData.coverImage = coverImage;
    }

    try {
      await api.updateNovel(novel.id, updateData);
      setShowPublishModal(false);
      showToast(isPublishing ? 'تم نشر الرواية بنجاح ✓' : 'تم إلغاء النشر', 'success');
    } catch (e: any) {
      showToast('فشل تغيير حالة النشر: ' + (e?.message || 'خطأ غير معروف'), 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="relative"
      onContextMenu={handleContextMenu}
    >
      <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-start">
        <div className="relative group">
          <div className="h-64 w-48 flex-shrink-0 bg-black/5 flex items-center justify-center border border-black/10 overflow-hidden shadow-sm">
            {novel.coverImage ? (
              <img src={novel.coverImage} alt={novel.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Logo size={64} className="opacity-10" />
            )}
          </div>
          {isAuthor && (
            <>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCoverUploadDirect}
                className="hidden" 
                id="cover-upload-panel"
              />
              <label 
                htmlFor="cover-upload-panel"
                title={t('upload_image', 'رفع صورة')}
                className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:scale-110"
              >
                {generatingCover ? (
                  <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent"></div>
                ) : (
                  <Upload size={16} />
                )}
              </label>
            </>
          )}
        </div>
        <div className="flex-grow">
          <div className="mb-4 flex items-center gap-2">
            <span className="bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">{novel.genre}</span>
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${novel.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {novel.status === 'published' ? t('published') : t('draft')}
            </span>
          </div>
          <h2 className="mb-2 text-5xl font-serif font-bold tracking-tighter">{novel.title}</h2>
          {novel.authorName && <p className="mb-4 text-sm opacity-50">{t('by_author', 'بقلم')}: {novel.authorName}</p>}

          <div className="mb-4 relative group">
            <p className="text-sm text-black/60 line-clamp-3 italic">
              {novel.summary}
            </p>
            <div className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <button 
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 rounded-full bg-white border border-black/10 px-2 py-1 text-[10px] font-bold shadow-sm hover:bg-black hover:text-white"
                >
                  {copiedSummary ? <Check size={10} /> : <Copy size={10} />}
                  {copiedSummary ? t('copied') : t('copy')}
                </button>
                {isAuthor && (
                  <button 
                    onClick={handleGenerateShortSummary}
                    disabled={generatingSummary}
                    className="flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2 py-1 text-[10px] font-bold text-purple-600 shadow-sm hover:bg-purple-600 hover:text-white disabled:opacity-50"
                  >
                    {generatingSummary ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    {t('ai_summary', 'ملخص ذكي')}
                  </button>
                )}
              </div>
          </div>

          <div className="mb-6 flex items-center gap-6 text-xs font-bold opacity-40">
            <div className="flex items-center gap-2"><Eye size={16} /> {novel.viewsCount || 0} {t('views')}</div>
            <div className="flex items-center gap-2"><Share2 size={16} /> {novel.sharesCount || 0} {t('shares')}</div>
          </div>

          <div className="flex flex-wrap gap-4">
            {(isAuthor || isAdmin) && (
              <>
                {isAuthor && (
                  <>
                    <button onClick={onManageCharacters} className="monochrome-button-outline py-2 text-sm">
                      <Users size={16} /> {t('characters')}
                    </button>
                    <button 
                      onClick={() => novel.status === 'published' ? togglePublish() : setShowPublishModal(true)} 
                      className={`monochrome-button py-2 text-sm ${novel.status === 'published' ? 'bg-white text-black border border-black hover:bg-black hover:text-white' : ''}`}
                    >
                      {novel.status === 'published' ? <X size={16} /> : <Globe size={16} />}
                      {novel.status === 'published' ? t('unpublish', 'إلغاء النشر') : t('publish_novel', 'نشر الرواية')}
                    </button>
                  </>
                )}
                <button onClick={onDeleteNovel} className="monochrome-button-outline py-2 text-sm text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 size={16} /> {t('delete_novel', 'حذف الرواية')}
                </button>
              </>
            )}
            <button 
              onClick={() => {
                setView('reader');
              }}
              className="monochrome-button py-2 text-sm"
            >
              <BookOpen size={16} /> {t('read', 'قراءة')}
            </button>
            <button 
              onClick={() => isInLibrary ? onRemoveFromLibrary?.() : onAddToLibrary?.()}
              className={`monochrome-button-outline py-2 text-sm flex items-center gap-2 ${isInLibrary ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}`}
            >
              <Bookmark size={16} fill={isInLibrary ? "currentColor" : "none"} />
              {isInLibrary ? t('in_library') : t('add_to_library')}
            </button>
            <button 
              onClick={exportToPDF}
              disabled={exportingPDF}
              className="monochrome-button-outline py-2 text-sm flex items-center gap-2"
            >
              {exportingPDF ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              {exportingPDF ? t('exporting_pdf') : t('download_pdf')}
            </button>
            {novel.teraboxLink && (
              <button 
                onClick={() => window.open(novel.teraboxLink, '_blank')}
                className="monochrome-button-outline py-2 text-sm flex items-center gap-2"
              >
                <Cloud size={16} />
                {t('open_folder')}
              </button>
            )}
            {isAuthor && (
              <>
                <button 
                  onClick={createSequel}
                  disabled={generating}
                  className="monochrome-button-outline py-2 text-sm flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  {t('create_sequel')}
                </button>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="monochrome-button-outline py-2 text-sm flex items-center gap-2"
                >
                  <Settings size={16} />
                  {t('settings')}
                </button>
              </>
            )}
          </div>

          {showSettings && isAuthor && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-black/5 pt-6 overflow-hidden"
            >
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest opacity-50">{t('language')}</label>
                <select 
                  value={novel.language || 'ar'} 
                  onChange={e => updateNovelSettings('language', e.target.value)}
                  className="monochrome-input text-xs py-1"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest opacity-50">{t('violence_level')}</label>
                <select 
                  value={novel.violenceLevel || 'none'} 
                  onChange={e => updateNovelSettings('violenceLevel', e.target.value)}
                  className="monochrome-input text-xs py-1"
                >
                  <option value="none">{t('violence_none')}</option>
                  <option value="low">{t('violence_low')}</option>
                  <option value="medium">{t('violence_medium')}</option>
                  <option value="high">{t('violence_high')}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest opacity-50">{t('moral_tone')}</label>
                <select 
                  value={novel.moralTone || 'neutral'} 
                  onChange={e => updateNovelSettings('moralTone', e.target.value)}
                  className="monochrome-input text-xs py-1"
                >
                  <option value="moral">{t('moral_high')}</option>
                  <option value="neutral">{t('moral_neutral')}</option>
                  <option value="dark">{t('moral_dark')}</option>
                </select>
              </div>
              <div className="md:col-span-3 border-t border-black/5 pt-4 space-y-3">
                <FileUploadComponent 
                  path={`novels/${novel.id}/assets`}
                  label={t('novel_cloud_storage')}
                  description={t('novel_cloud_desc')}
                  currentUrl={novel.teraboxLink}
                  onUploadSuccess={(url) => updateNovelSettings('teraboxLink', url)}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">{t('terabox_link_label', 'رابط سحابي يدوي')}</label>
                  <input 
                    type="text" 
                    value={novel.teraboxLink || ''}
                    onChange={e => updateNovelSettings('teraboxLink', e.target.value)}
                    placeholder="https://..."
                    className="w-full monochrome-input text-[10px] py-1 opacity-60 focus:opacity-100 transition-opacity"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest opacity-50">{t('avatar_link_label', 'رابط الغلاف المباشر')}</label>
                <input 
                  type="text" 
                  value={novel.coverImage || ''}
                  onChange={e => updateNovelSettings('coverImage', e.target.value)}
                  placeholder={t('avatar_link_placeholder')}
                  className="w-full monochrome-input text-xs py-1"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mb-8 flex border-b border-black/10">
        <button 
          onClick={() => setActiveTab('chapters')}
          className={`px-6 py-3 text-sm font-bold transition-all ${activeTab === 'chapters' ? 'border-b-2 border-black' : 'opacity-40'}`}
        >
          {t('chapters')}
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all ${activeTab === 'ai' ? 'border-b-2 border-black' : 'opacity-40'}`}
        >
          <Sparkles size={14} /> {t('ai_plot_generator', 'مولد الحبكة AI')}
        </button>
      </div>

      {activeTab === 'chapters' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{chapters.length} {t('chapter_count', 'فصل')}</h3>
            {isAuthor && (
              <button onClick={() => setShowAddChapter(true)} className="monochrome-button py-2 text-sm">
                <Plus size={16} /> {t('new_chapter', 'فصل جديد')}
              </button>
            )}
          </div>

          {showAddChapter && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white p-8">
                <h3 className="mb-6 text-2xl font-bold">{t('new_chapter')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('chapter_title', 'عنوان الفصل')}</label>
                    <input 
                      value={newChapterTitle} 
                      onChange={e => setNewChapterTitle(e.target.value)} 
                      className="monochrome-input" 
                      placeholder={t('example_beginning', 'مثال: البداية')} 
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={addChapter} className="monochrome-button flex-grow">{t('add', 'إضافة')}</button>
                    <button onClick={() => setShowAddChapter(false)} className="monochrome-button-outline flex-grow">{t('cancel', 'إلغاء')}</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          <div className="grid gap-4">
            {chapters.map(ch => (
              <div key={ch.id} className="monochrome-card flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <span className="font-serif text-2xl text-black/20">{ch.order}</span>
                  <span className="font-bold">{ch.title}</span>
                </div>
                {isAuthor && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEditChapter(ch)} className="monochrome-button-outline px-4 py-2 text-xs">{t('edit_chapter', 'تحرير')}</button>
                    <button 
                      onClick={() => setConfirmDeleteChapter({ isOpen: true, chapterId: ch.id })} 
                      className="p-2 text-black/20 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {chapters.length === 0 && (
              <div className="py-12 text-center text-black/30">{t('no_chapters_yet', 'لا توجد فصول بعد.')}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="monochrome-card">
          {!aiPlot ? (
            <div className="py-12 text-center">
              <Sparkles size={48} className="mx-auto mb-4 text-black/10" />
              <h4 className="mb-2 font-bold">{t('need_inspiration', 'هل تحتاج إلى إلهام؟')}</h4>
              <p className="mb-6 text-sm text-black/50">{t('ai_inspiration_message', 'سيقوم الذكاء الاصطناعي باقتراح حبكة كاملة بناءً على عنوان روايتك.')}</p>
              <button 
                onClick={handleGeneratePlot} 
                disabled={generating}
                className="monochrome-button mx-auto"
              >
                {generating ? t('generating_ai', 'جاري التوليد...') : t('generate_suggestion', 'توليد مقترح كامل')}
              </button>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-4">
                <h4 className="font-bold">{t('ai_plot_suggestion', 'مقترح الحبكة الذكي')}</h4>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopyPlot} 
                    className="flex items-center gap-1 text-xs text-black/60 hover:text-black"
                  >
                    {copiedPlot ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    {copiedPlot ? t('copied') : t('copy_text', 'نسخ النص')}
                  </button>
                  <button onClick={() => setAiPlot('')} className="text-xs underline">{t('regenerate', 'إعادة التوليد')}</button>
                </div>
              </div>
              <Markdown>{aiPlot}</Markdown>
            </div>
          )}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmDeleteChapter.isOpen}
        onClose={() => setConfirmDeleteChapter({ isOpen: false, chapterId: null })}
        onConfirm={() => {
          if (confirmDeleteChapter.chapterId) {
            deleteChapter(confirmDeleteChapter.chapterId);
          }
        }}
        title={t('delete_chapter_confirm_title', 'حذف الفصل')}
        message={t('delete_chapter_confirm_message', 'هل أنت متأكد من حذف هذا الفصل؟ لا يمكن التراجع عن هذه العملية.')}
      />

      <PublishModal 
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={(name, cover) => togglePublish(name, cover)}
        novelId={novel.id}
        initialName={novel.authorName}
        initialCover={novel.coverImage}
        showToast={showToast}
      />

      <AnimatePresence>
        {isBlurred && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-3xl"
            onClick={() => setIsBlurred(false)}
          >
            <div className="text-center p-8">
              <Lock size={48} className="mx-auto mb-4 opacity-20" />
              <h2 className="text-2xl font-display font-bold mb-2">{t('privacy_warning_title')}</h2>
              <p className="text-black/40 mb-8">{t('privacy_warning_message')}</p>
              <button 
                onClick={() => setIsBlurred(false)}
                className="monochrome-button px-8 py-3"
              >
                {t('continue_reading')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Novel Chat Component ---

const NovelChat = ({ novel, chapters }: { novel: Novel, chapters: Chapter[] }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await chatAboutNovel(
        novel.title,
        novel.summary || '',
        chapters,
        messages,
        userMessage,
        i18n.language
      );
      if (response) {
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="mt-12 border-t border-black/10 pt-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <MessageSquare size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">{t('chat_with_ai')}</h3>
          <p className="text-xs text-black/40">{t('ai_critic')}</p>
        </div>
      </div>

      <div className="monochrome-card flex h-[500px] flex-col overflow-hidden p-0">
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4">
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-black/5 px-4 py-2 text-sm">
              {t('chat_intro')}
            </div>
          </div>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-black text-white' : 'bg-black/5'}`}>
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-black/5 px-4 py-2 text-sm">
                <motion.div 
                  animate={{ opacity: [0.4, 1, 0.4] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {t('generating_ai')}
                </motion.div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-black/10 p-4">
          <div className="flex gap-2">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t('chat_placeholder')}
              className="monochrome-input flex-grow"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="monochrome-button px-6"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reader = ({ 
  novel, 
  onBack, 
  onStatUpdate, 
  onOpenProfile, 
  isFollowing, 
  onFollow, 
  onUnfollow, 
  onUpdateProgress,
  onAddToLibrary,
  onRemoveFromLibrary,
  isInLibrary,
  lastReadChapterId,
  currentUser,
  currentUserId,
  isAdmin,
  onDeleteComment,
  showToast
}: { 
  novel: Novel, 
  onBack: () => void, 
  onStatUpdate: (stat: 'likesCount' | 'viewsCount' | 'sharesCount') => void,
  onOpenProfile: (uid: string) => void,
  isFollowing: boolean,
  onFollow: () => void,
  onUnfollow: () => void,
  onUpdateProgress?: (novelId: string, chapterId: string, chapterOrder: number) => void,
  onAddToLibrary?: () => void,
  onRemoveFromLibrary?: () => void,
  isInLibrary?: boolean,
  lastReadChapterId?: string | null,
  currentUser: any | null,
  currentUserId: string | null,
  isAdmin: boolean,
  onDeleteComment: (novelId: string, chapterId: string, commentId: string) => void,
  showToast: (msg: string, type?: 'success' | 'error') => void
}) => {
  const { t, i18n } = useTranslation();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [readingMode, setReadingMode] = useState<'chapters' | 'scroll'>('chapters');
  const [hasViewed, setHasViewed] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [fontFamily, setFontFamily] = useState(novel.fontFamily || 'var(--font-serif)');
  const [fontSize, setFontSize] = useState(novel.fontSize || '1.125rem');
  const [textAlign, setTextAlign] = useState(novel.textAlign || 'right');
  const [lineHeight, setLineHeight] = useState(novel.lineHeight || '1.75');
  const [showFormatting, setShowFormatting] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  const isAuthor = currentUserId === novel.authorUid;
  const privacyActive = !isAuthor && !isAdmin && novel.status === 'published';

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && privacyActive) {
        setIsBlurred(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [privacyActive]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (privacyActive) {
      e.preventDefault();
      showToast(t('copy_forbidden'), 'error');
    }
  };

  const handleCopy = () => {
    if (privacyActive) {
      showToast(t('copy_forbidden'), 'error');
      return;
    }
    if (activeChapter?.content) {
      navigator.clipboard.writeText(activeChapter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopySummary = () => {
    if (privacyActive) {
      showToast(t('copy_forbidden'), 'error');
      return;
    }
    if (novel.summary) {
      navigator.clipboard.writeText(novel.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  useEffect(() => {
    if (!hasViewed && currentUserId !== novel.authorUid) {
      onStatUpdate('viewsCount');
      setHasViewed(true);
    }
  }, [novel.id]);

  useEffect(() => {
    if (!currentUserId) return;
    api.isLiked(novel.id, currentUserId)
      .then((res: { liked: boolean }) => setHasLiked(res.liked))
      .catch(() => {});
  }, [novel.id, currentUserId]);

  useEffect(() => {
    let cancelled = false;
    api.getChapters(novel.id)
      .then((rows: any[]) => {
        if (cancelled) return;
        const docs = rows as Chapter[];
        setChapters(docs);
        if (docs.length > 0 && !activeChapter) {
          const lastRead = lastReadChapterId ? docs.find(ch => ch.id === lastReadChapterId) : null;
          handleChapterSelect(lastRead || docs[0]);
        }
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [novel.id, lastReadChapterId]);

  const handleChapterSelect = (ch: Chapter) => {
    if (!ch) return;
    setActiveChapter(ch);
    if (currentUser && onUpdateProgress) {
      onUpdateProgress(novel.id, ch.id, ch.order);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col gap-8 relative"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onBack} className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 shrink-0">
          <ArrowLeft size={16} /> {t('back_to_novel')}
        </button>
        <div className="overflow-x-auto flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex items-center gap-2 min-w-max pr-2">
          {(!currentUserId || currentUserId !== novel.authorUid) && (
            <button 
              onClick={() => isFollowing ? onUnfollow() : onFollow()}
              className={`flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all ${isFollowing ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}
            >
              {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
              <span>{isFollowing ? t('following') : t('follow_author')}</span>
            </button>
          )}
          <button 
            onClick={() => isInLibrary ? onRemoveFromLibrary?.() : onAddToLibrary?.()}
            className={`flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all ${isInLibrary ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            <Bookmark size={14} fill={isInLibrary ? "currentColor" : "none"} />
            <span>{isInLibrary ? t('in_library') : t('add_to_library')}</span>
          </button>
          <button 
            onClick={() => {
              const shareUrl = `${window.location.origin}${window.location.pathname}?novelId=${novel.id}`;
              navigator.clipboard.writeText(shareUrl);
              onStatUpdate('sharesCount');
              showToast(t('link_copied'));
            }}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all hover:bg-blue-50 hover:text-blue-600"
          >
            <Share2 size={14} /> {t('share')}
          </button>
          <button 
            onClick={() => setShowFormatting(!showFormatting)}
            className={`flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all ${showFormatting ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}
          >
            <Type size={14} /> {t('formatting')}
          </button>
          <button
            onClick={() => setReadingMode(readingMode === 'chapters' ? 'scroll' : 'chapters')}
            className={`flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all ${readingMode === 'scroll' ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}
            title={readingMode === 'chapters' ? 'التمرير المتواصل' : 'وضع الفصول'}
          >
            {readingMode === 'chapters' ? <BookOpen size={14} /> : <List size={14} />}
            <span>{readingMode === 'chapters' ? 'تمرير' : 'فصول'}</span>
          </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFormatting && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-4 bg-black/5 p-4 rounded-xl mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase opacity-40">{t('font_family')}</span>
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="var(--font-serif)">{t('serif')}</option>
                  <option value="var(--font-sans)">{t('sans')}</option>
                  <option value="var(--font-amiri)">{t('amiri')}</option>
                  <option value="var(--font-cairo)">{t('cairo')}</option>
                  <option value="var(--font-tajawal)">{t('tajawal')}</option>
                  <option value="var(--font-lalezar)">{t('lalezar')}</option>
                  <option value="var(--font-merriweather)">{t('merriweather')}</option>
                  <option value="var(--font-roboto)">{t('roboto')}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase opacity-40">{t('font_size')}</span>
                <select 
                  value={fontSize} 
                  onChange={(e) => setFontSize(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="0.875rem">14</option>
                  <option value="1rem">16</option>
                  <option value="1.125rem">18</option>
                  <option value="1.25rem">20</option>
                  <option value="1.5rem">24</option>
                  <option value="1.875rem">30</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase opacity-40">{t('text_align')}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTextAlign('left')} className={`p-1 rounded ${textAlign === 'left' ? 'bg-black text-white' : 'hover:bg-black/10'}`}><AlignLeft size={14} /></button>
                  <button onClick={() => setTextAlign('center')} className={`p-1 rounded ${textAlign === 'center' ? 'bg-black text-white' : 'hover:bg-black/10'}`}><AlignCenter size={14} /></button>
                  <button onClick={() => setTextAlign('right')} className={`p-1 rounded ${textAlign === 'right' ? 'bg-black text-white' : 'hover:bg-black/10'}`}><AlignRight size={14} /></button>
                  <button onClick={() => setTextAlign('justify')} className={`p-1 rounded ${textAlign === 'justify' ? 'bg-black text-white' : 'hover:bg-black/10'}`}><AlignJustify size={14} /></button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase opacity-40">{t('line_height')}</span>
                <select 
                  value={lineHeight} 
                  onChange={(e) => setLineHeight(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="1.2">1.2</option>
                  <option value="1.5">1.5</option>
                  <option value="1.75">1.75</option>
                  <option value="2">2.0</option>
                  <option value="2.5">2.5</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {readingMode === 'scroll' ? (
        <article className="flex-grow">
          <div className="mb-8 border-b border-black/10 pb-8 text-center">
            <div className="mx-auto mb-6 h-64 w-48 border border-black/10 bg-black/5 flex items-center justify-center overflow-hidden shadow-xl">
              {novel.coverImage ? (
                <img src={novel.coverImage} alt={novel.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Logo size={64} className="opacity-10" />
              )}
            </div>
            <h1 className="mb-2 text-4xl font-serif font-bold tracking-tighter">{novel.title}</h1>
            <div className="flex items-center justify-center gap-2 text-sm mb-6">
              <span className="opacity-50">{t('by')}</span>
              <button onClick={() => onOpenProfile(novel.authorUid)} className="font-bold underline underline-offset-4 hover:text-emerald-600">
                {novel.authorName || t('unknown_author')}
              </button>
            </div>
            <div className="mx-auto max-w-2xl bg-black/5 p-6 rounded-xl">
              <p className="text-sm leading-relaxed text-black/60 italic">{novel.summary}</p>
            </div>
          </div>
          <div
            className="prose prose-lg max-w-none"
            onContextMenu={handleContextMenu}
            style={{ fontFamily, fontSize, textAlign: textAlign as any, lineHeight, color: 'rgba(0,0,0,0.8)' }}
          >
            {chapters.map((ch, idx) => (
              <div key={ch.id} className="mb-16">
                <div className="mb-8 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 block mb-2">
                    {t('chapter_order_prefix', 'الفصل')} {ch.order}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-6">{ch.title}</h2>
                  <div className="w-16 h-1 bg-black mx-auto"></div>
                </div>
                <div className="whitespace-pre-wrap">{ch.content || t('no_content_yet')}</div>
                {idx < chapters.length - 1 && (
                  <div className="mt-16 flex items-center gap-4 opacity-20">
                    <div className="flex-1 h-px bg-black"></div>
                    <span className="text-xs font-bold">✦</span>
                    <div className="flex-1 h-px bg-black"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>
      ) : (
      <div className="flex flex-col gap-12 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest opacity-40">{t('chapters')}</h3>
          <div className="flex flex-col gap-2">
            {chapters.map(ch => (
              <button 
                key={ch.id}
                onClick={() => handleChapterSelect(ch)}
                className={`text-right px-4 py-2 text-sm transition-all ${activeChapter?.id === ch.id ? 'bg-black text-white' : 'hover:bg-black/5'}`}
              >
                {ch.order}. {ch.title}
              </button>
            ))}
          </div>
        </aside>

        <article className="flex-grow">
          <div className="mb-8 border-b border-black/10 pb-8 text-center">
            <div className="mx-auto mb-6 h-64 w-48 border border-black/10 bg-black/5 flex items-center justify-center overflow-hidden shadow-xl">
              {novel.coverImage ? (
                <img src={novel.coverImage} alt={novel.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Logo size={64} className="opacity-10" />
              )}
            </div>
            <h1 className="mb-2 text-4xl font-serif font-bold tracking-tighter">{novel.title}</h1>
            <div className="flex items-center justify-center gap-2 text-sm mb-6">
              <span className="opacity-50">{t('by')}</span>
              <button 
                onClick={() => onOpenProfile(novel.authorUid)}
                className="font-bold underline underline-offset-4 hover:text-emerald-600"
              >
                {novel.authorName || t('unknown_author')}
              </button>
            </div>

            <div className="mx-auto max-w-2xl bg-black/5 p-6 rounded-xl relative group">
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleCopySummary}
                  className="flex items-center gap-2 rounded-full bg-white border border-black/10 px-3 py-1.5 text-[10px] font-bold shadow-sm hover:bg-black hover:text-white transition-all"
                >
                  {copiedSummary ? <Check size={12} /> : <Copy size={12} />}
                  {copiedSummary ? t('copied') : t('copy_summary')}
                </button>
              </div>
              <p className="text-sm leading-relaxed text-black/60 italic">
                {novel.summary}
              </p>
            </div>
          </div>

          {activeChapter ? (
            <div className="prose prose-lg max-w-none">
              <div className="mb-12 text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] opacity-40 block mb-2">
                  {t('chapter_order_prefix', 'الفصل')} {activeChapter.order}
                </span>
                <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mb-8">
                  {activeChapter.title}
                </h2>
                <div className="w-24 h-1.5 bg-black mx-auto mb-12"></div>
              </div>

              <div 
                className="reading-content relative"
                style={{ 
                  fontFamily: fontFamily, 
                  fontSize: fontSize, 
                  textAlign: textAlign as any,
                  lineHeight: lineHeight,
                  color: 'rgba(0,0,0,0.8)'
                }}
              >
                {activeChapter.content || t('no_content_yet')}
              </div>

              {/* AdSense Unit */}
              <AdSense adSlot="1234567890" className="my-12 border-y border-black/5 py-8" />

              <CommentsSection 
                novelId={novel.id} 
                chapterId={activeChapter.id} 
                currentUser={currentUser} 
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onDeleteComment={(commentId) => onDeleteComment(novel.id, activeChapter.id, commentId)}
              />

              <NovelChat novel={novel} chapters={chapters} />
            </div>
          ) : (
            <div className="py-20 text-center text-black/30">
              {chapters.length === 0 ? t('no_chapters_yet', 'لا توجد فصول بعد.') : t('select_chapter_to_read')}
            </div>
          )}
        </article>
      </div>
      )}

      <AnimatePresence>
        {isBlurred && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-3xl"
            onClick={() => setIsBlurred(false)}
          >
            <div className="text-center p-8">
              <Lock size={48} className="mx-auto mb-4 opacity-20" />
              <h2 className="text-2xl font-display font-bold mb-2">{t('privacy_warning_title')}</h2>
              <p className="text-black/40 mb-8">{t('privacy_warning_message')}</p>
              <button 
                onClick={() => setIsBlurred(false)}
                className="monochrome-button px-8 py-3"
              >
                {t('continue_reading')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Editor = ({ novel, chapter, onBack, showToast, setConfirmModal, userProfile, isPro, setView }: { 
  novel: Novel, 
  chapter: Chapter, 
  onBack: () => void, 
  showToast: (msg: string, type?: 'success' | 'error') => void,
  setConfirmModal: (modal: { isOpen: boolean, title: string, message: string, onConfirm: () => void }) => void,
  userProfile: UserProfile | null,
  isPro: boolean,
  setView: (v: any) => void
}) => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState(chapter.content);
  const [description, setDescription] = useState(chapter.description || '');
  const [title, setTitle] = useState(chapter.title);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [suggestingTitle, setSuggestingTitle] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [isEditingWithAi, setIsEditingWithAi] = useState(false);
  const [undoContent, setUndoContent] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontFamily, setFontFamily] = useState(novel.fontFamily || 'var(--font-serif)');
  const [fontSize, setFontSize] = useState(novel.fontSize || '1.125rem');
  const [textAlign, setTextAlign] = useState(novel.textAlign || 'right');
  const [lineHeight, setLineHeight] = useState(novel.lineHeight || '1.75');
  const contentRef = useRef(content);
  const descriptionRef = useRef(description);
  const titleRef = useRef(title);

  useEffect(() => {
    setFontFamily(novel.fontFamily || 'var(--font-serif)');
    setFontSize(novel.fontSize || '1.125rem');
    setTextAlign(novel.textAlign || 'right');
    setLineHeight(novel.lineHeight || '1.75');
  }, [novel.fontFamily, novel.fontSize, novel.textAlign, novel.lineHeight]);

  const updateFormatting = async (field: string, value: string) => {
    // Update local state first for immediate feedback
    if (field === 'fontFamily') setFontFamily(value);
    if (field === 'fontSize') setFontSize(value);
    if (field === 'textAlign') setTextAlign(value as any);
    if (field === 'lineHeight') setLineHeight(value);

    try {
      await api.updateNovel(novel.id, { [field]: value });
    } catch (e: any) {
      showToast('فشل تحديث التنسيق: ' + e.message, 'error');
    }
  };

  const handleCopyAll = () => {
    const allText = `${title}\n\n${content}`;
    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    contentRef.current = content;
    descriptionRef.current = description;
    titleRef.current = title;
  }, [content, description, title]);

  const save = useCallback(async (contentToSave: string, descriptionToSave: string, titleToSave: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.updateChapter(novel.id, chapter.id, {
        content: contentToSave,
        description: descriptionToSave,
        title: titleToSave,
      });
      setLastSaved(new Date());
    } catch (e: any) {
      console.error('Save failed:', e);
    }
    setSaving(false);
  }, [novel.id, chapter.id, saving]);

  const applyToAllNovels = async () => {
    setConfirmModal({
      isOpen: true,
      title: t('apply_to_all_title', 'تطبيق التنسيقات'),
      message: t('apply_to_all_confirm', 'هل تريد تطبيق هذه التنسيقات على جميع رواياتك؟'),
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        setSaving(true);
        try {
          const novels = await api.getNovels({ authorUid: novel.authorUid });
          await Promise.all(novels.map((n: any) => api.updateNovel(n.id, { fontFamily, fontSize, textAlign, lineHeight })));
          showToast(t('applied_to_all_success', 'تم تطبيق التنسيقات على جميع الروايات بنجاح'), 'success');
        } catch (e: any) {
          showToast('فشل تطبيق التنسيقات: ' + e.message, 'error');
        }
        setSaving(false);
      }
    });
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (contentRef.current !== chapter.content || descriptionRef.current !== (chapter.description || '') || titleRef.current !== chapter.title) {
        save(contentRef.current, descriptionRef.current, titleRef.current);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [save, chapter.content, chapter.description, chapter.title]);

  const handleAiGenerate = async () => {
    setGenerating(true);
    try {
      let previousPartSummary = '';
      if (novel.previousPartId) {
        const prevNovel = await api.getNovel(novel.previousPartId).catch(() => null);
        if (prevNovel) previousPartSummary = prevNovel.summary || '';
      }

      const novelLang = novel.language || 'ar';
      const humanRulesForGenerate = novelLang === 'ar'
        ? `\n\n[قواعد أسلوبية إلزامية]: اكتب كروائي بشري محترف لا كذكاء اصطناعي. لا تكرر الأفكار أو العبارات. تجنب العبارات الافتتاحية النمطية والخواتيم الوعظية. استخدم حواراً طبيعياً ووصفاً حسياً دقيقاً وتطوراً نفسياً للشخصيات. نوّع طول الجمل. النص يجب أن يبدو إنسانياً تماماً.`
        : `\n\n[Mandatory style rules]: Write as a skilled human novelist, not as AI. Never repeat ideas or phrases. Avoid cliché openings and preachy endings. Use natural dialogue, precise sensory detail, authentic character psychology. Vary sentence length. The text must feel entirely human-written.`;

      const aiContent = await generateChapterContent(
        novel.title, 
        chapter.title, 
        novel.summary, 
        t('chapter_order_prefix') + chapter.order,
        description + (aiInstructions ? `\n\nSpecific Plot Instructions: ${aiInstructions}` : '') + humanRulesForGenerate,
        novelLang,
        novel.violenceLevel || 'none',
        novel.moralTone || 'neutral',
        previousPartSummary
      );
      if (aiContent) {
        setContent(prev => prev + (prev ? '\n\n' : '') + aiContent);
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || t('error_generating_content');
      showToast(errorMsg, 'error');
    }
    setGenerating(false);
  };

  const handleContinueChapter = async () => {
    if (!content.trim()) {
      showToast(t('content_required_for_continue', 'اكتب بداية الفصل أولاً لإكماله.'), 'error');
      return;
    }
    setContinuing(true);
    try {
      const contLang = novel.language || 'ar';
      const humanRulesForContinue = contLang === 'ar'
        ? `\n\n[قواعد أسلوبية إلزامية]: اكمل الفصل كروائي بشري محترف. لا تكرر ما سبق من أفكار أو عبارات. تابع بنفس النفَس الأدبي دون انقطاع. حافظ على صوت الشخصيات وأسلوبها. النص يجب أن يبدو إنسانياً تماماً لا مولَّداً آلياً.`
        : `\n\n[Mandatory style rules]: Continue as a skilled human novelist. Do not repeat previous ideas or phrases. Maintain the same literary voice without interruption. Preserve character voices and tone. The text must feel entirely human-written, never AI-generated.`;

      const continuation = await continueChapterContent(
        novel.title,
        chapter.title,
        content + humanRulesForContinue,
        contLang,
        novel.violenceLevel || 'none',
        novel.moralTone || 'neutral'
      );
      if (continuation) {
        setContent(prev => prev + '\n\n' + continuation);
        showToast(t('chapter_continued_success', 'تم إكمال الفصل بنجاح!'), 'success');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || t('error_continuing', 'حدث خطأ أثناء إكمال الفصل.'), 'error');
    }
    setContinuing(false);
  };

  const handleGenerateChapterDescription = async () => {
    setGeneratingDescription(true);
    try {
      const suggestedDescription = await generateChapterDescription(
        novel.title,
        novel.summary,
        chapter.title,
        novel.language || 'ar'
      );
      if (suggestedDescription) {
        setDescription(suggestedDescription);
        showToast(t('description_generated_success', 'تم توليد وصف الفصل بنجاح!'), 'success');

      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || t('error_generating_description', 'حدث خطأ أثناء توليد وصف الفصل.');
      showToast(errorMsg, 'error');
    }
    setGeneratingDescription(false);
  };

  const handleSuggestTitle = async () => {
    if (!content.trim()) {
      showToast(t('content_required_for_title', 'يرجى كتابة بعض المحتوى أولاً لتوليد عنوان مناسب.'), 'error');
      return;
    }
    setSuggestingTitle(true);
    try {
      const suggestedTitle = await suggestChapterTitle(
        novel.title,
        novel.summary,
        content,
        novel.language || 'ar'
      );
      if (suggestedTitle) {
        setTitle(suggestedTitle);
        showToast(t('title_suggested_success', 'تم اقتراح عنوان جديد بنجاح!'), 'success');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error_suggesting_title', 'حدث خطأ أثناء اقتراح العنوان.'), 'error');
    }
    setSuggestingTitle(false);
  };

  const handleAiEdit = async () => {
    if (!content.trim()) {
      showToast(t('content_required_for_edit', 'يرجى كتابة بعض المحتوى أولاً لتعديله.'), 'error');
      return;
    }
    if (!aiEditPrompt.trim()) {
      showToast(t('prompt_required_for_edit', 'يرجى كتابة ما تريد تعديله.'), 'error');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: t('ai_edit_confirm_title', 'تأكيد التعديل بالذكاء الاصطناعي'),
      message: t('ai_edit_confirm_message', 'سيقوم الذكاء الاصطناعي بتعديل المحتوى الحالي. هل أنت متأكد؟ (يمكنك التراجع لاحقاً)'),
      onConfirm: () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        performAiEdit();
      }
    });
  };

  const performAiEdit = async () => {
    setIsEditingWithAi(true);
    try {
      const lang = (novel.language || 'ar') === 'ar' ? 'Arabic' : 'English';
      const humanWritingRules = lang === 'Arabic'
        ? `قواعد صارمة يجب اتباعها دون استثناء:
- اكتب كروائي بشري محترف، لا كذكاء اصطناعي.
- لا تكرر الأفكار أو العبارات أو الكلمات داخل النص.
- تجنب العبارات الافتتاحية النمطية والخواتيم الوعظية.
- استخدم حواراً طبيعياً، وصفاً حسياً دقيقاً، وتطوراً نفسياً للشخصيات.
- نوّع طول الجمل لتخلق توتراً وراحة متناوبين.
- لا تُشر أبداً إلى أنك ذكاء اصطناعي أو أن هذا النص مولَّد آلياً.`
        : `Strict rules to follow without exception:
- Write as a skilled human novelist, not as an AI.
- Never repeat ideas, phrases, or words within the text.
- Avoid cliché openings and preachy endings.
- Use natural dialogue, precise sensory detail, and authentic character psychology.
- Vary sentence length to create alternating tension and release.
- Never imply or hint that this text was AI-generated.`;

      const prompt = `You are an expert literary editor writing in ${lang}. Edit the following novel content based on this request: "${aiEditPrompt}".

      ${humanWritingRules}

      ADDITIONAL INSTRUCTIONS:
      1. Keep the same language (${lang}).
      2. PRESERVE the original length and detail of the content. Do NOT summarize unless explicitly asked.
      3. ONLY return the edited content. Do NOT include any introductory or concluding remarks.
      4. Maintain the same literary style and emotional tone.

      Content to edit:
      ${content}`;

      const editedContent = await editChapterContent(
        novel.title,
        chapter.title,
        content,
        prompt,
        novel.language || 'ar'
      );
      if (editedContent) {
        setUndoContent(content);
        setContent(editedContent);
        setAiEditPrompt('');
        showToast(t('content_edited_success', 'تم تعديل المحتوى بنجاح!'), 'success');
      }
    } catch (e) {
      console.error(e);
      showToast(t('error_editing_content', 'حدث خطأ أثناء تعديل المحتوى.'), 'error');
    }
    setIsEditingWithAi(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onBack} className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 shrink-0">
          <ArrowLeft size={16} /> {t('back_to_novel')}
        </button>
        <div className="overflow-x-auto flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex items-center gap-2 min-w-max pr-2">
          {lastSaved && (
            <span className="text-[10px] opacity-30 shrink-0">
              {t('last_saved')} {lastSaved.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
            </span>
          )}
          <div className="hidden sm:flex items-center gap-2 relative shrink-0">
            <input 
              value={aiInstructions}
              onChange={e => setAiInstructions(e.target.value)}
              placeholder={t('ai_plot_placeholder', 'صف ما تريد كتابته هنا...')}
              className="bg-black/5 rounded-full px-4 py-2 text-[10px] outline-none border border-transparent focus:border-purple-300 w-32 md:w-56 lg:w-72 transition-all placeholder:text-black/30"
              onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
            />
            {aiInstructions && (
              <button 
                onClick={() => setAiInstructions('')}
                className="absolute right-3 text-black/30 hover:text-black"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button 
            onClick={handleAiGenerate} 
            disabled={generating || continuing}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50 shrink-0"
          >
            <Sparkles size={14} /> {generating ? t('writing_ai') : t('write_with_ai')}
          </button>
          <button 
            onClick={handleContinueChapter}
            disabled={generating || continuing || !content.trim()}
            className="flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 transition-all hover:bg-purple-100 disabled:opacity-50 shrink-0"
          >
            {continuing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {continuing ? t('continuing_chapter', 'جاري الإكمال...') : t('continue_chapter', 'أكمل الفصل')}
          </button>
          <button 
            onClick={handleCopyAll}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all hover:bg-black hover:text-white shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('copied') : t('copy_all', 'نسخ الكل')}
          </button>
          <button 
            onClick={handleCopyContent}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold transition-all hover:bg-black hover:text-white shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('copied') : t('copy_text')}
          </button>
          <span className="text-xs text-black/40 shrink-0">{saving ? t('saving') : t('saved')}</span>
          <button onClick={() => save(content, description, title)} className="monochrome-button py-2 text-sm shrink-0">
            <Save size={16} /> {t('save')}
          </button>
          </div>
        </div>
      </div>
      <div className="monochrome-card min-h-[600px] p-0 flex flex-col">
        <div className="border-b border-black/10 p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-grow max-w-2xl">
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="text-3xl font-serif font-bold tracking-tighter bg-transparent border-none outline-none w-full focus:ring-0"
                placeholder={t('chapter_title')}
              />
              <button 
                onClick={handleSuggestTitle}
                disabled={suggestingTitle}
                title={t('suggest_title_ai', 'اقتراح عنوان بالذكاء الاصطناعي')}
                className="p-2 rounded-full hover:bg-purple-50 text-purple-600 transition-all disabled:opacity-30"
              >
                {suggestingTitle ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-black/5 p-1 rounded-lg">
              <div className="flex items-center gap-1 border-r border-black/10 pr-2 mr-2">
                <Type size={14} className="opacity-40" />
                <select 
                  value={fontFamily} 
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    updateFormatting('fontFamily', e.target.value);
                  }}
                  className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer"
                >
                  <option value="var(--font-serif)">Serif (Default)</option>
                  <option value="var(--font-sans)">Sans (Inter)</option>
                  <option value="var(--font-amiri)">Amiri (Arabic)</option>
                  <option value="var(--font-cairo)">Cairo</option>
                  <option value="var(--font-tajawal)">Tajawal</option>
                  <option value="var(--font-lalezar)">Lalezar</option>
                  <option value="var(--font-merriweather)">Merriweather</option>
                  <option value="var(--font-roboto)">Roboto</option>
                </select>
              </div>

              <div className="flex items-center gap-1 border-r border-black/10 pr-2 mr-2">
                <span className="text-[10px] font-bold opacity-40">px</span>
                <select 
                  value={fontSize} 
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    updateFormatting('fontSize', e.target.value);
                  }}
                  className="bg-transparent text-[10px] font-bold outline-none cursor-pointer"
                >
                  <option value="0.875rem">14</option>
                  <option value="1rem">16</option>
                  <option value="1.125rem">18</option>
                  <option value="1.25rem">20</option>
                  <option value="1.5rem">24</option>
                  <option value="1.875rem">30</option>
                </select>
              </div>

              <div className="flex items-center gap-1 border-r border-black/10 pr-2 mr-2">
                <button 
                  onClick={() => { setTextAlign('left'); updateFormatting('textAlign', 'left'); }}
                  className={`p-1 rounded ${textAlign === 'left' ? 'bg-black text-white' : 'hover:bg-black/10'}`}
                >
                  <AlignLeft size={14} />
                </button>
                <button 
                  onClick={() => { setTextAlign('center'); updateFormatting('textAlign', 'center'); }}
                  className={`p-1 rounded ${textAlign === 'center' ? 'bg-black text-white' : 'hover:bg-black/10'}`}
                >
                  <AlignCenter size={14} />
                </button>
                <button 
                  onClick={() => { setTextAlign('right'); updateFormatting('textAlign', 'right'); }}
                  className={`p-1 rounded ${textAlign === 'right' ? 'bg-black text-white' : 'hover:bg-black/10'}`}
                >
                  <AlignRight size={14} />
                </button>
                <button 
                  onClick={() => { setTextAlign('justify'); updateFormatting('textAlign', 'justify'); }}
                  className={`p-1 rounded ${textAlign === 'justify' ? 'bg-black text-white' : 'hover:bg-black/10'}`}
                >
                  <AlignJustify size={14} />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <Baseline size={14} className="opacity-40" />
                <select 
                  value={lineHeight} 
                  onChange={(e) => {
                    setLineHeight(e.target.value);
                    updateFormatting('lineHeight', e.target.value);
                  }}
                  className="bg-transparent text-[10px] font-bold outline-none cursor-pointer"
                >
                  <option value="1.2">1.2</option>
                  <option value="1.5">1.5</option>
                  <option value="1.75">1.75</option>
                  <option value="2">2.0</option>
                  <option value="2.5">2.5</option>
                </select>
              </div>

              <button 
                onClick={applyToAllNovels}
                className="ml-2 rounded bg-black/10 px-2 py-1 text-[9px] font-bold hover:bg-black hover:text-white transition-colors"
                title={t('apply_to_all')}
              >
                {t('apply_to_all', 'تطبيق على الكل')}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase opacity-40">{t('chapter_description_label', 'وصف للأحداث بالفصل (AI)')}</label>
              <button 
                onClick={handleGenerateChapterDescription}
                disabled={generatingDescription}
                className="flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-800 disabled:opacity-50"
              >
                {generatingDescription ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                {t('ai_suggest_description', 'اقتراح وصف بالذكاء الاصطناعي')}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('chapter_description_placeholder', 'اكتب ملخصاً أو أحداثاً تريد أن يتناولها الفصل...')}
              className="w-full bg-black/5 rounded-lg p-3 text-xs outline-none focus:bg-black/10 transition-colors resize-none h-20"
            />
          </div>
        </div>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('start_writing_here')}
          style={{ 
            fontFamily: fontFamily, 
            fontSize: fontSize, 
            textAlign: textAlign as any,
            lineHeight: lineHeight
          }}
          className="flex-grow min-h-[500px] w-full resize-none p-8 outline-none"
        />
        <div className="border-t border-black/10 bg-black/5 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-50">{t('ai_editor_title', 'محرر الذكاء الاصطناعي الذكي')}</span>
          </div>
          <div className="flex gap-2">
            <input 
              value={aiEditPrompt}
              onChange={e => setAiEditPrompt(e.target.value)}
              placeholder={t('ai_edit_placeholder', 'مثال: غير اسم البطل إلى "صقر"، أو اجعل الحوار أكثر درامية...')}
              className="monochrome-input flex-grow text-sm py-2"
              onKeyDown={e => e.key === 'Enter' && handleAiEdit()}
            />
            <button 
              onClick={handleAiEdit}
              disabled={isEditingWithAi || !aiEditPrompt.trim()}
              className="monochrome-button px-6 py-2 text-sm flex items-center gap-2"
            >
              {isEditingWithAi ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {t('apply_edit', 'تطبيق التعديل')}
            </button>
            {undoContent && (
              <button 
                onClick={() => {
                  setContent(undoContent);
                  setUndoContent(null);
                  showToast(t('edit_undone', 'تم التراجع عن التعديل'), 'success');
                }}
                className="monochrome-button-outline px-4 py-2 text-sm flex items-center gap-2"
              >
                <RotateCcw size={14} />
                {t('undo', 'تراجع')}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SettingsView = ({ profile, onUpdateProfile, showToast, setView, isAdmin }: { profile: UserProfile, onUpdateProfile: (data: any) => Promise<void>, showToast: (msg: string, type?: 'success' | 'error') => void, setView: (v: any) => void, isAdmin: boolean }) => {
  const { t, i18n } = useTranslation();
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [photoURL, setPhotoURL] = useState(profile.photoURL || '');
  const [bannerURL, setBannerURL] = useState((profile as any).bannerURL || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [teraboxLink, setTeraboxLink] = useState(profile.teraboxLink || '');
  const [links, setLinks] = useState<ExternalLink[]>(profile.links || []);
  const [fontFamily, setFontFamily] = useState(profile.fontFamily || 'var(--font-serif)');
  const [customAiKey, setCustomAiKey] = useState(() => localStorage.getItem('custom_gemini_api_key') || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({ 
        uid: profile.uid,
        email: profile.email,
        displayName, 
        photoURL,
        bannerURL,
        bio,
        teraboxLink,
        links: links.filter(l => l.title.trim() && l.url.trim()),
        fontFamily
      });
      setSuccess(true);
      showToast(t('settings_saved_success', 'تم حفظ التعديلات بنجاح'), 'success');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      console.error("Save error:", e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      let displayError = t('error_updating_profile', 'حدث خطأ أثناء تحديث الملف الشخصي');
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.error) displayError += `: ${parsed.error}`;
      } catch {
        displayError += `: ${errorMsg}`;
      }
      showToast(displayError, 'error');
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await resizeAndCompressImage(reader.result as string, 400, 400, 0.75);
          setPhotoURL(compressed);
        } catch {
          setPhotoURL(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await resizeAndCompressImage(reader.result as string, 2048, 576, 0.8);
          setBannerURL(compressed);
        } catch {
          setBannerURL(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
      <button onClick={() => setView('explore')} className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
        <ArrowLeft size={14} /> {t('back')}
      </button>
      <h2 className="mb-8 text-4xl font-serif font-bold">{t('settings')}</h2>

      <div className="monochrome-card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold">{t('edit_profile')}</h3>
        </div>

        <div className="space-y-6">
          {/* Banner upload */}
          <div className="flex flex-col gap-3">
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50">{t('profile_banner', 'صورة البانر')}</label>
            <div className="relative w-full h-28 overflow-hidden rounded-lg border border-black/10 bg-black/5">
              {bannerURL ? (
                <img src={bannerURL} alt="banner preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
                  <span className="text-[10px] opacity-30 uppercase tracking-widest">{t('no_banner', 'لا توجد صورة بانر')}</span>
                </div>
              )}
              {bannerURL && (
                <button
                  onClick={() => setBannerURL('')}
                  className="absolute top-2 left-2 bg-white/90 rounded-full p-1 hover:bg-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleBannerUpload}
                className="block w-full text-sm text-black/50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-black/5 file:text-black hover:file:bg-black/10 transition-colors"
              />
              <p className="mt-1 text-[10px] opacity-30">{t('banner_size_hint', 'للحصول على أفضل النتائج، استخدم صورة بنسبة 16:9 (مثل 2048 × 1152 بكسل)')}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden border-2 border-black/5 bg-black/5">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div 
                  className="flex h-full w-full items-center justify-center bg-white text-black text-4xl"
                  style={{ fontFamily: fontFamily }}
                >
                  {displayName ? displayName[0].toUpperCase() : (profile.displayName ? profile.displayName[0].toUpperCase() : '?')}
                </div>
              )}
            </div>

            <div className="flex-grow w-full">
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('profile_picture', 'الصورة الشخصية')}</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-black/50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-black/5 file:text-black hover:file:bg-black/10 transition-colors"
              />
            </div>
          </div>

          <div className="flex-grow">
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('font_family', 'نوع الخط')}</label>
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full border-b border-black/10 py-2 outline-none focus:border-black text-xs"
              >
                <option value="var(--font-serif)">Serif (Amiri)</option>
                <option value="var(--font-sans)">Sans (Inter)</option>
                <option value="var(--font-cairo)">Cairo</option>
                <option value="var(--font-tajawal)">Tajawal</option>
                <option value="var(--font-lalezar)">Lalezar</option>
              </select>
            </div>

          <div className="border-t border-black/5 pt-6 space-y-4">
            <FileUploadComponent 
              path={`users/${profile.uid}/assets`}
              label={t('cloud_assets')}
              description={t('cloud_storage_description')}
              currentUrl={teraboxLink}
              onUploadSuccess={(url) => setTeraboxLink(url)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">{t('terabox_link_label', 'رابط سحابي يدوي')}</label>
              <input 
                type="text" 
                value={teraboxLink}
                onChange={(e) => setTeraboxLink(e.target.value)}
                placeholder="https://..."
                className="w-full border-b border-black/10 py-1 outline-none focus:border-black text-[10px] opacity-60 focus:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">{t('social_links')}</label>
              <button 
                onClick={() => setLinks([...links, { title: '', url: '' }])}
                className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full hover:bg-black/80 transition-all"
              >
                + {t('add_link')}
              </button>
            </div>
            <div className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="group relative flex flex-col gap-2 rounded-xl bg-black/[0.02] border border-black/5 p-4">
                  <button 
                    onClick={() => setLinks(links.filter((_, i) => i !== index))}
                    className="absolute top-2 left-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-[9px] uppercase opacity-30">{t('link_title')}</label>
                      <input 
                        type="text" 
                        value={link.title}
                        onChange={e => {
                          const newLinks = [...links];
                          newLinks[index].title = e.target.value;
                          setLinks(newLinks);
                        }}
                        placeholder={t('title_placeholder')}
                        className="w-full border-b border-black/10 py-1 text-xs outline-none focus:border-black bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] uppercase opacity-30">{t('link_url')}</label>
                      <input 
                        type="text" 
                        value={link.url}
                        onChange={e => {
                          const newLinks = [...links];
                          newLinks[index].url = e.target.value;
                          setLinks(newLinks);
                        }}
                        placeholder={t('url_placeholder')}
                        className="w-full border-b border-black/10 py-1 text-xs outline-none focus:border-black bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-center text-[10px] opacity-30 italic py-4">{t('no_links_added', 'لا يوجد روابط مضافة')}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('display_name')}</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('bio')}</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('bio')}
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black min-h-[100px] resize-none"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="monochrome-button w-full py-3"
          >
            {saving ? t('saving') : success ? t('settings_saved_success') : t('save_settings')}
          </button>

        </div>
      </div>

      <div className="monochrome-card mb-8 border border-amber-500/30 bg-amber-50/30">
        <h3 className="mb-2 font-bold flex items-center gap-2 text-base text-amber-950">
          <Sparkles size={18} className="text-amber-500" /> {t('ai_settings_title', 'تفعيل الذكاء الاصطناعي الحقيقي (Google Gemini)')}
        </h3>
        <p className="text-xs text-black/70 mb-4 leading-relaxed">
          {t('ai_settings_desc', 'لكتابة وتوليد الروايات والفصول بصورة حقيقية وديناميكية 100% بالذكاء الاصطناعي، أدخل مفتاحك المجاني من جوجل. الحصول عليه مجاني وبدون بطاقة بنكية.')}
        </p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              type="password"
              placeholder="ألصق مفتاح Gemini هنا (يبدأ بـ AIzaSy...)"
              value={customAiKey}
              onChange={(e) => setCustomAiKey(e.target.value)}
              className="monochrome-input flex-grow text-xs font-mono bg-white"
            />
            <button 
              onClick={() => {
                localStorage.setItem('custom_gemini_api_key', customAiKey.trim());
                showToast('تم حفظ وتفعيل مفتاح الذكاء الاصطناعي المباشر بنجاح!', 'success');
              }}
              className="monochrome-button px-5 py-2 text-xs whitespace-nowrap bg-black text-white"
            >
              {t('save_key', 'حفظ وتفعيل')}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-black/5">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
            >
              <ExternalLink size={14} /> {t('get_free_key_link', 'اضغط هنا للحصول على مفتاحك المجاني فوراً من Google AI Studio')}
            </a>
            {localStorage.getItem('custom_gemini_api_key') ? (
              <span className="text-[11px] font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                ✓ {t('key_active', 'المفتاح مفعل وشغال')}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                ⚠️ {t('no_key_set', 'لم يتم إدخال مفتاح بعد')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="monochrome-card mb-8">
        <h3 className="mb-4 font-bold">{t('about_app')}</h3>
        <p className="text-sm text-black/60">{t('app_name')} v1.0.0 - {t('ai_writing_platform')}</p>
      </div>

      {profile.role === 'admin' && (
        <div className="monochrome-card mb-8 border-red-500/20 bg-red-50/50">
          <h3 className="mb-6 font-bold text-red-600 flex items-center gap-2">
            <Settings size={18} /> AI Settings (Debug)
          </h3>
          <div className="space-y-4">
            <p className="text-xs text-red-600/60 mb-4">
              This section is only visible to admins. Use it to debug AI configurations.
            </p>
            <div className="flex items-center justify-between border-b border-red-500/10 py-2">
              <span className="text-xs font-bold">Current Model</span>
              <span className="text-xs opacity-50 font-mono">gemini-3-flash-preview</span>
            </div>
            <div className="flex items-center justify-between border-b border-red-500/10 py-2">
              <span className="text-xs font-bold">API Key Source</span>
              <span className="text-xs opacity-50 font-mono">Environment Variable</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const SearchView = ({ query, results, loading, onOpenNovel, onOpenProfile }: { 
  query: string, 
  results: { novels: Novel[], users: UserProfile[] }, 
  loading: boolean,
  onOpenNovel: (n: Novel) => void,
  onOpenProfile: (uid: string) => void
}) => {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-12">
        <h2 className="text-4xl font-serif font-bold tracking-tighter">{t('search_results_for')} {query}</h2>
        <p className="text-black/50">{t('found_novels_and_writers', { novels: results.novels.length, users: results.users.length })}</p>
      </div>

      {loading ? (
        <div className="flex py-20 justify-center"><div className="h-8 w-8 animate-spin border-4 border-black border-t-transparent"></div></div>
      ) : (
        <div className="space-y-12">
          {results.users.length > 0 && (
            <div>
              <h3 className="mb-6 text-xl font-bold">{t('writers')}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.users.map(user => (
                  <button 
                    key={user.uid}
                    onClick={() => onOpenProfile(user.uid)}
                    className="monochrome-card flex items-center gap-4 transition-all hover:border-black"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-black/5">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-black/20">
                          <UserIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{user.displayName}</div>
                      <div className="text-[10px] text-black/40">{t('view_profile')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.novels.length > 0 && (
            <div>
              <h3 className="mb-6 text-xl font-bold">{t('novels')}</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.novels.map(novel => (
                  <div key={novel.id} className="monochrome-card group flex flex-col overflow-hidden p-0">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/5">
                      {novel.coverImage ? (
                        <img src={novel.coverImage} alt={novel.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Logo size={64} className="opacity-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="mb-2 text-xl font-bold leading-tight">{novel.title}</h4>
                      <p className="mb-4 line-clamp-2 text-sm text-black/60">{novel.summary}</p>
                      <button 
                        onClick={() => onOpenNovel(novel)}
                        className="text-sm font-bold underline underline-offset-4"
                      >
                        {t('read_now')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.novels.length === 0 && results.users.length === 0 && (
            <div className="py-20 text-center text-black/30">
              {t('no_results_found')}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const LegalPage = ({ title, content, onBack }: { title: string, content: React.ReactNode, onBack: () => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm opacity-50 hover:opacity-100">
        <ArrowLeft size={16} /> {t('back', 'العودة')}
      </button>
      <div className="monochrome-card prose prose-sm sm:prose max-w-none prose-headings:font-serif">
        <h2 className="text-3xl font-serif font-bold mb-8">{title}</h2>
        {content}
      </div>
    </motion.div>
  );
};

const Footer = ({ setView }: { setView: (v: any) => void }) => {
  const { t } = useTranslation();
  const go = (v: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = v;
    setView(v);
  };
  return (
    <footer className="mt-20 border-t border-black/5 py-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
      <div className="flex flex-wrap justify-center gap-6 mb-4">
        <a href="#sitemap" onClick={go('sitemap')} className="hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"><MapIcon size={12} /> {t('sitemap', 'خريطة الموقع')}</a>
        <a href="#about" onClick={go('about')} className="hover:opacity-100 transition-opacity cursor-pointer">{t('about_us', 'من نحن')}</a>
        <a href="#contact" onClick={go('contact')} className="hover:opacity-100 transition-opacity cursor-pointer">{t('contact_us', 'اتصل بنا')}</a>
        <a href="#privacy" onClick={go('privacy')} className="hover:opacity-100 transition-opacity cursor-pointer">{t('privacy_policy', 'سياسة الخصوصية')}</a>
        <a href="#terms" onClick={go('terms')} className="hover:opacity-100 transition-opacity cursor-pointer">{t('terms_of_service', 'شروط الاستخدام')}</a>
      </div>
      <p>© {new Date().getFullYear()} {t('app_name')} - {t('all_rights_reserved', 'جميع الحقوق محفوظة')}</p>
    </footer>
  );
};

const CharacterManager = ({ novel, onBack, showToast }: { novel: Novel, onBack: () => void, showToast: (msg: string, type?: 'success' | 'error') => void }) => {
  const { t } = useTranslation();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'protagonist' | 'antagonist' | 'supporting'>('protagonist');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyChar = (char: Character) => {
    const text = `${char.name} (${t(char.role)}): ${char.description}`;
    navigator.clipboard.writeText(text);
    setCopiedId(char.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    api.getCharacters(novel.id)
      .then(rows => setCharacters(rows as Character[]))
      .catch(console.error);
  }, [novel.id]);

  const addChar = async () => {
    if (!newName) return;
    try {
      const created = await api.createCharacter(novel.id, {
        novelId: novel.id,
        name: newName,
        role: newRole,
        traits: '',
        description: '',
      });
      if (created) setCharacters(prev => [created as Character, ...prev]);
      setNewName('');
      setShowAdd(false);
    } catch (e: any) {
      showToast('فشل في إضافة الشخصية: ' + e.message, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-12 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100">
          <ArrowLeft size={16} /> {t('back_to_novel')}
        </button>
        <button onClick={() => setShowAdd(true)} className="monochrome-button py-2 text-sm">
          <Plus size={16} /> {t('add_character')}
        </button>
      </div>

      <h2 className="mb-8 text-4xl font-serif font-bold">{t('characters')}</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {characters.map(char => (
          <div key={char.id} className="monochrome-card">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t(char.role)}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCopyChar(char)}
                  className="text-black/20 hover:text-black"
                  title={t('copy')}
                >
                  {copiedId === char.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await api.deleteCharacter(novel.id, char.id);
                      setCharacters(prev => prev.filter(c => c.id !== char.id));
                    } catch (e: any) {
                      showToast('فشل في حذف الشخصية: ' + e.message, 'error');
                    }
                  }} 
                  className="text-black/20 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold">{char.name}</h3>
            <p className="mt-2 text-sm text-black/60">{char.description || t('no_description_yet')}</p>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white p-8">
            <h3 className="mb-6 text-2xl font-bold">{t('add_new_character')}</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('name')}</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="monochrome-input" placeholder={t('character_name')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest opacity-50">{t('role')}</label>
                <select 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value as any)}
                  className="monochrome-input"
                >
                  <option value="protagonist">{t('protagonist')}</option>
                  <option value="antagonist">{t('antagonist')}</option>
                  <option value="supporting">{t('supporting')}</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={addChar} className="monochrome-button flex-grow">{t('add')}</button>
                <button onClick={() => setShowAdd(false)} className="monochrome-button-outline flex-grow">{t('cancel')}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
