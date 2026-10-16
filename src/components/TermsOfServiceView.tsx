import React from 'react';
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TermsOfServiceViewProps {
  onBack: () => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

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

        <span className="text-xs uppercase tracking-widest font-mono text-black/40">
          Terms of Service — شروط الاستخدام
        </span>
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mb-4 shadow-sm border border-purple-100">
          <Scale size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight mb-3">
          {isAr ? 'شروط وأحكام الاستخدام' : 'Terms & Conditions of Service'}
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'آخر تحديث: أكتوبر 2026 — تنظم هذه الاتفاقية شروط استخدامك لمنصة «روايتي» (Roayti.com) وخدمات النشر والقراءة السحابية وأدوات الذكاء الاصطناعي.'
            : 'Last Updated: October 2026 — This agreement governs your access and use of Roayti.com, its publishing platform, reading tools, and AI writing assistance.'}
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 leading-relaxed text-gray-700">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">1</span>
            {isAr ? 'قبول الشروط' : '1. Acceptance of Terms'}
          </h2>
          <p className="text-sm leading-relaxed">
            {isAr
              ? 'بمجرد دخولك إلى موقع «روايتي» أو تسجيل حساب أو قراءة أو كتابة أي محتوى، فإنك تقر بأنك قرأت وفهمت ووافقت على الالتزام بجميع بنود هذه الاتفاقية وسياسة الخصوصية الخاصة بنا. إذا كنت لا توافق على أي جزء من هذه الشروط، فيجب عليك التوقف فوراً عن استخدام المنصة.'
              : 'By accessing Roayti.com, registering an account, or reading and publishing content, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these terms, you must discontinue using our services.'}
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">2</span>
            {isAr ? 'حقوق الملكية الفكرية للمؤلفين' : '2. Intellectual Property & Author Ownership'}
          </h2>
          <div className="text-sm space-y-2">
            <p>
              {isAr
                ? 'نحن نؤمن إيماناً راسخاً بحق كل كاتب في ملكية إبداعه الفكري:'
                : 'We firmly uphold and protect author copyright:'}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 pr-2">
              <li>
                <strong>{isAr ? 'ملكية الكاتب الكاملة:' : '100% Author Ownership:'}</strong>{' '}
                {isAr
                  ? 'يحتفظ الكاتب بكامل حقوق الطبع والنشر والملكية الفكرية لأي رواية أو فصل أو محتوى أصلي ينشئه على المنصة.'
                  : 'You retain full copyright and intellectual property rights over any original novel, chapter, or text you create on Roayti.'}
              </li>
              <li>
                <strong>{isAr ? 'رخصة العرض والنشر:' : 'Display License:'}</strong>{' '}
                {isAr
                  ? 'بنشرك لعملك علناً على الموقع، تمنح منصة «روايتي» رخصة غير حصرية ومجانية لعرض وتوزيع وتهيئة العمل لقراء المنصة عبر الويب وتطبيقات PWA، مع احتفاظك بحق تعديل أو سحب العمل في أي وقت.'
                  : 'By publishing publicly, you grant Roayti a non-exclusive, royalty-free license to host, display, and format your work for platform readers, while you retain the unilateral right to unpublish or delete your works at any time.'}
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">3</span>
            {isAr ? 'استخدام أدوات الذكاء الاصطناعي (AI Writing Tools)' : '3. AI Writing Tools & Generated Content'}
          </h2>
          <p className="text-sm">
            {isAr
              ? 'توفر المنصة أدوات مساعدة إبداعية مدعومة بالذكاء الاصطناعي (Google Gemini). عند استخدامك لهذه الميزات:'
              : 'Our platform provides creative writing assistance powered by AI (Google Gemini). When utilizing these tools:'}
          </p>
          <ul className="list-disc list-inside text-sm space-y-1.5 text-gray-600 pr-2">
            <li>{isAr ? 'المحتوى المقترح من الذكاء الاصطناعي هو أداة إلهام ومساعدة، ويتحمل الكاتب مسؤولية مراجعته واعتماده قبل النشر.' : 'AI suggestions are meant as creative inspiration; the author bears final responsibility for reviewing and verifying content before publication.'}</li>
            <li>{isAr ? 'تخضع جميع التوليدات لنظام التنقية الأدبية التلقائي لمنع إنتاج أي مصطلحات شركية أو ألفاظ مخالفة للآداب العامة.' : 'All generations pass through automated ethical sanitizers to eliminate polytheistic tropes or inappropriate language.'}</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">4</span>
            {isAr ? 'المحتوى المحظور وقواعد السلوك' : '4. Prohibited Content & User Conduct'}
          </h2>
          <p className="text-sm">
            {isAr ? 'يُحظر تماماً نشر أو ترويج أو تحميل أي مما يلي:' : 'You strictly agree not to upload, publish, or promote any of the following:'}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-900">
              <strong>🚫 {isAr ? 'المحتوى الشركي أو المسيء للأديان' : 'Blasphemous / Offensive Content'}</strong>
              <p className="mt-1 text-red-700">{isAr ? 'أي طعن في العقائد أو ترويج للشرك أو ادعاءات ألوهية للكائنات.' : 'Any desecration of religious sanctities or prohibited theological offenses.'}</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-900">
              <strong>🚫 {isAr ? 'المحتوى الإباحي والمبتذل' : 'Explicit / Inappropriate Content'}</strong>
              <p className="mt-1 text-red-700">{isAr ? 'أي محتوى خادش للحياء أو مخصص للبالغين بشكل يتعارض مع قيم المجتمع.' : 'Any adult, pornographic, or sexually explicit literature.'}</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-900">
              <strong>🚫 {isAr ? 'السرقة الأدبية والانتحال' : 'Plagiarism & Copyright Infringement'}</strong>
              <p className="mt-1 text-red-700">{isAr ? 'نسخ روايات الآخرين دون إذن خطي صريح أو انتحال شخصية كتاب آخرين.' : 'Copying or republishing works of other authors without explicit permission.'}</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-900">
              <strong>🚫 {isAr ? 'البرمجيات الخبيثة والتلاعب' : 'Malicious Bots & Scraping'}</strong>
              <p className="mt-1 text-red-700">{isAr ? 'استخدام روبوتات الكشط غير المصرح بها أو محاولة تعطيل خوادم المنصة.' : 'Unauthorized automated scraping, spamming, or server disruption.'}</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">5</span>
            {isAr ? 'إخلاء المسؤولية وحدود الالتزام القانوني' : '5. Disclaimer & Limitation of Liability'}
          </h2>
          <p className="text-sm leading-relaxed">
            {isAr
              ? 'تُقدم خدمات منصة «روايتي» ومحتوياتها على أساس "كما هي" و"كما تتوفر". مع بذلنا أقصى الجهود لضمان استمرارية الخدمة وأمنها، لا نتحمل المسؤولية عن أي خسائر غير مباشرة ناتجة عن انقطاع مؤقت في الخدمة أو فقدان مسودات لم يتم حفظها. الآراء والأفكار الواردة في الروايات تعبر عن وجهة نظر أصحابها فقط ولا تمثل بالضرورة إدارة المنصة.'
              : 'Roayti services are provided on an "as is" and "as available" basis. While we strive for continuous uptime and security, Roayti shall not be liable for indirect damages or temporary service interruptions. Literary opinions expressed in user novels reflect solely their respective authors.'}
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 p-5 rounded-xl bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {isAr ? 'تعديل الشروط والنزاعات' : '6. Amendments & Dispute Resolution'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'تحتفظ إدارة المنصة بالحق في تعديل هذه الشروط في أي وقت. يُعتبر استمرار استخدامك للموقع بعد نشر أي تعديلات قبولاً صريحاً منك للشروط الجديدة. في حال وجود أي نزاع، نسعى لحله ودياً عبر قنوات الدعم الرسمية: ahmad.meshaalp@gmail.com.'
              : 'We reserve the right to modify these Terms at any time. Continued use of Roayti following published updates constitutes acceptance of the revised Terms. Any disputes shall be resolved cooperatively via support: ahmad.meshaalp@gmail.com.'}
          </p>
        </section>

      </div>
    </div>
  );
};
