import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Code, 
  Upload, 
  BookOpen, 
  Key, 
  Sparkles, 
  ExternalLink,
  Layers,
  Terminal,
  FileCode,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { UserProfile } from '../types';

interface ApiDocsViewProps {
  onBack: () => void;
  userProfile: UserProfile | null;
  effectiveUserId: string | null;
  onNavigateNovel?: (novelId: string) => void;
  onNavigateDashboard?: () => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({
  onBack,
  userProfile,
  effectiveUserId,
  onNavigateNovel,
  onNavigateDashboard,
  showToast,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'js' | 'python' | 'curl' | 'widget'>('js');
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive Tester State
  const [testTitle, setTestTitle] = useState('رواية تجريبية من موقع خارجي');
  const [testGenre, setTestGenre] = useState('drama');
  const [testSummary, setTestSummary] = useState('هذه الرواية تم استيرادها تلقائياً لاختبار واجهة برمجة التطبيقات API الخاصة بمنصة روايتي.');
  const [testChapterTitle, setTestChapterTitle] = useState('الفصل 1: بداية المغامرة');
  const [testChapterContent, setTestChapterContent] = useState('جلس الكاتب أمام الشاشة وهو ينظر إلى الأفق البعيد، وبدأت أحداث الرواية تتشابك في مخيلته...');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const authorToken = effectiveUserId || (userProfile?.uid ?? '');

  const copyToClipboard = (text: string, isKey = false) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
    if (showToast) showToast('تم النسخ إلى الحافظة!', 'success');
  };

  const handleTestUpload = async () => {
    if (!authorToken) {
      if (showToast) showToast('يرجى تسجيل الدخول أولاً في الموقع لاستخدام المعرف الخاص بك في التجربة.', 'error');
      return;
    }
    if (!testTitle.trim()) {
      if (showToast) showToast('يرجى إدخال عنوان الرواية', 'error');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const payload = {
        novel: {
          title: testTitle.trim(),
          genre: testGenre,
          summary: testSummary.trim(),
          status: 'draft',
        },
        chapters: [
          {
            title: testChapterTitle.trim() || 'الفصل الأول',
            content: testChapterContent.trim(),
            order: 1,
          },
        ],
      };

      const res = await fetch('/api/external/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authorToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        if (showToast) showToast('تم رفع الرواية وفصلها بنجاح! انتقل لقائمة "اكتب" لمعاينتها.', 'success');
      } else {
        if (showToast) showToast(data.message || 'فشل الرفع التجريبي', 'error');
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
      if (showToast) showToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
      setTesting(false);
    }
  };

  // Code snippets
  const jsSnippet = `// دالة إرسال الرواية وفصولها من أي موقع أو محرر خارجي
async function uploadNovelToRoayti() {
  const AUTHOR_TOKEN = "${authorToken || 'YOUR_AUTHOR_UID_OR_KEY'}"; // ضع معرّف حسابك هنا

  const novelPayload = {
    novel: {
      title: "عنوان الرواية الجديد",
      summary: "ملخص أو مقدمة الرواية هنا...",
      genre: "fantasy", // drama, fantasy, sci-fi, action, mystery, horror, romance
      coverImage: "", // رابط صورة الغلاف (اختياري)
      status: "draft" // "draft" لتظهر في مسودات "اكتب"، أو "published"
    },
    chapters: [
      {
        title: "الفصل الأول: البداية",
        content: "نص الفصل الأول كاملاً هنا...",
        order: 1
      },
      {
        title: "الفصل الثاني: نقطة التحول",
        content: "نص الفصل الثاني كاملاً هنا...",
        order: 2
      }
    ]
  };

  try {
    const response = await fetch("https://www.roayti.com/api/external/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${AUTHOR_TOKEN}\`
      },
      body: JSON.stringify(novelPayload)
    });

    const result = await response.json();
    if (result.success) {
      console.log("تم الرفع بنجاح!", result);
      alert("تم رفع الرواية بنجاح إلى حسابك في روايتي!");
      // فتح صفحة تحرير الرواية في نافذة جديدة
      window.open(result.urls.studioUrl, "_blank");
    } else {
      console.error("فشل الرفع:", result.message);
      alert("خطأ: " + result.message);
    }
  } catch (error) {
    console.error("خطأ في الاتصال:", error);
  }
}`;

  const pythonSnippet = `import requests

AUTHOR_TOKEN = "${authorToken || 'YOUR_AUTHOR_UID_OR_KEY'}" # معرّف حسابك في روايتي
API_URL = "https://www.roayti.com/api/external/import"

payload = {
    "novel": {
        "title": "عنوان الرواية من بايثون",
        "summary": "ملخص الرواية المنقولة عبر بايثون...",
        "genre": "drama",
        "status": "draft"
    },
    "chapters": [
        {
            "title": "الفصل 1: رحلة جديدة",
            "content": "نص الفصل الأول...",
            "order": 1
        },
        {
            "title": "الفصل 2: التحدي القادم",
            "content": "نص الفصل الثاني...",
            "order": 2
        }
    ]
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {AUTHOR_TOKEN}"
}

response = requests.post(API_URL, json=payload, headers=headers)
data = response.json()

if data.get("success"):
    print(f"✓ تم رفع الرواية بنجاح! معرّف الرواية: {data['novel']['id']}")
    print(f"رابط التحرير: {data['urls']['studioUrl']}")
else:
    print(f"✗ حدث خطأ: {data.get('message')}")`;

  const curlSnippet = `curl -X POST https://www.roayti.com/api/external/import \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${authorToken || 'YOUR_AUTHOR_UID_OR_KEY'}" \\
  -d '{
    "novel": {
      "title": "عنوان الرواية عبر cURL",
      "summary": "ملخص الرواية...",
      "genre": "drama",
      "status": "draft"
    },
    "chapters": [
      {
        "title": "الفصل الأول",
        "content": "محتوى الفصل هنا...",
        "order": 1
      }
    ]
  }'`;

  const widgetSnippet = `<!-- كود زر ونافذة منبثقة جاهز للإضافة في أي موقع كتابة روايات -->
<button id="roaytiUploadBtn" style="padding:10px 20px; background:#000; color:#fff; border-radius:6px; font-weight:bold; cursor:pointer;">
  📤 رفع إلى roayti.com
</button>

<script>
document.getElementById('roaytiUploadBtn').addEventListener('click', async () => {
  const token = prompt("أدخل معرّف الكاتب الخاص بك على roayti.com (تجده في صفحة الـ API):");
  if (!token) return;

  const novelData = {
    novel: {
      title: document.title || "روايتي من الموقع",
      status: "draft"
    },
    chapters: [
      { title: "الفصل 1", content: document.body.innerText.substring(0, 1000), order: 1 }
    ]
  };

  try {
    const res = await fetch("https://www.roayti.com/api/external/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(novelData)
    });
    const result = await res.json();
    if (result.success) {
      alert("تم رفع الرواية بنجاح إلى قائمة 'اكتب' في حسابك!");
      window.open(result.urls.studioUrl, "_blank");
    } else {
      alert("خطأ: " + result.message);
    }
  } catch (e) {
    alert("تعذر الاتصال بـ roayti.com");
  }
});
<\/script>`;

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 text-right" dir="rtl">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors"
      >
        <ArrowLeft size={16} /> العودة للرئيسية
      </button>

      {/* Hero Section */}
      <div className="border border-black/10 bg-white p-6 sm:p-10 shadow-sm mb-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-black/[0.02] rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold">
              <Zap size={13} className="text-yellow-400" />
              واجهة الربط البرمجي v1.0
            </span>
            <span className="text-xs text-black/40 font-medium">REST API & Import Flow</span>
          </div>
          <div className="text-xs text-black/50 font-semibold flex items-center gap-1">
            <Globe size={14} /> نقطة النهاية: <code className="bg-black/5 px-2 py-0.5 rounded font-mono text-[11px]">https://www.roayti.com/api/external</code>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-black mb-3">
          واجهة برمجة التطبيقات (Roayti API)
        </h1>
        <p className="text-sm sm:text-base text-black/70 leading-relaxed max-w-3xl">
          أهلاً بك في واجهة الربط البرمجي لمنصة <strong>روايتي (roayti.com)</strong>. صُممت هذه الواجهة لتمكين المطورين والكتاب من ربط أي موقع، أو تطبيق، أو محرر نصوص خارجي مباشرة مع منصة روايتي، بحيث يمكنك بنقرة واحدة إرسال الرواية بكامل فصولها وتفاصيلها لتظهر تلقائياً داخل قائمة <strong>"اكتب"</strong> في حسابك لتعديلها ومتابعتها ونشرها.
        </p>
      </div>

      {/* Author Authentication & Token Card */}
      <div className="border-2 border-black/15 bg-black/[0.02] p-6 sm:p-8 rounded-lg mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Key size={20} className="text-black/70" />
          <h2 className="text-lg sm:text-xl font-bold">الخطوة الأولى: معرّف الكاتب الخاص بك (Author Key / Token)</h2>
        </div>
        <p className="text-xs sm:text-sm text-black/60 mb-4 leading-relaxed">
          لكل كاتب في منصة روايتي معرّف فريد. عند إرسال طلب الرفع من موقعك الخارجي، زوّد هذا المعرّف في ترويسة الطلب <code className="bg-black/10 px-1.5 py-0.5 rounded font-mono">Authorization: Bearer YOUR_TOKEN</code> لترتبط الرواية بحسابك فوراً وتظهر في استوديو "اكتب" الخاص بك.
        </p>

        {authorToken ? (
          <div className="bg-white border border-black/15 p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest">معرّف حسابك المصادق عليه:</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-black select-all break-all">{authorToken}</span>
              {userProfile?.displayName && (
                <span className="text-xs text-emerald-600 font-semibold mt-1">✓ مسجل باسم: {userProfile.displayName}</span>
              )}
            </div>
            <button
              onClick={() => copyToClipboard(authorToken, true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded hover:bg-black/80 transition-all active:scale-95 whitespace-nowrap self-start sm:self-center"
            >
              {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copiedKey ? 'تم النسخ!' : 'نسخ المعرّف'}
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-amber-800">
              أنت غير مسجل الدخول حالياً. يرجى تسجيل الدخول في الموقع لتوليد وعرض معرّفك الشخصي هنا.
            </div>
            <a
              href="#dashboard"
              onClick={onNavigateDashboard}
              className="px-4 py-2 bg-black text-white text-xs font-bold rounded whitespace-nowrap hover:bg-black/80 transition-all"
            >
              تسجيل الدخول الآن
            </a>
          </div>
        )}
      </div>

      {/* Main Endpoints Specification */}
      <div className="space-y-8 mb-12">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Layers size={22} />
            نقاط النهاية المتاحة (API Endpoints)
          </h2>
        </div>

        {/* Endpoint 1: Import Novel & Chapters */}
        <div className="border border-black/15 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-2.5 py-1 bg-emerald-600 text-white font-mono text-xs font-bold rounded">POST</span>
            <code className="text-sm font-mono font-bold text-black break-all">https://www.roayti.com/api/external/import</code>
            <span className="text-xs text-black/50 font-medium">استيراد وإنشاء رواية جديدة مع فصولها دفعة واحدة</span>
          </div>

          <p className="text-xs sm:text-sm text-black/70 mb-4">
            تنشئ هذه النقطة رواية جديدة مرتبطة بحساب الكاتب، وتضيف جميع فصولها بالترتيب المطلوب مع نصوصها الكاملة. يتم ضبط حالة الرواية تلقائياً على <code className="bg-black/5 px-1 py-0.5 rounded font-mono">draft</code> لتتمكن من مراجعتها وتعديلها من قائمة "اكتب"، أو <code className="bg-black/5 px-1 py-0.5 rounded font-mono">published</code> للنشر المباشر.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Headers */}
            <div className="bg-black/[0.02] border border-black/10 p-4 rounded">
              <span className="font-sans font-bold text-black/50 block mb-2 text-xs">ترويسات الطلب (Headers):</span>
              <p>Content-Type: application/json</p>
              <p className="text-emerald-700">Authorization: Bearer YOUR_AUTHOR_UID</p>
            </div>

            {/* Response */}
            <div className="bg-black/[0.02] border border-black/10 p-4 rounded">
              <span className="font-sans font-bold text-black/50 block mb-2 text-xs">الاستجابة الناجحة (201 Created):</span>
              <pre className="text-[11px] overflow-x-auto text-black/80">
{`{
  "success": true,
  "message": "تم رفع واستيراد رواية...",
  "novel": { "id": "...", "title": "...", "chaptersCount": 5 },
  "urls": {
    "studioUrl": "https://www.roayti.com/#editor?novelId=...",
    "novelUrl": "https://www.roayti.com/#novel?id=...",
    "dashboardUrl": "https://www.roayti.com/#dashboard"
  }
}`}
              </pre>
            </div>
          </div>

          {/* Body Schema */}
          <div className="mt-4 bg-black/[0.02] border border-black/10 p-4 rounded text-xs">
            <span className="font-sans font-bold text-black/50 block mb-2 text-xs">هيكل البيانات المرسلة (JSON Body Schema):</span>
            <pre className="font-mono text-[11px] sm:text-xs overflow-x-auto text-black/80" dir="ltr">
{`{
  "novel": {
    "title": "عنوان الرواية (مطلوب - String)",
    "summary": "ملخص أو مقدمة الرواية (اختياري - String)",
    "genre": "drama", // drama, fantasy, sci-fi, action, mystery, horror, romance
    "coverImage": "https://... أو data:image/jpeg;base64,... (اختياري)",
    "status": "draft" // "draft" أو "published" (الافتراضي: draft لتظهر في قائمة اكتب)
  },
  "chapters": [
    {
      "title": "عنوان الفصل الأول (مطلوب - String)",
      "content": "النص الكامل للفصل هنا (String)",
      "description": "وصف قصير للفصل (اختياري - String)",
      "order": 1 // ترتيب الفصل (Integer)
    }
  ]
}`}
            </pre>
          </div>
        </div>

        {/* Endpoint 2: Add Chapters in Batch */}
        <div className="border border-black/15 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-blue-600 text-white font-mono text-xs font-bold rounded">POST</span>
            <code className="text-sm font-mono font-bold text-black break-all">https://www.roayti.com/api/external/novels/:novelId/chapters/batch</code>
            <span className="text-xs text-black/50 font-medium">إضافة دفعات فصول جديدة لرواية موجودة</span>
          </div>
          <p className="text-xs text-black/70 mb-3">
            إذا كنت تكتب فصولاً جديدة لاحقاً على موقعك الخارجي، يمكنك إرسال الفصول الإضافية دفعة واحدة لنفس الرواية بإرسال مصفوفة <code className="font-mono">chapters</code>.
          </p>
        </div>

        {/* Endpoint 3: Verify Connection */}
        <div className="border border-black/15 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-purple-600 text-white font-mono text-xs font-bold rounded">POST</span>
            <code className="text-sm font-mono font-bold text-black break-all">https://www.roayti.com/api/external/auth/verify</code>
            <span className="text-xs text-black/50 font-medium">التحقق من صحة مفتاح الربط وهوية الكاتب</span>
          </div>
          <p className="text-xs text-black/70">
            تتيح للموقع الخارجي التأكد من اتصال حساب الكاتب بنجاح، وتُرجع اسمه وصورته الشخصية وعدد رواياته الحالية.
          </p>
        </div>
      </div>

      {/* Code Examples Section */}
      <div className="border border-black/15 bg-white p-6 sm:p-8 rounded-lg shadow-sm mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileCode size={20} />
              أمثلة برمجية جاهزة للنسخ والاستخدام
            </h2>
            <p className="text-xs text-black/50">اختر لغة البرمجة المفضلة لديك لنسخ كود الربط الفوري</p>
          </div>

          <div className="flex items-center gap-1 bg-black/5 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('js')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${activeTab === 'js' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'}`}
            >
              JavaScript / Fetch
            </button>
            <button
              onClick={() => setActiveTab('widget')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${activeTab === 'widget' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'}`}
            >
              زر HTML جاهز للمواقع
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${activeTab === 'python' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'}`}
            >
              Python
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${activeTab === 'curl' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'}`}
            >
              cURL
            </button>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              const textToCopy =
                activeTab === 'js'
                  ? jsSnippet
                  : activeTab === 'python'
                  ? pythonSnippet
                  : activeTab === 'curl'
                  ? curlSnippet
                  : widgetSnippet;
              copyToClipboard(textToCopy);
            }}
            className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-sm transition-all"
          >
            {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copiedCode ? 'تم النسخ' : 'نسخ الكود'}
          </button>

          <pre
            className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed max-h-96"
            dir="ltr"
          >
            {activeTab === 'js' && jsSnippet}
            {activeTab === 'python' && pythonSnippet}
            {activeTab === 'curl' && curlSnippet}
            {activeTab === 'widget' && widgetSnippet}
          </pre>
        </div>
      </div>

      {/* Interactive API Tester */}
      <div className="border-2 border-emerald-600/30 bg-emerald-50/20 p-6 sm:p-8 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={22} className="text-emerald-600" />
          <h2 className="text-xl font-bold">جرّب الـ API مباشرة من هنا (Interactive Live Tester)</h2>
        </div>
        <p className="text-xs text-black/60 mb-6">
          يمكنك تجربة إرسال رواية حية الآن والتأكد من نجاح العملية وظهورها في قائمة "اكتب" بحسابك:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-black/70 mb-1">عنوان الرواية التجريبية</label>
            <input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="monochrome-input text-xs"
              placeholder="مثال: رحلة إلى المجهول"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black/70 mb-1">التصنيف</label>
            <select
              value={testGenre}
              onChange={(e) => setTestGenre(e.target.value)}
              className="monochrome-input text-xs"
            >
              <option value="drama">دراما (Drama)</option>
              <option value="fantasy">فانتازيا (Fantasy)</option>
              <option value="action">أكشن (Action)</option>
              <option value="sci-fi">خيال علمي (Sci-Fi)</option>
              <option value="mystery">غموض (Mystery)</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-black/70 mb-1">ملخص الرواية</label>
          <textarea
            rows={2}
            value={testSummary}
            onChange={(e) => setTestSummary(e.target.value)}
            className="monochrome-input text-xs"
            placeholder="نبذة عن الرواية..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-black/70 mb-1">عنوان الفصل التجريبي</label>
            <input
              type="text"
              value={testChapterTitle}
              onChange={(e) => setTestChapterTitle(e.target.value)}
              className="monochrome-input text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black/70 mb-1">محتوى الفصل التجريبي</label>
            <textarea
              rows={2}
              value={testChapterContent}
              onChange={(e) => setTestChapterContent(e.target.value)}
              className="monochrome-input text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleTestUpload}
            disabled={testing || !authorToken}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
          >
            {testing ? <span className="animate-spin text-sm">⏳</span> : <Upload size={15} />}
            {testing ? 'جارٍ الإرسال والتخزين...' : 'إرسال الرواية التجريبية إلى حسابي'}
          </button>
          {!authorToken && (
            <span className="text-xs text-red-600 font-semibold">يجب تسجيل الدخول لإجراء التجربة</span>
          )}
        </div>

        {testResult && (
          <div className="mt-6 p-4 bg-white border border-black/10 rounded-lg">
            <span className="text-xs font-bold block mb-2">نتيجة الطلب (Response):</span>
            <div className={`p-3 rounded text-xs mb-3 ${testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {testResult.message || (testResult.success ? 'تم الاستيراد بنجاح' : testResult.error)}
            </div>
            {testResult.success && testResult.novel && (
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`#editor?novelId=${testResult.novel.id}`}
                  onClick={() => {
                    if (onNavigateNovel) onNavigateNovel(testResult.novel.id);
                  }}
                  className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded flex items-center gap-1.5 hover:bg-black/80"
                >
                  <ExternalLink size={13} />
                  فتح الرواية في محرر "اكتب"
                </a>
                <a
                  href="#dashboard"
                  onClick={onNavigateDashboard}
                  className="px-4 py-1.5 bg-black/5 hover:bg-black/10 text-black text-xs font-bold rounded flex items-center gap-1.5"
                >
                  <BookOpen size={13} />
                  الانتقال لقائمة "اكتب" الكاملة
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDocsView;
