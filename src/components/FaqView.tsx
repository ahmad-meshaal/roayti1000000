import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, BookOpen, Feather, Sparkles, Shield, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FaqViewProps {
  onBack: () => void;
  onNavigateView?: (view: any) => void;
}

interface FaqItem {
  id: string;
  category: 'readers' | 'authors' | 'ai' | 'ads';
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export const FaqView: React.FC<FaqViewProps> = ({ onBack, onNavigateView }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<'all' | 'readers' | 'authors' | 'ai' | 'ads'>('all');
  const [openIds, setOpenIds] = useState<string[]>(['1', '3']);

  const toggleItem = (id: string) => {
    setOpenIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const faqData: FaqItem[] = [
    {
      id: '1',
      category: 'readers',
      questionAr: 'هل القراءة على منصة «روايتي» مجانية؟',
      questionEn: 'Is reading on Roayti completely free?',
      answerAr: 'نعم، جميع الروايات والفصول المنشورة متاحة للقراءة مجاناً بنسبة 100% دون أي رسوم اشتراك، وندعم استمرارية تشغيل الخوادم وتطوير المنصة عبر إعلانات Google AdSense النظيفة وغير المزعجة.',
      answerEn: 'Yes! All published novels and chapters are 100% free to read without any subscription fees. Our cloud servers and ongoing developments are supported through clean, unobtrusive Google AdSense advertising.'
    },
    {
      id: '2',
      category: 'readers',
      questionAr: 'كيف أحفظ تقدمي في القراءة للرجوع إليه لاحقاً؟',
      questionEn: 'How can I save my reading progress to resume later?',
      answerAr: 'يقوم نظام روايتي بحفظ آخر فصل ورقم الفقرة التي وصلت إليها تلقائياً. يمكنك أيضاً إضافة أي رواية إلى «مكتبتي» عبر الضغط على أيقونة الإضافة في صفحة الرواية للوصول إليها بسرعة من أي جهاز.',
      answerEn: 'Roayti automatically bookmarks your latest chapter. Additionally, you can add any novel to "My Library" by tapping the bookmark icon on any novel card to resume reading seamlessly on any device.'
    },
    {
      id: '3',
      category: 'authors',
      questionAr: 'هل أحتفظ بحقوق الملكية الفكرية لرواياتي التي أكتبها هنا؟',
      questionEn: 'Do I retain intellectual property rights to my novels written here?',
      answerAr: 'نعم بكل تأكيد. أنت المالك الحصري بنسبة 100% لكل نص ورواية تنشرها على روايتي. لا نطالب بأي حقوق ملكية تجارية حصرية على نصوصك، ويحق لك تعديلها أو حذفها أو نشرها ورقياً متى شئت.',
      answerEn: 'Absolutely. You retain 100% full intellectual property and copyright ownership over your novels. Roayti does not claim exclusive commercial rights, and you are free to unpublish, edit, or publish your work in print at any time.'
    },
    {
      id: '4',
      category: 'authors',
      questionAr: 'كيف يمكنني نشر روايتي الأولى على المنصة؟',
      questionEn: 'How can I publish my first novel on Roayti?',
      answerAr: 'ببساطة سجل دخولك، ثم اضغط على «اكتب» من الشريط العلوي، واختر «إنشاء رواية جديدة». يمكنك كتابة الفصول يدوياً، أو استيراد ملفات Word/PDF، أو استخدام الكاتب الذكي للمساعدة في رسم الحبكة والشخصيات.',
      answerEn: 'Simply log in, click "Write" in the top navigation, and select "New Novel". You can draft chapters manually, import Word/PDF documents, or utilize our AI writing assistant to help develop plotlines and characters.'
    },
    {
      id: '5',
      category: 'ai',
      questionAr: 'كيف يساعدني الذكاء الاصطناعي (AI Writer) دون إفساد أسلوبي الخاص؟',
      questionEn: 'How does the AI Writer assist me without overriding my unique voice?',
      answerAr: 'صُمم الكاتب الذكي ليكون مساعداً إبداعياً لك وليس بديلاً عنك؛ حيث يقدم لك اقتراحات لتطوير مسار القصة، اقتراح حوارات بديلة، وبناء خلفيات للشخصيات. يمكنك قبول ما يعجبك وتعديله أو رفضه بحرية تامة.',
      answerEn: 'Our AI is built as a creative co-pilot, not a replacement for your voice. It offers ideas to overcome writer’s block, suggests alternative dialogues, and enriches character backstories. You remain in total creative control to edit, accept, or discard suggestions.'
    },
    {
      id: '6',
      category: 'ai',
      questionAr: 'كيف تضمن المنصة خلو المحتوى من الشركيات والمخالفات الأخلاقية؟',
      questionEn: 'How does Roayti ensure content remains respectful and family-friendly?',
      answerAr: 'تم تزويد المنصة بنظام تنقية ذكي إسلامي وأخلاقي متقدم (Sanitizer) يقوم تلقائياً بتهذيب التعبيرات الشركية الخيالية (مثل استبدال إله الرعد بسيد الرعد، والآلهة بالجبابرة والأساطير) بما يحفظ بلاغة السرد ويمنع المحظورات الشرعية دون تخريب سياق القصة.',
      answerEn: 'Our platform incorporates an advanced, context-aware ethical sanitizer that automatically refines problematic polytheistic fantasy tropes into permissible, high-literary epic titles, ensuring a respectful atmosphere for all readers without compromising dramatic storytelling.'
    },
    {
      id: '7',
      category: 'ads',
      questionAr: 'لماذا توجد إعلانات على موقع روايتي؟',
      questionEn: 'Why are ads displayed on Roayti?',
      answerAr: 'الإعلانات هي الشريان الذي يتيح لنا تقديم خدمات استضافة سحابية عالية السرعة مجاناً لجميع القراء والكتاب، ودفع تكاليف خوادم الذكاء الاصطناعي والصيانة المستمرة. نحرص بشدة على أن تكون الإعلانات ملائمة وآمنة وفق معايير Google الصارمة.',
      answerEn: 'Advertising enables us to provide high-speed cloud hosting and AI computing completely free to all authors and readers. We strictly adhere to Google AdSense standards to ensure only safe, high-quality, non-intrusive ads are shown.'
    },
    {
      id: '8',
      category: 'ads',
      questionAr: 'كيف يمكنني الإبلاغ عن محتوى غير لائق أو انتهاك لحقوق النشر؟',
      questionEn: 'How can I report inappropriate content or copyright infringement?',
      answerAr: 'يمكنك التوجه مباشرة إلى صفحة «اتصل بنا» واختيار نوع الاستفسار "بلاغ حقوق ملكية فكرية" أو "إبلاغ عن محتوى"، وسيقوم فريق المراجعة بالتحقق من البلاغ وحذف المحتوى المخالف في غضون 24 ساعة.',
      answerEn: 'You can navigate to our "Contact Us" page and select "Copyright / DMCA Notice" or "Content Report". Our moderation team will investigate and take immediate corrective action within 24 hours.'
    }
  ];

  const filteredFaq = activeTab === 'all'
    ? faqData
    : faqData.filter(item => item.category === activeTab);

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
          FAQ & Knowledge Base — الأسئلة الشائعة
        </span>
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-4 shadow-sm border border-amber-100">
          <HelpCircle size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight mb-3">
          {isAr ? 'الأسئلة الشائعة ودليل المنصة' : 'Frequently Asked Questions & Help'}
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'إجابات شاملة ومفصلة حول كيفية القراءة، أدوات النشر للكتاب، ميزات الذكاء الاصطناعي، والسياسات الإعلانية على منصة روايتي.'
            : 'Clear, comprehensive answers about reading, publishing tools, AI features, and advertising integrity on Roayti.'}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {[
          { key: 'all', labelAr: 'الكل', labelEn: 'All Questions', icon: HelpCircle },
          { key: 'readers', labelAr: 'للقراء', labelEn: 'For Readers', icon: BookOpen },
          { key: 'authors', labelAr: 'للكتّاب', labelEn: 'For Authors', icon: Feather },
          { key: 'ai', labelAr: 'الذكاء الاصطناعي', labelEn: 'AI & Ethics', icon: Sparkles },
          { key: 'ads', labelAr: 'الإعلانات والخصوصية', labelEn: 'Ads & Support', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-black/5 text-gray-600 hover:bg-black/10'
              }`}
            >
              <Icon size={14} />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion List */}
      <div className="space-y-4 mb-12">
        {filteredFaq.map((item) => {
          const isOpen = openIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-full p-5 sm:p-6 text-left sm:text-right flex items-center justify-between gap-4 transition-colors ${
                  isAr ? 'text-right' : 'text-left'
                } ${isOpen ? 'bg-black/[0.02]' : 'hover:bg-black/[0.01]'}`}
              >
                <span className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                  {isAr ? item.questionAr : item.questionEn}
                </span>
                <span className="text-gray-400 shrink-0">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-2 text-sm text-gray-600 leading-relaxed border-t border-black/5">
                  <p>{isAr ? item.answerAr : item.answerEn}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions CTA */}
      <div className="p-8 bg-gray-50 border border-gray-200 rounded-2xl text-center">
        <h3 className="font-bold text-gray-900 text-base mb-2">
          {isAr ? 'لم تجد إجابة لسؤالك؟' : 'Still have a question?'}
        </h3>
        <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
          {isAr
            ? 'فريق الدعم الفني والأدبي في روايتي جاهز لمساعدتك في أي استفسار.'
            : 'Our technical and editorial support team is happy to answer your inquiries.'}
        </p>
        <button
          onClick={() => onNavigateView ? onNavigateView('contact') : onBack()}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black/80 transition-all inline-flex items-center gap-2"
        >
          {isAr ? 'تواصل مع فريق الدعم الآن' : 'Contact Support Directly'}
        </button>
      </div>
    </div>
  );
};
