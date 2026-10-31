import React, { useState } from 'react';
import { 
  ArrowLeft, Shield, Lock, Eye, Cookie, FileText, CheckCircle2, Globe, 
  Database, UserCheck, Bell, Server, AlertTriangle, HelpCircle, RefreshCw, Key
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<'ar' | 'en'>(i18n.language === 'en' ? 'en' : 'ar');
  const isAr = lang === 'ar';

  return (
    <div className={`mx-auto max-w-4xl py-6 px-4 sm:px-6 transition-all ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-black/60 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} />
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang('ar')}
            className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${isAr ? 'bg-black text-white' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}
          >
            العربية
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${!isAr ? 'bg-black text-white' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}
          >
            English
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-sm border border-emerald-100">
          <Shield size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight mb-3">
          {isAr ? 'وثيقة سياسة الخصوصية الشاملة وملفات تعريف الارتباط' : 'Comprehensive Privacy & Cookie Policy'}
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'آخر تحديث: 2026 — نلتزم في منصة «روايتي» (Roayti.com) بحماية أقصى درجات الخصوصية للمستخدمين والكتاب والزوار، وفق أعلى المعايير التشريعية الدولية (GDPR, CCPA, COPPA) ومعايير شبكة Google الإعلانية (Google AdSense).'
            : 'Last Updated: 2026 — At Roayti.com, we are committed to the highest level of user, author, and visitor privacy, fully compliant with global data protection laws (GDPR, CCPA, COPPA) and Google AdSense publisher partner policies.'}
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 leading-relaxed text-gray-700">
        
        {/* Section 1: Scope & Controller */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">1</span>
            {isAr ? 'المقدمة، والجهة المتحكمة بالبيانات، ونطاق التطبيق' : '1. Introduction, Data Controller & Scope'}
          </h2>
          <p className="text-sm leading-relaxed">
            {isAr
              ? 'مرحباً بك في منصة «روايتي» (المشار إليها بـ "روايتي"، "المنصة"، "نحن"، أو "الموقع"، عبر النطاق roayti.com). توضح هذه السياسة الشاملة كيفية جمع بياناتك الشخصية وحفظها واستخدامها ومشاركتها والتحكم بها عند استخدام خدماتنا الرقمية ومحرر الروايات وقارئ الفصول وأدوات الذكاء الاصطناعي. تُعد منصة روايتي هي "المتحكم بالبيانات" (Data Controller) المسؤول عن معالجة معلوماتك الشخصية بموجب اللائحة الأوروبية العامة لحماية البيانات (GDPR).'
              : 'Welcome to Roayti ("Roayti", "Platform", "we", "us", or "our", via roayti.com). This comprehensive Privacy Policy governs the collection, storage, processing, transfer, and protection of your personal information when interacting with our novel publishing platform, interactive reader, and AI creative suite. Roayti acts as the Data Controller responsible for your personal data under the EU General Data Protection Regulation (GDPR).'}
          </p>
        </section>

        {/* Section 2: Google AdSense, DoubleClick & Advertising Cookies */}
        <section className="space-y-4 p-5 rounded-xl bg-amber-50/50 border border-amber-200/60">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Cookie size={20} className="text-amber-600" />
            {isAr ? '2. إعلانات Google AdSense، وملفات تعريف الارتباط DART، وشبكات الإعلان' : '2. Google AdSense, DART Cookies & Third-Party Advertising'}
          </h2>
          <div className="text-sm space-y-3 text-gray-700">
            <p>
              {isAr
                ? 'نحن نعتمد على خدمات Google AdSense وشبكات إعلانية معتمدة من جهات خارجية لتمويل تشغيل الموقع وتقديم خدمات القراءة المجانية للجميع. يُرجى مراجعة وتفهم البنود الصريحة التالية:'
                : 'We partner with Google AdSense and accredited third-party advertising networks to support our infrastructure and keep our reading platform free for everyone. Please review the following explicit disclosures:'}
            </p>
            <ul className="list-disc list-inside space-y-2 pr-2">
              <li>
                <strong>{isAr ? 'ملف تعريف الارتباط DoubleClick DART:' : 'DoubleClick DART Cookie:'}</strong>{' '}
                {isAr
                  ? 'تستخدم Google، بصفتها مورِّداً ومقدّم خدمة إعلانية خارجياً، ملفات تعريف الارتباط لعرض الإعلانات على موقعنا. يتيح استخدام Google لملف تعريف الارتباط DART عرض إعلانات للمستخدمين استناداً إلى زيارتهم لموقع روايتي ولمواقع أخرى عبر الإنترنت.'
                  : 'Google, as a third-party vendor, uses cookies to serve ads on our site. Google\'s use of the DART cookie enables it to serve ads to users based on their visit to Roayti and other sites on the Internet.'}
              </li>
              <li>
                <strong>{isAr ? 'إلغاء الاشتراك في الإعلانات المخصصة (Opt-Out):' : 'Opting Out of Personalized Ads:'}</strong>{' '}
                {isAr
                  ? 'يحق للمستخدمين في أي وقت تعطيل استخدام ملف تعريف الارتباط DART للإعلانات المخصصة عن طريق زيارة صفحة إعدادات إعلانات Google الرسمية على: '
                  : 'Users may opt out of personalized advertising by visiting Google Ads Settings at: '}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline hover:text-emerald-800">
                  adssettings.google.com
                </a>
                {isAr ? ' أو عبر بوابة مبادرة الإعلانات على شبكة الإنترنت (NAI) أو ' : ' or via the Network Advertising Initiative (NAI) or '}
                <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline hover:text-emerald-800">
                  aboutads.info
                </a>.
              </li>
              <li>
                <strong>{isAr ? 'خوادم وشبكات الطرف الثالث:' : 'Third-Party Ad Networks:'}</strong>{' '}
                {isAr
                  ? 'قد تستخدم شبكات إعلانية شريكة تقنيات مثل الكوكيز وجافا سكريبت وإشارات الويب (Web Beacons) في إعلاناتها المعروضة على منصة روايتي لقياس فاعلية الحملات وتخصيص تجربة الإعلان. لا تملك منصة روايتي حق الوصول إلى ملفات تعريف الارتباط هذه أو التحكم المباشر فيها.'
                  : 'Third-party ad servers or networks use cookies, JavaScript, and Web Beacons in their respective advertisements. These are sent directly to your browser to gauge ad performance and personalize content. Roayti does not control or access these third-party cookies.'}
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Data We Collect */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">3</span>
            {isAr ? 'فئات البيانات والمعلومات التي نجمعها' : '3. Categories of Data Collected'}
          </h2>
          <div className="text-sm space-y-3">
            <p>
              {isAr
                ? 'نقوم بجمع ومعالجة الفئات التالية من البيانات وفق مبدأ "الحد الأدنى الضروري من البيانات" (Data Minimization):'
                : 'We collect and process the following categories of data in strict observance of data minimization principles:'}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck size={14} className="text-emerald-600" />
                  {isAr ? 'أ. بيانات الهوية والحساب' : 'A. Account & Identity Data'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isAr
                    ? 'الاسم المستعار، البريد الإلكتروني، الصورة الرمزية، صورة الغلاف، النبذة الشخصية (Bio)، والروابط الخارجية التي يختار الكاتب عرضها للعامة، ومعرف المستخدم المشفر عبر خدمة Clerk Authentication.'
                    : 'Display name, username, email address, profile avatar, banner image, author biography, optional external links, and encrypted user identifiers managed via Clerk Authentication.'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-600" />
                  {isAr ? 'ب. المحتوى الأدبي والتفاعلي' : 'B. Literary & Community Content'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isAr
                    ? 'نصوص الروايات، عناوين وملخصات الفصول، بطاقات الشخصيات، التعليقات والردود العامة، قائمة الروايات المحفوظة في المكتبة، وتفضيلات الخط وحجم النص في القارئ.'
                    : 'Novel drafts and published chapters, summaries, character bibles, public comments, reading library items, and typography preferences.'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Server size={14} className="text-purple-600" />
                  {isAr ? 'ج. بيانات التصفح التقنية وسجلات الخادم' : 'C. Technical & Log Data'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isAr
                    ? 'عنوان IP، نوع المتصفح وإصداره، إعدادات اللغة، نظام التشغيل، طوابع الوقت وتاريخ الزيارة، صفحات الإحالة والخروج، ومؤشرات الأداء لتأمين الخوادم ضد هجمات DDoS والقرصنة.'
                    : 'IP address, browser type and version, language settings, OS, referring/exit URLs, timestamps, and diagnostic telemetry for server defense against DDoS and security threats.'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Bell size={14} className="text-amber-600" />
                  {isAr ? 'د. بيانات الإشعارات والنشاط' : 'D. Notification & Milestone Logs'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isAr
                    ? 'طوابع الترحيب الأسبوعي، إشعارات المتابعات الجديدة، وإحصائيات وصول الروايات إلى معالم القراءة (مثل وصول الرواية إلى 1000 مشاهدة)، وتفضيلات قراءة الإشعارات المخزنة محلياً وسحابياً.'
                    : 'Weekly milestone timestamps, author follower alerts, view threshold achievements (such as 1,000 views), and read/unread status stored locally and in cloud state.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: AI Usage and Google Gemini Processing */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">4</span>
            {isAr ? 'معالجة بيانات الذكاء الاصطناعي (Google Gemini AI)' : '4. AI Data Processing (Google Gemini AI)'}
          </h2>
          <div className="text-sm space-y-2 text-gray-600 leading-relaxed">
            <p>
              {isAr
                ? 'توفر منصة روايتي ميزات مساعدة إبداعية عبر الذكاء الاصطناعي (مثل اقتراح الحبكات وبناء الشخصيات ومحرر الفصول). عند استخدامك لهذه الميزات:'
                : 'Roayti offers AI-assisted storytelling capabilities (plot generation, character ideation, and drafting). When using these tools:'}
            </p>
            <ul className="list-disc list-inside space-y-1.5 pr-2">
              <li>{isAr ? 'تتم معالجة التوجيهات الأدبية (Prompts) عبر واجهة Google Gemini API الموثقة، ولا يتم بيع أو مشاركة مسوداتك مع أطراف تجارية أخرى.' : 'Creative prompts are processed securely via the official Google Gemini API and are never sold or rented to third-party data brokers.'}</li>
              <li>{isAr ? 'تخضع جميع المخرجات لنظام تنقية أدبي وأخلاقي إسلامي صارم (Islamic Sanitizer) لضمان خلو النصوص من الشركيات أو التعبيرات المخالفة للآداب العامة.' : 'All AI outputs are screened through our ethical and Islamic content sanitizer to ensure absence of forbidden theology or offensive tropes.'}</li>
              <li>{isAr ? 'يحق للكاتب استخدام مفتاحه الخاص للذكاء الاصطناعي (Custom Gemini API Key)، ويتم حفظه محلياً في متصفحه فقط عبر LocalStorage المشفر.' : 'Authors may optionally provide their own custom Gemini API Key, stored strictly on their local device storage without server persistence.'}</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Legal Bases for Processing */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">5</span>
            {isAr ? 'الأسس القانونية لمعالجة البيانات (GDPR Bases)' : '5. Legal Bases for Processing under GDPR'}
          </h2>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 border border-gray-200 rounded-xl">
              <strong className="block text-gray-900 mb-1">تنفيذ العقد (Contractual Necessity)</strong>
              <span className="text-gray-600">{isAr ? 'لتمكينك من إنشاء حساب، وتأليف الفصول، وحفظ مكتبتك، ونشر الروايات.' : 'To provide account management, chapter publishing, and novel storage.'}</span>
            </div>
            <div className="p-3.5 border border-gray-200 rounded-xl">
              <strong className="block text-gray-900 mb-1">المصلحة المشروعة (Legitimate Interests)</strong>
              <span className="text-gray-600">{isAr ? 'لحماية المنصة من الهجمات والسبام، وتقديم إحصائيات دقيقة، وتحسين جودة القراءة.' : 'For security, fraud prevention, service analytics, and editorial enhancement.'}</span>
            </div>
            <div className="p-3.5 border border-gray-200 rounded-xl">
              <strong className="block text-gray-900 mb-1">الموافقة الصريحة (Explicit Consent)</strong>
              <span className="text-gray-600">{isAr ? 'عند اختيارك تخصيص الإعلانات أو حفظ ملفات تعريف الارتباط التسويقية.' : 'When choosing personalized advertising cookies or optional features.'}</span>
            </div>
          </div>
        </section>

        {/* Section 6: User Rights & Global Compliance (GDPR, CCPA, CPRA) */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">6</span>
            {isAr ? 'حقوق المستخدمين العالمية (GDPR, CCPA & CPRA)' : '6. Your International Privacy Rights'}
          </h2>
          <p className="text-sm">
            {isAr
              ? 'بموجب القوانين العالمية لحماية البيانات، يحق لك ممارسة الحقوق التالية بكل سهولة عبر لوحة تحكم حسابك أو مراسلتنا:'
              : 'Under global privacy statutes, you hold enforceable rights exercisable via your dashboard or direct contact:'}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <strong className="block text-gray-900 mb-1">✓ {isAr ? 'حق الوصول والنقل (Access & Portability):' : 'Right to Access & Portability:'}</strong>
              <span className="text-gray-600">{isAr ? 'يحق لك الحصول على نسخة منظمة ومقروءة آلياً لكافة نصوص رواياتك وفصولك وبياناتك الشخصية.' : 'Export your novel texts, drafts, chapters, and account history at any time.'}</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <strong className="block text-gray-900 mb-1">✓ {isAr ? 'حق النسيان والحذف الشامل (Erasure):' : 'Right to Erasure ("Right to be Forgotten"): '}</strong>
              <span className="text-gray-600">{isAr ? 'يحق لك حذف حسابك ورواياتك بالكامل من قواعد بياناتنا نهائياً دون استرجاع.' : 'Permanently purge your account, drafts, comments, and profile from our databases.'}</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <strong className="block text-gray-900 mb-1">✓ {isAr ? 'عدم بيع المعلومات الشخصية (Do Not Sell):' : 'Do Not Sell or Share My Information:'}</strong>
              <span className="text-gray-600">{isAr ? 'نلتزم بعدم بيع أو تأجير أي بيانات شخصية أو معلومات كاتب لأي طرف ثالث للأغراض التجارية.' : 'We do not sell, rent, or trade personal data to third-party data brokers.'}</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <strong className="block text-gray-900 mb-1">✓ {isAr ? 'حق التصحيح والتقييد (Rectification):' : 'Right to Rectification & Restriction:'}</strong>
              <span className="text-gray-600">{isAr ? 'تعديل أو تصحيح اسم المستخدم أو الصورة أو البريد في أي وقت عبر الإعدادات.' : 'Instantly correct or update your profile details and preferences in settings.'}</span>
            </div>
          </div>
        </section>

        {/* Section 7: Data Retention & Security */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Lock size={18} className="text-emerald-600" />
            {isAr ? '7. مدة الاحتفاظ بالبيانات والتدابير الأمنية' : '7. Data Retention Periods & Security Safeguards'}
          </h2>
          <div className="text-sm space-y-2 text-gray-600">
            <p>
              {isAr
                ? 'نحتفظ ببياناتك طالما كان حسابك نشطاً. عند قيامك بحذف رواية أو فصل، يتم إزالته فورياً من النشر العام. نطبق تدابير أمنية تقنية وتنظيمية متقدمة تشمل التشفير ببروتوكول SSL/TLS 1.3 أثناء النقل، والتشفير في حالة السكون (Encryption at Rest)، واستخدام شهادات حماية معتمدة وجدران حماية ضد التسلل.'
                : 'Data is retained for as long as your account remains active. Published chapters deleted by you are purged immediately. We employ TLS 1.3 in-transit encryption, cloud database encryption at rest, secure API authentication keys, and web application firewalls.'}
            </p>
          </div>
        </section>

        {/* Section 8: Children's Privacy (COPPA) */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            {isAr ? '8. حماية خصوصية الأطفال (قانون COPPA)' : '8. Children\'s Online Privacy Protection (COPPA)'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'منصة روايتي غير موجهة للأطفال دون سن 13 عاماً، ولا نجمع عن قصد أي معلومات تعريفية شخصية من الأطفال. إذا علم أحد الوالدين أو الأوصياء بأن طفله قدم معلومات شخصية دون موافقتهم، يُرجى مراسلتنا فوراً على roayti0@gmail.com وسنقوم باتخاذ الإجراءات الفورية لحذف تلك البيانات نهائياً.'
              : 'Roayti is not directed to children under 13, and we do not knowingly collect personal data from minors. If you believe a child has submitted personal details without parental consent, contact us immediately at roayti0@gmail.com for prompt deletion.'}
          </p>
        </section>

        {/* Section 9: Third-party Services & Sub-processors */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Database size={18} className="text-blue-600" />
            {isAr ? '9. معالجو البيانات من الأطراف الخارجية (Sub-processors)' : '9. Third-Party Sub-processors'}
          </h2>
          <p className="text-sm text-gray-600">
            {isAr
              ? 'نستعين بشركاء استضافة ومعالجة عالميين مشهود لهم بالأمان والامتثال للأنظمة:'
              : 'We partner with enterprise sub-processors recognized for stringent security compliance:'}
          </p>
          <ul className="list-disc list-inside text-xs text-gray-600 space-y-1.5 pr-2">
            <li><strong>Google LLC (Google AdSense & Google Gemini):</strong> {isAr ? 'لعرض الإعلانات المعتمدة وتوفير خدمات الذكاء الاصطناعي.' : 'For ad monetization and optional AI creative generation.'}</li>
            <li><strong>Clerk Inc:</strong> {isAr ? 'لإدارة تسجيل الدخول الآمن والمصادقة وتشفير الجلسات.' : 'For secure multi-factor authentication and session security.'}</li>
            <li><strong>Render Services Inc:</strong> {isAr ? 'لاستضافة الخوادم وتشغيل بنية السحابة الرقمية.' : 'For secure cloud computing and server infrastructure.'}</li>
            <li><strong>PostgreSQL / PGlite:</strong> {isAr ? 'لتخزين السجلات وقواعد البيانات المهيأة للأمان.' : 'For hardened database storage and manuscript management.'}</li>
          </ul>
        </section>

        {/* Section 10: Policy Updates & Direct Contact */}
        <section className="space-y-3 p-5 rounded-xl bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw size={18} className="text-emerald-600" />
            {isAr ? '10. التعديلات والتواصل القانوني' : '10. Policy Amendments & Contact Info'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'قد نقوم بتحديث سياسة الخصوصية هذه من حين لآخر لمواكبة التطورات التقنية أو التنظيمية. يُعتبر استمرارك في استخدام الموقع بمثابة إقرار وموافقة على الشروط المحدثة. للاستفسارات القانونية وممارسة حقوق الخصوصية، تواصل مع مسؤول حماية البيانات لدينا:'
              : 'We may update this policy periodically to reflect operational, legal, or regulatory modifications. For inquiries or data subject requests, please contact our Data Protection representative directly:'}
          </p>
          <div className="text-sm font-medium text-gray-900 flex flex-wrap gap-4 pt-2">
            <a href="mailto:roayti0@gmail.com" className="flex items-center gap-1.5 font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-black transition-colors">
              ✉️ roayti0@gmail.com
            </a>
            <span className="flex items-center gap-1.5 font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              🌐 https://roayti.com
            </span>
          </div>
        </section>

      </div>
    </div>
  );
};
