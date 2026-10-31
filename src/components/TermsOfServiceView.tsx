import React, { useState } from 'react';
import { 
  ArrowLeft, Scale, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, 
  BookOpen, Users, Feather, DollarSign, Ban, RefreshCw, Mail, HelpCircle 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TermsOfServiceViewProps {
  onBack: () => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onBack }) => {
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mb-4 shadow-sm border border-purple-100">
          <Scale size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight mb-3">
          {isAr ? 'اتفاقية شروط وأحكام الاستخدام الشاملة' : 'Comprehensive Terms & Conditions of Service'}
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'آخر تحديث: 2026 — تنظم هذه الاتفاقية القانونية الملزمة كامل حقوق والتزامات مستخدمي منصة «روايتي» (Roayti.com)، بما يشمل حقوق النشر الفكرية، شروط النشر، القراءة المجانية، وضوابط الذكاء الاصطناعي والإعلانات.'
            : 'Last Updated: 2026 — This legally binding Agreement governs all rights and duties of users on Roayti.com, addressing author copyright, content licensing, free reader rights, advertising compliance, and ethical AI safeguards.'}
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 leading-relaxed text-gray-700">
        
        {/* Section 1: Acceptance & Eligibility */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">1</span>
            {isAr ? 'قبول الاتفاقية والأهلية القانونية للاستخدام' : '1. Acceptance of Terms & Eligibility'}
          </h2>
          <p className="text-sm leading-relaxed">
            {isAr
              ? 'يُعد وصولك إلى منصة «روايتي» (roayti.com) أو استخدامك لأي من خدماتها (سواء كقارئ زائر، أو كاتب مسجل، أو معلق) إقراراً صريحاً وكاملاً ومطلقاً بموافقتك على الالتزام بكافة بنود هذه الاتفاقية وسياسة الخصوصية المرتبطة بها. إذا كنت لا توافق على أي بند من هذه الشروط، فيتعين عليك التوقف فوراً عن استخدام المنصة. تقر بأن عمرك لا يقل عن 13 عاماً، أو أنك تستخدم المنصة بإشراف وموافقة أحد الوالدين أو الوصي القانوني.'
              : 'By browsing Roayti.com or interacting with its features (as a reader, registered novelist, or commenter), you unconditionally agree to these Terms of Service and our Privacy Policy. If you do not consent to any part of this agreement, you must immediately cease accessing our services. You represent that you are at least 13 years of age, or possess legal parental/guardian consent.'}
          </p>
        </section>

        {/* Section 2: Author IP & Full Ownership */}
        <section className="space-y-4 p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={22} className="text-emerald-600" />
            {isAr ? '2. ملكية المؤلف الكاملة وحقوق الملكية الفكرية (100% Author IP)' : '2. 100% Author Intellectual Property Ownership'}
          </h2>
          <div className="text-sm space-y-3 text-gray-700">
            <p>
              {isAr
                ? 'تؤمن منصة روايتي بأن المبدع هو المالك المطلق لقلمه وخياله، وتكفل السياسة المبادئ الصريحة التالية:'
                : 'Roayti firmly establishes that creators retain absolute sovereignty over their original literature:'}
            </p>
            <ul className="list-disc list-inside space-y-2 pr-2">
              <li>
                <strong>{isAr ? 'الملكية الحصرية للمؤلف بنسبة 100%:' : '100% Exclusive Author Ownership:'}</strong>{' '}
                {isAr
                  ? 'يحتفظ المؤلف بكامل حقوق الطبع والنشر والملكية الفكرية والتجارية لكافة نصوص الروايات، والفصول، والحبكات، وتصميمات الشخصيات التي يقوم بإنشائها على المنصة.'
                  : 'You retain 100% full, uncompromised intellectual property, copyright, and commercial rights over your original novels, chapters, plotlines, and character sheets.'}
              </li>
              <li>
                <strong>{isAr ? 'ترخيص العرض غير الحصري:' : 'Non-Exclusive Hosting License:'}</strong>{' '}
                {isAr
                  ? 'بنشرك للرواية علناً على الموقع، تمنح منصة روايتي ترخيصاً مجانياً عالمياً غير حصري فقط لعرض العمل وتنسيقه وتقديمه لقراء المنصة عبر الويب وتطبيقات الويب التقدمية (PWA).'
                  : 'By publishing publicly on Roayti, you grant us a non-exclusive, worldwide, royalty-free license solely to host, render, and display your work to readers across web and PWA applications.'}
              </li>
              <li>
                <strong>{isAr ? 'حرية التصرف والنشر الورقي:' : 'Freedom of Publication & Print:'}</strong>{' '}
                {isAr
                  ? 'يحق للكاتب في أي وقت سحب أعماله، أو تحويلها إلى مسودات خاصة، أو حذفها نهائياً، أو طباعتها ونشرها ورقياً لدى أي دار نشر دون الحاجة لأي إذن أو عمولة لمنصة روايتي.'
                  : 'Authors maintain unilateral discretion to unpublish, edit, delete, or commercialize their works in print or multimedia formats with any publisher without platform fees or royalties.'}
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: User Conduct & Prohibited Content */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">3</span>
            {isAr ? 'ضوابط المحتوى وقواعد السلوك والمحظورات الصارمة' : '3. Content Standards & Prohibited Conduct'}
          </h2>
          <p className="text-sm">
            {isAr
              ? 'حرصاً على بيئة أدبية آمنة، يُمنع منعاً باتاً نشر أو رفع أو ترويج أي من المواد التالية:'
              : 'To preserve an enriching and safe literary sanctuary, users are strictly prohibited from publishing:'}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-900">
              <strong className="block mb-1 flex items-center gap-1 font-bold">
                <Ban size={14} className="text-red-600" />
                {isAr ? 'المحتوى المخالف للعقيدة والآداب' : 'Theological & Moral Violations'}
              </strong>
              <span>{isAr ? 'يُحظر أي كلام شركي أو طعن في المقدسات أو ترويج للأفكار الهدامة أو المواد الإباحية والخادشة للحياء.' : 'No blasphemy, polytheistic promotion, theological contempt, or pornographic/explicit material.'}</span>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-900">
              <strong className="block mb-1 flex items-center gap-1 font-bold">
                <Ban size={14} className="text-red-600" />
                {isAr ? 'السرقة الأدبية والانتحال' : 'Plagiarism & Unauthorized Scraping'}
              </strong>
              <span>{isAr ? 'يُحظر نسخ أعمال وروائع الكتاب الآخرين دون تصريح رسمي، أو انتحال هويات أو علامات تجارية مسجلة.' : 'No plagiarizing copyrighted literary works or impersonating authors and entities.'}</span>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-900">
              <strong className="block mb-1 flex items-center gap-1 font-bold">
                <Ban size={14} className="text-red-600" />
                {isAr ? 'خطاب الكراهية والتحريض' : 'Hate Speech & Harassment'}
              </strong>
              <span>{isAr ? 'يُمنع التحريض على العنف أو الإرهاب أو التمييز العنصري أو التشهير والمضايقة في التعليقات والروايات.' : 'No harassment, defamation, intimidation, or incitement of violence against any group or individual.'}</span>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-900">
              <strong className="block mb-1 flex items-center gap-1 font-bold">
                <Ban size={14} className="text-red-600" />
                {isAr ? 'التلاعب التقني والقرصنة' : 'Technical Abuse & Automation'}
              </strong>
              <span>{isAr ? 'يُحظر استخدام البوتات للكشط غير المصرح به، أو التلاعب بعدادات المشاهدات، أو محاولة اختراق خوادم المنصة.' : 'No automated scraping bots, synthetic view inflation, malicious payloads, or server exploitation.'}</span>
            </div>
          </div>
        </section>

        {/* Section 4: AI Creative Tools & Sanitizer */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">4</span>
            {isAr ? 'شروط استخدام الذكاء الاصطناعي والتنقية الأخلاقية' : '4. AI Creative Tools & Content Sanitization'}
          </h2>
          <div className="text-sm space-y-2 text-gray-600 leading-relaxed">
            <p>
              {isAr
                ? 'توفر المنصة أدوات كتابة متقدمة تعمل بالذكاء الاصطناعي (Google Gemini) لدعم المؤلفين. يُقر المستخدم بالبنود التالية:'
                : 'Roayti integrates state-of-the-art AI creative writing assistants (Google Gemini). Users acknowledge:'}
            </p>
            <ul className="list-disc list-inside space-y-1.5 pr-2">
              <li>{isAr ? 'مخرجات الذكاء الاصطناعي هي أدوات مساعدة واقتراحات إلهامية؛ ويبقى الكاتب هو المسؤول الأول والأخير عن صياغة ومراجعة روايته قبل النشر.' : 'AI outputs serve as creative brainstorming suggestions; authors bear sole editorial responsibility for finalizing text prior to public distribution.'}</li>
              <li>{isAr ? 'نظام التنقية الأدبية الإسلامية المدمج يقوم تلقائياً بتهذيب الألفاظ الشركية والخيالية (مثل تحويل "إله كذا" إلى "سيد كذا") لضمان توافق المحتوى مع قيم مجتمعنا.' : 'Our algorithmic Islamic sanitizer dynamically refines polytheistic fantasy tropes to uphold community values while preserving narrative drama.'}</li>
              <li>{isAr ? 'لا نضمن خلو مخرجات الذكاء الاصطناعي من الأخطاء التعبيرية، ويجب على المؤلفين تدقيق أعمالهم لغوياً.' : 'We provide AI tools on an "as-is" assistive basis, without warranties against typographical or factual hallucinations.'}</li>
            </ul>
          </div>
        </section>

        {/* Section 5: DMCA & Copyright Infringement Policy */}
        <section className="space-y-3 p-5 rounded-xl bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileCheck size={20} className="text-blue-600" />
            {isAr ? '5. إجراءات الإبلاغ عن انتهاك حقوق النشر (سياسة DMCA)' : '5. DMCA Notice & Copyright Infringement Policy'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'تحترم منصة روايتي حقوق الملكية الفكرية وتلتزم بقانون الألفية للملكية الفكرية (DMCA). إذا كنت تعتقد بحسن نية أن عملاً منشوراً على المنصة ينتهك حقوق الطبع والنشر الخاصة بك، يُرجى إرسال إشعار رسمي عبر صفحة "اتصل بنا" أو مراسلتنا على roayti0@gmail.com متضمناً: (1) رابط العمل المشتكى منه، (2) وصفاً للعمل الأصلي، (3) إثبات الملكية أو التوكيل الرسمي، (4) بيانات الاتصال بك. سنقوم بفحص الإشعار والتعامل معه فوراً بحذف أو تعطيل الوصول إلى المحتوى المخالف خلال 24 ساعة.'
              : 'Roayti adheres strictly to the Digital Millennium Copyright Act (DMCA). If you believe in good faith that any content hosted on our site infringes your copyrighted work, please submit a formal takedown notice via our Contact form or to roayti0@gmail.com containing: (1) URL of the infringing work, (2) Identification of your original work, (3) Proof of copyright ownership, and (4) Contact details. Valid notices will be acted upon within 24 hours.'}
          </p>
        </section>

        {/* Section 6: Advertising & Reader Rights */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">6</span>
            {isAr ? 'حقوق القراء والإعلانات وسياسة الاستخدام المجاني' : '6. Reader Rights & Advertising Disclosures'}
          </h2>
          <div className="text-sm space-y-2 text-gray-600 leading-relaxed">
            <p>
              {isAr
                ? 'تتيح منصة روايتي قراءة الروايات المنشورة مجاناً دون فرض اشتراكات إجبارية. يُقر القارئ بما يلي:'
                : 'Roayti grants readers free, open access to published literature without paywalls. Readers acknowledge:'}
            </p>
            <ul className="list-disc list-inside space-y-1.5 pr-2">
              <li>{isAr ? 'يتم عرض إعلانات رقمية نظيفة ومعتمدة من قِبل Google AdSense وشبكات معتمدة لدعم تكاليف الخوادم وتطوير الأدوات.' : 'Unobtrusive, certified ads from Google AdSense are displayed to support server maintenance and platform engineering.'}</li>
              <li>{isAr ? 'يُمنع استخدام أي أدوات كشط أو محاولات لتجاوز الإعلانات بطرق برمجية ضارة أو تحميل الفصول لإعادة بيعها تجارياً.' : 'Users may not employ automated bots to scrape novels or redistribute author works commercially.'}</li>
              <li>{isAr ? 'يحق للقارئ حفظ الروايات في مكتبته الشخصية وتلقي إشعارات المنصة بالمتابعات والتحديثات الأسبوعية.' : 'Readers enjoy private bookmarking, personal libraries, and milestone notifications.'}</li>
            </ul>
          </div>
        </section>

        {/* Section 7: Account Termination & Suspension */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">7</span>
            {isAr ? 'تعليق وإنهاء الحسابات وإلغاء التسجيل' : '7. Account Suspension & Termination'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'تحتفظ إدارة منصة روايتي بالحق الكامل في تعليق أو حظر أي حساب، أو حذف أي رواية فورياً ودون إشعار مسبق، في حال ثبوت مخالفة جسيمة لهذه الشروط أو انتهاك حقوق كاتب آخر أو ممارسة أنشطة تضر بأمن واستقرار الموقع. كما يحق للمستخدم في أي وقت طلب حذف حسابه نهائياً من سجلاتنا.'
              : 'Roayti reserves the right to suspend, terminate, or restrict account privileges and remove content immediately without liability upon discovering material violations of these terms, copyright piracy, or actions jeopardizing site integrity. Users may likewise delete their accounts at any time.'}
          </p>
        </section>

        {/* Section 8: Disclaimers & Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            {isAr ? '8. إخلاء المسؤولية وحدود الالتزام القانوني' : '8. Disclaimers & Limitation of Liability'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'تُقدم خدمات منصة «روايتي» ومحتوياتها على أساس "كما هي" و"كما تتوفر". مع بذل أقصى جهودنا التقنية لضمان استمرارية الخوادم وسرعتها، لا نتحمل المسؤولية عن أي انقطاع مؤقت ناجم عن صيانة السيرفرات أو مشكلات الإنترنت العالمية. الآراء والأفكار الواردة في الروايات والتعليقات تعكس وجهة نظر كاتبيها حصراً ولا تمثل بالضرورة رأي إدارة المنصة.'
              : 'Services are rendered on an "as is" and "as available" basis. While we strive for 99.9% uptime, Roayti disclaims liability for transient downtime resulting from internet disruptions or host maintenance. Literary perspectives expressed in user novels represent solely the respective authors.'}
          </p>
        </section>

        {/* Section 9: Governing Law & Jurisdiction */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 text-xs text-black font-mono">9</span>
            {isAr ? 'القانون الواجب التطبيق والاختصاص القضائي' : '9. Governing Law & Dispute Resolution'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'تخضع هذه الاتفاقية وتُفسر وفقاً للأنظمة واللوائح المعمول بها ذات الصلة بالتعاملات الإلكترونية وحماية الملكية الفكرية. يُسعى لحل أي خلاف بشكل ودي وأخوي أولاً عبر قنوات الدعم الرسمية، وفي حال تعذر ذلك تختص المحاكم المختصة بالنظر في النزاعات.'
              : 'These Terms shall be governed by and interpreted in accordance with applicable electronic commerce, cybercrimes, and copyright laws. Parties agree to pursue good-faith amicable negotiation through our official support before initiating formal legal proceedings.'}
          </p>
        </section>

        {/* Section 10: Amendments & Official Inquiries */}
        <section className="space-y-3 p-5 rounded-xl bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw size={18} className="text-emerald-600" />
            {isAr ? '10. التعديلات والتواصل الرسمي' : '10. Amendments & Inquiries'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'نحتفظ بحق تحديث وتعديل بنود هذه الاتفاقية في أي وقت. يُعتبر استمرارك في استخدام المنصة بعد نشر أي تحديث قبولاً صريحاً منك للشروط الجديدة. للاستفسارات القانونية والتعاقدية، تواصل مع فريقنا عبر البريد الرسمي المعتمد:'
              : 'We reserve the right to revise these Terms periodically. Continued utilization of Roayti constitutes agreement to updated terms. For formal inquiries and legal communication, contact:'}
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
