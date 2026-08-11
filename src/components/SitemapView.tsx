import React, { useEffect, useState } from 'react';
import { Map, BookOpen, User, FileText, Copy, ExternalLink, Search, Check, Globe, Layers, ArrowRight, Shield, FileCheck } from 'lucide-react';
import { getSitemapData } from '../lib/api';

interface SitemapViewProps {
  onNavigateNovel: (novelId: string) => void;
  onNavigateChapter: (novelId: string, chapterId: string) => void;
  onNavigateProfile: (uid: string, username?: string) => void;
  onNavigateView: (view: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SitemapView: React.FC<SitemapViewProps> = ({
  onNavigateNovel,
  onNavigateChapter,
  onNavigateProfile,
  onNavigateView,
  showToast,
}) => {
  const [loading, setLoading] = useState(true);
  const [sitemapData, setSitemapData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pages' | 'novels' | 'chapters' | 'users'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    getSitemapData()
      .then((data) => {
        setSitemapData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sitemap:', err);
        setLoading(false);
      });
  }, []);

  const copyToClipboard = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast(`تم نسخ رابط ${label}`, 'success');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const sitemapXmlUrl = `${origin}/sitemap.xml`;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-black/40">
        <Map className="animate-spin text-black" size={32} />
        <p className="text-sm font-bold">جاري تحميل خريطة الموقع المباشرة وتجميع الأرشيف...</p>
      </div>
    );
  }

  const query = search.trim().toLowerCase();

  const pagesList = (sitemapData?.staticPages || []).filter((p: any) =>
    p.title.toLowerCase().includes(query) || p.path.toLowerCase().includes(query)
  );

  const novelsList = (sitemapData?.novels || []).filter((n: any) =>
    n.title?.toLowerCase().includes(query) ||
    n.authorName?.toLowerCase().includes(query) ||
    n.genre?.toLowerCase().includes(query)
  );

  const chaptersList = (sitemapData?.chapters || []).filter((c: any) =>
    c.title?.toLowerCase().includes(query)
  );

  const usersList = (sitemapData?.users || []).filter((u: any) =>
    u.displayName?.toLowerCase().includes(query) ||
    u.username?.toLowerCase().includes(query) ||
    u.email?.toLowerCase().includes(query)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-8 md:p-10 shadow-2xl border border-white/10">
        <div className="absolute -left-10 -bottom-10 opacity-10 pointer-events-none">
          <Map size={320} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <Globe size={14} />
            <span>أرشيف محركات البحث المباشر (Dynamic XML &amp; HTML Sitemap)</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
            خريطة الموقع وأرشيف الروابط المباشر
          </h1>
          <p className="text-neutral-300 text-sm md:text-base max-w-2xl leading-relaxed">
            تأرشف هذه الخريطة جميع صفحات منصة روايتي، الروايات المنشورة، الفصول، وحسابات المؤلفين تلقائياً وبشكل ديناميكي لتسهيل الوصول ومحركات البحث.
          </p>

          {/* Stat Badges */}
          <div className="pt-2 flex flex-wrap gap-3 text-xs font-bold">
            <div className="bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
              <BookOpen size={16} className="text-amber-400" />
              <span>{sitemapData?.totalNovels || 0} روايات مأرشفة</span>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
              <Layers size={16} className="text-sky-400" />
              <span>{sitemapData?.totalChapters || 0} فصول مأرشفة</span>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
              <User size={16} className="text-purple-400" />
              <span>{sitemapData?.totalAuthors || 0} حسابات ومؤلفين</span>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
              <FileText size={16} className="text-emerald-400" />
              <span>{sitemapData?.staticPages?.length || 0} صفحات رسمية</span>
            </div>
          </div>

          {/* XML Link Actions */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95"
            >
              <ExternalLink size={16} />
              <span>عرض sitemap.xml المباشر</span>
            </a>
            <button
              onClick={() => copyToClipboard(sitemapXmlUrl, 'sitemap.xml')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95"
            >
              {copiedUrl === sitemapXmlUrl ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>نسخ رابط XML للأرشفة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-black/10 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في الأرشيف والروابط..."
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-black/5 border-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-black text-white' : 'bg-black/5 hover:bg-black/10 text-black/70'
            }`}
          >
            الكل ({pagesList.length + novelsList.length + chaptersList.length + usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pages' ? 'bg-black text-white' : 'bg-black/5 hover:bg-black/10 text-black/70'
            }`}
          >
            الصفحات ({pagesList.length})
          </button>
          <button
            onClick={() => setActiveTab('novels')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'novels' ? 'bg-black text-white' : 'bg-black/5 hover:bg-black/10 text-black/70'
            }`}
          >
            الروايات ({novelsList.length})
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chapters' ? 'bg-black text-white' : 'bg-black/5 hover:bg-black/10 text-black/70'
            }`}
          >
            الفصول ({chaptersList.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-black text-white' : 'bg-black/5 hover:bg-black/10 text-black/70'
            }`}
          >
            الحسابات ({usersList.length})
          </button>
        </div>
      </div>

      {/* 1. Main Pages */}
      {(activeTab === 'all' || activeTab === 'pages') && pagesList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/10">
            <FileText size={20} className="text-emerald-600" />
            <h2 className="text-xl font-bold font-display">الصفحات الرئيسية والخدمات</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagesList.map((p: any, idx: number) => {
              const fullUrl = `${origin}${p.path}`;
              return (
                <div
                  key={idx}
                  className="group bg-white p-4 rounded-2xl border border-black/10 hover:border-black/30 transition-all hover:shadow-md flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-neutral-900 group-hover:text-emerald-600 transition-colors">
                      {p.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      صفحة
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-black/50 truncate" dir="ltr">
                    {fullUrl}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                    <button
                      onClick={() => {
                        if (p.path.includes('view=')) {
                          const v = p.path.split('view=')[1];
                          onNavigateView(v);
                        } else if (p.path.includes('#')) {
                          const h = p.path.split('#')[1];
                          onNavigateView(h);
                        } else {
                          onNavigateView('explore');
                        }
                      }}
                      className="flex-1 bg-black/5 hover:bg-black hover:text-white text-neutral-800 text-xs font-bold py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <span>الانتقال للصفحة</span>
                      <ArrowRight size={12} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(fullUrl, p.title)}
                      className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-neutral-700 transition-all"
                      title="نسخ الرابط"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Archived Novels */}
      {(activeTab === 'all' || activeTab === 'novels') && novelsList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/10">
            <BookOpen size={20} className="text-amber-600" />
            <h2 className="text-xl font-bold font-display">الروايات المأرشفة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {novelsList.map((novel: any) => {
              const fullUrl = `${origin}/?novelId=${novel.id}`;
              return (
                <div
                  key={novel.id}
                  className="group bg-white p-4 rounded-2xl border border-black/10 hover:border-black/30 transition-all hover:shadow-md flex flex-col justify-between gap-3"
                >
                  <div className="flex gap-3 items-start">
                    {novel.coverImage ? (
                      <img
                        src={novel.coverImage}
                        alt={novel.title}
                        className="w-14 h-20 object-cover rounded-xl border border-black/10 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-20 rounded-xl bg-black/5 flex items-center justify-center border border-black/10 shrink-0">
                        <BookOpen size={20} className="opacity-30" />
                      </div>
                    )}
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-neutral-900 truncate group-hover:text-amber-600 transition-colors">
                        {novel.title}
                      </h3>
                      <p className="text-xs text-black/50 truncate">
                        بقلم: {novel.authorName || 'غير محدد'}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-black/40 pt-1">
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                          {novel.genre || 'عام'}
                        </span>
                        <span>• {novel.viewsCount || 0} مشاهدة</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-black/40 truncate" dir="ltr">
                    {fullUrl}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                    <button
                      onClick={() => onNavigateNovel(novel.id)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>قراءة الرواية</span>
                      <ArrowRight size={12} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(fullUrl, novel.title)}
                      className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-neutral-700 transition-all"
                      title="نسخ الرابط"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Archived Chapters */}
      {(activeTab === 'all' || activeTab === 'chapters') && chaptersList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/10">
            <Layers size={20} className="text-sky-600" />
            <h2 className="text-xl font-bold font-display">فصول الروايات المأرشفة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {chaptersList.map((ch: any) => {
              const fullUrl = `${origin}/?novelId=${ch.novelId}&chapterId=${ch.id}`;
              return (
                <div
                  key={ch.id}
                  className="bg-white p-3.5 rounded-2xl border border-black/10 hover:border-sky-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-bold text-xs text-neutral-900 truncate">
                      فصل {ch.chapterNumber}: {ch.title}
                    </p>
                    <p className="text-[10px] font-mono text-black/40 truncate" dir="ltr">
                      {fullUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onNavigateChapter(ch.novelId, ch.id)}
                      className="p-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white transition-all text-xs font-bold"
                      title="قراءة الفصل"
                    >
                      <ArrowRight size={14} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(fullUrl, `الفصل ${ch.chapterNumber}`)}
                      className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-black/60 transition-all"
                      title="نسخ الرابط"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Authors and Users */}
      {(activeTab === 'all' || activeTab === 'users') && usersList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/10">
            <User size={20} className="text-purple-600" />
            <h2 className="text-xl font-bold font-display">حسابات الكُتّاب والأعضاء</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersList.map((usr: any) => {
              const param = usr.username ? `username=${encodeURIComponent(usr.username)}` : `profileUid=${usr.uid}`;
              const fullUrl = `${origin}/?${param}`;
              return (
                <div
                  key={usr.uid}
                  className="group bg-white p-4 rounded-2xl border border-black/10 hover:border-black/30 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {usr.photoUrl ? (
                      <img
                        src={usr.photoUrl}
                        alt={usr.displayName || 'مستخدم'}
                        className="w-12 h-12 rounded-full object-cover border border-black/10 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {(usr.displayName || 'م')[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h3 className="font-bold text-sm text-neutral-900 truncate group-hover:text-purple-600 transition-colors">
                        {usr.displayName || 'كاتب ومؤلف'}
                      </h3>
                      {usr.username && (
                        <p className="text-xs text-black/50 font-mono truncate" dir="ltr">
                          @{usr.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-black/40 truncate" dir="ltr">
                    {fullUrl}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                    <button
                      onClick={() => onNavigateProfile(usr.uid, usr.username)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>زيارة الملف الشخصي</span>
                      <ArrowRight size={12} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(fullUrl, usr.displayName || 'الحساب')}
                      className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-neutral-700 transition-all"
                      title="نسخ الرابط"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
