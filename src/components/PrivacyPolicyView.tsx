import React, { useState } from 'react';
import { ArrowLeft, Shield, Lock, Eye, Cookie, FileText, CheckCircle2, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
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
          {isAr ? 'سياسة الخصوصية وملفات تعريف الارتباط' : 'Privacy & Cookie Policy'}
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'آخر تحديث: أكتوبر 2026 — نلتزم في منصة «روايتي» (Roayti.com) بحماية خصوصيتك وضمان شفافية التعامل مع بياناتك وفقاً لأعلى المعايير العالمية ومعايير شركاء الإعلانات (Google AdSense).'
            : 'Last Updated: October 2026 — At Roayti.com, we are deeply committed to protecting your privacy and ensuring transparent data processing compliant with international standards and advertising partner policies (Google AdSense).'}
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 leading-relaxed text-gray-700">
        
        {/* Section 1: Introduction */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">1</span>
            {isAr ? 'المقدمة ونطاق التطبيق' : '1. Introduction & Scope'}
          </h2>
          <p className="text-sm leading-relaxed">
            {isAr
              ? 'أهلاً بك في منصة «روايتي» (Roayti.com). تصف سياسة الخصوصية هذه كيفية جمع بياناتك الشخصية واستخدامها ومشاركتها وحمايتها عند زيارتك لموقعنا الإلكتروني أو استخدام أدواتنا الإبداعية ومحررات الروايات. باستخدامك للموقع، فإنك توافق على الممارسات الموضحة في هذه الوثيقة.'
              : 'Welcome to Roayti.com. This Privacy Policy describes how your personal information is collected, used, shared, and protected when you visit our website or use our creative writing and novel reading platform. By accessing or using our services, you consent to the practices described in this policy.'}
          </p>
        </section>

        {/* Section 2: Google AdSense & Cookies (CRITICAL FOR ADSENSE APPROVAL) */}
        <section className="space-y-4 p-5 rounded-xl bg-amber-50/50 border border-amber-200/60">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Cookie size={20} className="text-amber-600" />
            {isAr ? 'ملفات تعريف الارتباط وإعلانات Google AdSense' : '2. Cookies & Google AdSense Advertising'}
          </h2>
          <div className="text-sm space-y-3 text-gray-700">
            <p>
              {isAr
                ? 'نحن نستخدم خدمات إعلانية تقدمها شركة Google LLC وأطراف خارجية لعرض الإعلانات عند زيارتك لموقعنا. يُرجى ملاحظة ما يلي بدقة:'
                : 'We utilize advertising services provided by Google LLC and third-party vendors to serve ads when you visit our site. Please note the following:'}
            </p>
            <ul className="list-disc list-inside space-y-2 pr-2">
              <li>
                <strong>{isAr ? 'استخدام ملفات تعريف الارتباط من Google:' : 'Google Cookie Usage:'}</strong>{' '}
                {isAr
                  ? 'تستخدم Google بصفتها مورِّداً خارجياً ملفات تعريف الارتباط (مثل ملف تعريف الارتباط DoubleClick DART) لعرض الإعلانات على موقعنا استناداً إلى زياراتك السابقة لهذا الموقع أو لمواقع أخرى على الويب.'
                  : 'Google, as a third-party vendor, uses cookies (including the DoubleClick DART cookie) to serve ads on our site based on prior visits to our website or other sites across the Internet.'}
              </li>
              <li>
                <strong>{isAr ? 'إلغاء الاشتراك في الإعلانات المخصصة:' : 'Opting Out of Personalized Advertising:'}</strong>{' '}
                {isAr
                  ? 'يمكن للمستخدمين إلغاء الاشتراك في استخدام ملف تعريف الارتباط DART للإعلانات المخصصة عبر زيارة إعدادات إعلانات Google على الرابط: '
                  : 'Users may opt out of personalized advertising by visiting Google Ads Settings at: '}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline hover:text-emerald-700">
                  adssettings.google.com
                </a>
                {isAr ? ' أو من خلال موقع ' : ' or via '}
                <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline hover:text-emerald-700">
                  aboutads.info
                </a>.
              </li>
              <li>
                <strong>{isAr ? 'شركاء الإعلانات وشبكات الطرف الثالث:' : 'Third-Party Ad Networks:'}</strong>{' '}
                {isAr
                  ? 'قد تستخدم شبكات إعلانية أو خوادم تابعة لأطراف ثالثة تقنيات مثل ملفات تعريف الارتباط (Cookies) أو جافا سكريبت أو إشارات الويب (Web Beacons) في إعلاناتها وروابطها التي تظهر على موقع روايتي، والتي تُرسل مباشرةً إلى متصفحك لقياس فعالية الحملات الإعلانية وتخصيص المحتوى الإعلاني.'
                  : 'Third-party ad servers or ad networks use technology like cookies, JavaScript, or Web Beacons in their respective advertisements and links that appear on Roayti, sent directly to your browser.'}
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Data We Collect */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">3</span>
            {isAr ? 'المعلومات التي نقوم بجمعها' : '3. Information We Collect'}
          </h2>
          <div className="text-sm space-y-2">
            <p>
              {isAr
                ? 'نقوم بجمع نوعين أساسيين من المعلومات لتقديم خدماتنا الإبداعية بكفاءة:'
                : 'We collect two primary categories of information to reliably provide our services:'}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1 text-xs uppercase tracking-wider">
                  {isAr ? 'أ. معلومات تقدمها بنفسك' : 'A. Information You Provide'}
                </h3>
                <p className="text-xs text-gray-600">
                  {isAr
                    ? 'بيانات التسجيل (الاسم المستعار، البريد الإلكتروني، الصورة الرمزية، النبذة الشخصية)، ومحتوى الروايات والفصول والتعليقات التي تقوم بإنشائها أو نشرها.'
                    : 'Account information (display name, email address, avatar, biography), and novel chapters, notes, or comments you create or publish.'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1 text-xs uppercase tracking-wider">
                  {isAr ? 'ب. معلومات تُجمع تلقائياً (ملفات السجل)' : 'B. Automatically Collected Information (Log Files)'}
                </h3>
                <p className="text-xs text-gray-600">
                  {isAr
                    ? 'مثل عنوان IP، نوع المتصفح، مزود خدمة الإنترنت (ISP)، طابع التاريخ والوقت، صفحات الإحالة/الخروج، وعدد النقرات لتحليل الاتجاهات وإدارة الموقع.'
                    : 'Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and click counts to analyze trends and administer the site.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: How We Use Information */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">4</span>
            {isAr ? 'كيفية استخدام المعلومات والذكاء الاصطناعي' : '4. How We Use Information & AI Tools'}
          </h2>
          <p className="text-sm">
            {isAr
              ? 'تُستخدم بياناتك لتقديم تجربة تصفح وقراءة سلسة، بما في ذلك:'
              : 'Your data is utilized to provide a seamless reading and writing experience, including:'}
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 pr-2">
            <li>{isAr ? 'تشغيل وتطوير وصيانة منصة روايتي وأدوات التحرير السحابية.' : 'Operating, improving, and maintaining Roayti and its cloud writing tools.'}</li>
            <li>{isAr ? 'حفظ تقدمك في القراءة ومكتبتك المفضلة وإحصائيات القراءة.' : 'Saving your reading progress, personalized library, and interaction stats.'}</li>
            <li>{isAr ? 'تمكين مساعد الكاتب الذكي (AI) من تطوير الحبكات بطلبك المباشر، دون مشاركة مسوداتك مع أطراف خارجية غير مصرح بها.' : 'Powering our AI writer to suggest creative outlines upon your explicit prompt without exposing private drafts.'}</li>
            <li>{isAr ? 'حماية أمن المنصة ومنع الاحتيال وضمان الامتثال لسياسات النشر والأخلاقيات.' : 'Ensuring site security, preventing fraudulent activity, and enforcing content guidelines.'}</li>
          </ul>
        </section>

        {/* Section 5: GDPR & CCPA Compliance */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">5</span>
            {isAr ? 'حقوق المستخدم والامتثال للأنظمة العالمية (GDPR & CCPA)' : '5. User Rights & Regulatory Compliance (GDPR & CCPA)'}
          </h2>
          <p className="text-sm">
            {isAr
              ? 'وفقاً للائحة العامة لحماية البيانات في الاتحاد الأوروبي (GDPR) وقانون خصوصية المستهلك في كاليفورنيا (CCPA)، يتمتع مستخدمونا بالحقوق التالية:'
              : 'Under the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), our users hold the following rights:'}
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 border border-gray-200 rounded-lg">
              <strong className="block text-gray-900 mb-1">{isAr ? 'حق الوصول والنقل' : 'Right to Access & Portability'}</strong>
              <span>{isAr ? 'يحق لك طلب نسخة كاملة من بياناتك المحفوظة لدينا في أي وقت.' : 'You can request a complete copy of your personal data stored with us.'}</span>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <strong className="block text-gray-900 mb-1">{isAr ? 'حق التصحيح أو الحذف' : 'Right to Rectification & Erasure'}</strong>
              <span>{isAr ? 'يمكنك تعديل بياناتك أو حذف حسابك ومحتوياتك نهائياً بضغطة زر.' : 'You can edit, correct, or permanently delete your account and novels at any time.'}</span>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <strong className="block text-gray-900 mb-1">{isAr ? 'عدم بيع البيانات الشخصية' : 'Do Not Sell My Info'}</strong>
              <span>{isAr ? 'نحن لا نبيع ولا نتاجر بأي بيانات شخصية للمستخدمين لأي طرف ثالث نهائياً.' : 'We do not and will never sell your personal data to any third party.'}</span>
            </div>
          </div>
        </section>

        {/* Section 6: Children's Privacy (COPPA) */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">6</span>
            {isAr ? 'خصوصية الأطفال (قانون COPPA)' : '6. Children’s Privacy (COPPA)'}
          </h2>
          <p className="text-sm">
            {isAr
              ? 'حماية خصوصية الأطفال عبر الإنترنت ذات أهمية قصوى لدينا. لا تقوم منصة «روايتي» عن عمد بجمع أي معلومات تعريفية شخصية من أطفال دون سن 13 عاماً. إذا اعتقدت أن طفلك قدم مثل هذه المعلومات على موقعنا، يرجى الاتصال بنا فوراً وسنبذل قصارى جهدنا لحذفها على الفور من سجلاتنا.'
              : 'Protecting children’s privacy online is paramount. Roayti.com does not knowingly collect personally identifiable information from children under the age of 13. If you believe your child has provided personal information on our website, please contact us immediately, and we will promptly remove it.'}
          </p>
        </section>

        {/* Section 7: Security & Encryption */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Lock size={18} className="text-emerald-600" />
            {isAr ? 'أمن البيانات والتشفير' : '7. Data Security & Encryption'}
          </h2>
          <p className="text-sm">
            {isAr
              ? 'نطبق بروتوكولات حماية مشددة تشمل التشفير بنظام SSL/TLS أثناء النقل وقواعد بيانات آمنة لحماية معلوماتك ومسودات رواياتك من أي وصول غير مصرح به.'
              : 'We implement industry-standard security protocols, including SSL/TLS in-transit encryption and resilient databases, to protect your personal information and literary manuscripts from unauthorized access.'}
          </p>
        </section>

        {/* Section 8: Contact Details */}
        <section className="space-y-3 p-5 rounded-xl bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {isAr ? 'التواصل بشأن الخصوصية' : '8. Privacy Inquiries & Contact'}
          </h2>
          <p className="text-sm text-gray-600">
            {isAr
              ? 'إذا كانت لديك أي أسئلة أو استفسارات قانونية بخصوص سياسة الخصوصية هذه، يُرجى التواصل معنا عبر البريد المخصص:'
              : 'If you have any questions or legal inquiries regarding this Privacy Policy, please contact our dedicated team:'}
          </p>
          <div className="text-sm font-medium text-gray-900 flex flex-wrap gap-4 pt-1">
            <span className="flex items-center gap-1.5 font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              ✉️ roayti0@gmail.com
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              🌐 https://roayti.com
            </span>
          </div>
        </section>

      </div>
    </div>
  );
};
