import React from 'react';
import { ArrowLeft, BookOpen, Sparkles, Feather, Users, Award, ShieldCheck, Heart, Layers, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AboutUsViewProps {
  onBack: () => void;
  onNavigateView?: (view: any) => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({ onBack, onNavigateView }) => {
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
          About Roayti — عن المنصة
        </span>
      </div>

      {/* Hero Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-black text-white mb-6 shadow-md">
          <BookOpen size={30} />
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 tracking-tight mb-4">
          {isAr ? 'عن منصة «روايتي»' : 'About Roayti Platform'}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'المنصة العربية الرائدة التي تدمج عراقة الأدب الروائي العربي مع أحدث أدوات الكتابة التفاعلية والذكاء الاصطناعي الأخلاقي، لتمكين الكتاب وإثراء شغف القراء.'
            : 'The premier Arabic novel platform bridging literary storytelling heritage with cutting-edge interactive writing technology and ethical AI, empowering authors and delighting avid readers.'}
        </p>
      </div>

      {/* Unique Value Grid (4 Cards) */}
      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {isAr ? 'الكاتب الذكي التفاعلي (AI Co-pilot)' : 'Intelligent Writing Co-pilot'}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'نظام مساعد إبداعي فريد يساعد الأدباء على التغلب على قفلة الكاتب (Writer’s Block)، وتوليد حبكات متماسكة، ورسم أبعاد الشخصيات مع احترام كامل للغة العربية الفصحى والأخلاقيات الإسلامية.'
              : 'A unique creative assistant designed to overcome writer’s block, generate compelling narrative arcs, and construct deep character profiles with strict adherence to literary Arabic eloquence and ethical standards.'}
          </p>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Feather size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {isAr ? 'بيئة قراءة ومحرر مصممان للأدب' : 'Distraction-Free Reading & Editing'}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'قارئ مخصص يتيح تعديل الخطوط وحجمها وارتفاع الأسطر، مع أنماط قراءة نهارية وليلية، وتتبع ذكي لموقع القراءة في كل فصل ليواصل القارئ رحلته بكل راحة.'
              : 'A bespoke reading experience offering typographic controls, night and day modes, auto-bookmarking, and smooth chapter transitions tailored for prolonged book reading.'}
          </p>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {isAr ? 'حماية الملكية الفكرية والرقابة الأخلاقية' : 'Intellectual Property & Content Integrity'}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'يحتفظ الكتاب بحقوق ملكية رواياتهم 100%. كما يضم الموقع فلاتر ذكية تعمل على تنقية المحتوى تلقائياً من الألفاظ الشركية والخارجة لضمان بيئة أدبية نقية لجميع أفراد الأسرة.'
              : 'Authors retain 100% intellectual property ownership of their original works. Automated ethical sanitizers ensure novels remain respectful, safe, and family-friendly.'}
          </p>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {isAr ? 'مجتمع أدبي حي ومكتبة تفاعلية' : 'Active Community & Interactive Library'}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isAr
              ? 'مكتبة سحابية شخصية لحفظ الروايات المفضلة، نظام متابعة للكتاب، إحصائيات فورية للمشاهدات والتفاعلات، ومساحة نقاش راقية بين القراء والمؤلفين.'
              : 'A personalized cloud library, author follow system, real-time chapter readership metrics, and respectful discussion spaces connecting creators with passionate readers.'}
          </p>
        </div>
      </div>

      {/* Mission & Story */}
      <div className="bg-white border border-black/10 rounded-2xl p-8 sm:p-10 shadow-sm space-y-6 mb-12">
        <h2 className="text-2xl font-serif font-bold text-gray-900 border-b border-black/5 pb-3">
          {isAr ? 'رسالتنا وهويتنا' : 'Our Mission & Story'}
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            {isAr
              ? 'انطلقت منصة «روايتي» برؤية واضحة: سد الفجوة الرقمية في المشهد الأدبي العربي الحديث. في عالم تتسارع فيه التكنولوجيا، نؤمن بأن الرواية هي الحصن الأجمل للمشاعر الإنسانية والأفكار العميقة، وأن الذكاء الاصطناعي لا ينبغي أن يحل محل الكاتب، بل أن يكون ريشة جديدة في يده تعزز خياله وتختصر عليه مشقة التخطيط.'
              : 'Roayti was founded with a singular purpose: closing the digital divide in modern Arabic literature. In an era of rapid technological acceleration, we believe the novel remains the paramount vessel of human empathy and philosophical wonder. AI should never replace the writer, but serve as an empowering quill expanding imaginative horizons.'}
          </p>
          <p>
            {isAr
              ? 'نحن نوفر بنية تحتية مستقرة ومتطورة تمكن المؤلفين المبتدئين والمحترفين من كتابة روايات كاملة، تنسيق الفصول، بناء الشخصيات، وتحويل المخطوطات إلى صيغ رقمية جاهزة للنشر والتصدير، مع توفير تجربة قراءة مجانية وسلسة لملايين القراء في الوطن العربي والمهجر.'
              : 'We deliver a reliable, enterprise-grade publishing infrastructure that allows authors of all backgrounds to draft multi-volume novels, structure character bibles, and export manuscripts, while offering millions of Arabic readers worldwide an immaculate reading experience.'}
          </p>
        </div>

        {/* Core Principles */}
        <div className="pt-4 border-t border-black/5">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {isAr ? 'المبادئ الأساسية التي نلتزم بها:' : 'Our Core Editorial Principles:'}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="font-bold block text-gray-900 mb-1">✨ {isAr ? 'الجودة على حساب الكم' : 'Quality First'}</span>
              <span className="text-gray-600">{isAr ? 'نحرص على نشر محتوى ذي قيمة أدبية وبناء سردي محكم.' : 'Curating and fostering stories that enrich and inspire readers.'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="font-bold block text-gray-900 mb-1">🛡️ {isAr ? 'النزاهة والشفافية' : 'Integrity & Transparency'}</span>
              <span className="text-gray-600">{isAr ? 'احترام كامل لبيانات القراء والكتاب ومصادر الدخل الإعلانية النظيفة.' : 'Total transparency in data privacy and clean advertising standards.'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="font-bold block text-gray-900 mb-1">🌿 {isAr ? 'الأصالة اللغوية' : 'Linguistic Heritage'}</span>
              <span className="text-gray-600">{isAr ? 'الارتقاء باللغة العربية الفصحى وتقديمها بصورة عصرية جاذبة.' : 'Preserving the beauty and expressive power of Arabic prose.'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Stats / Milestones */}
      <div className="bg-black text-white rounded-2xl p-8 sm:p-10 text-center mb-12">
        <h3 className="text-xl font-bold mb-6">
          {isAr ? 'روايتي بالأرقام — إنجازات وتطور مستمر' : 'Roayti in Numbers — Continuous Growth'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400 mb-1">+100%</div>
            <div className="text-xs text-white/60">{isAr ? 'ملكية الكاتب لأعماله' : 'Author Rights Kept'}</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-blue-400 mb-1">24/7</div>
            <div className="text-xs text-white/60">{isAr ? 'توفر واستقرار سحابي' : 'Cloud Uptime'}</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-purple-400 mb-1">AI 2.5</div>
            <div className="text-xs text-white/60">{isAr ? 'أحدث نماذج الذكاء' : 'Latest AI Models'}</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-400 mb-1">0%</div>
            <div className="text-xs text-white/60">{isAr ? 'رسوم على القراءة' : 'Free Reading Access'}</div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {isAr ? 'هل لديك فكرة رواية أو ترغب في مشاركتنا مقترحاتك؟' : 'Have a novel idea or wish to share feedback?'}
        </h3>
        <p className="text-sm text-gray-600 mb-6 max-w-xl mx-auto">
          {isAr
            ? 'فريق العمل في روايتي مكرس لدعم الكتاب والقرّاء على مدار الساعة. تواصل معنا في أي وقت.'
            : 'The Roayti editorial and technical team is dedicated to supporting creators around the clock.'}
        </p>
        <button
          onClick={() => onNavigateView ? onNavigateView('contact') : onBack()}
          className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black/80 transition-all inline-flex items-center gap-2"
        >
          {isAr ? 'تواصل مع فريق روايتي' : 'Contact Roayti Team'}
        </button>
      </div>
    </div>
  );
};
