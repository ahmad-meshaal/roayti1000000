import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, ShieldCheck, Heart, Sparkles, MapPin, Mail, Globe, Code, HelpCircle } from 'lucide-react';

interface FooterProps {
  setView: (v: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const navigateTo = (viewName: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = viewName;
    setView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-24 border-t border-black/10 bg-white/60 backdrop-blur-sm text-gray-700 pt-16 pb-12 transition-all">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-serif font-bold text-lg">
                ر
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-gray-900">
                {t('app_name', 'روايتي')}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-600">
              {isAr
                ? 'منصة الروايات العربية الأولى المتخصصة في القراءة الحرة، وتأليف القصص، وتمكين المبدعين بأحدث أدوات الذكاء الاصطناعي الأخلاقي.'
                : 'The premier Arabic web novel platform for free reading, interactive writing, and creative author empowerment powered by ethical AI.'}
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/80 w-fit">
              <ShieldCheck size={14} />
              <span>{isAr ? 'بيئة أدبية نقية وملكية فكرية محفوظة' : '100% Author IP Protected & Safe'}</span>
            </div>
          </div>

          {/* Column 2: Platform Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-black/5">
              {isAr ? 'الخدمات والأدوات' : 'Features & Tools'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#explore" onClick={navigateTo('explore')} className="text-gray-600 hover:text-black transition-colors block">
                  {t('explore', 'استكشف الروايات')}
                </a>
              </li>
              <li>
                <a href="#dashboard" onClick={navigateTo('dashboard')} className="text-gray-600 hover:text-black transition-colors flex items-center gap-1.5">
                  <Sparkles size={12} className="text-purple-600" />
                  <span>{isAr ? 'محرر الكاتب الذكي (AI Writer)' : 'AI Novel Writer Studio'}</span>
                </a>
              </li>
              <li>
                <a href="#library" onClick={navigateTo('library')} className="text-gray-600 hover:text-black transition-colors block">
                  {t('library', 'مكتبتي السحابية')}
                </a>
              </li>
              <li>
                <a href="#sitemap" onClick={navigateTo('sitemap')} className="text-gray-600 hover:text-black transition-colors block">
                  {t('sitemap', 'خريطة الموقع الكاملة')}
                </a>
              </li>
              <li>
                <a href="#api" onClick={navigateTo('api')} className="text-gray-600 hover:text-black transition-colors flex items-center gap-1.5">
                  <Code size={12} />
                  <span>{t('api_docs', 'توثيق واجهة API')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-black/5">
              {isAr ? 'الشفافية والسياسات' : 'Transparency & Policies'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#about" onClick={navigateTo('about')} className="text-gray-600 hover:text-black transition-colors block">
                  {t('about_us', 'عن منصة روايتي (من نحن)')}
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={navigateTo('privacy')} className="text-gray-600 hover:text-black transition-colors font-medium text-emerald-800 block">
                  {t('privacy_policy', 'سياسة الخصوصية وملفات الكوكيز')}
                </a>
              </li>
              <li>
                <a href="#terms" onClick={navigateTo('terms')} className="text-gray-600 hover:text-black transition-colors block">
                  {t('terms_of_service', 'شروط وأحكام الاستخدام')}
                </a>
              </li>
              <li>
                <a href="#faq" onClick={navigateTo('faq')} className="text-gray-600 hover:text-black transition-colors flex items-center gap-1.5">
                  <HelpCircle size={12} className="text-amber-600" />
                  <span>{isAr ? 'الأسئلة الشائعة والمساعدة' : 'FAQ & Support'}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-black/5">
              {isAr ? 'الدعم والاستفسارات' : 'Support & Contact'}
            </h4>
            <div className="space-y-3 text-xs text-gray-600">
              <p>
                {isAr
                  ? 'فريق الدعم الفني والأدبي متاح للإجابة على استفساراتكم وبلاغات حقوق الملكية الفكرية على مدار الساعة.'
                  : 'Our technical and editorial team is available to assist you with inquiries and copyright DMCA notices.'}
              </p>
              <div className="pt-1">
                <a
                  href="#contact"
                  onClick={navigateTo('contact')}
                  className="inline-flex items-center gap-1.5 bg-black text-white px-3.5 py-2 rounded-xl font-bold hover:bg-black/80 transition-all"
                >
                  <Mail size={13} />
                  <span>{t('contact_us', 'اتصل بنا / افتح تذكرة')}</span>
                </a>
              </div>
              <div className="text-[11px] text-gray-500 pt-1 font-mono">
                roayti0@gmail.com
              </div>
            </div>
          </div>

        </div>

        {/* AdSense & Ethical Disclosure */}
        <div className="pt-6 pb-6 border-t border-black/5 text-center text-[11px] text-gray-500 leading-relaxed max-w-3xl mx-auto">
          {isAr
            ? 'تلتزم منصة «روايتي» بأعلى معايير جودة المحتوى الرقمي المعتمدة من شبكة Google الإعلانية (Google AdSense). جميع الروايات تخضع للرقابة الأخلاقية والتحقق الأدبي لضمان تجربة مستخدم موثوقة وآمنة لجميع الأعمار.'
            : 'Roayti.com strictly complies with Google AdSense quality and transparency policies. All published content undergoes automated and editorial reviews to guarantee a safe, reliable, and premium user experience.'}
        </div>

        {/* Bottom Bar: Copyright & Rights */}
        <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {t('app_name', 'روايتي')} — {t('all_rights_reserved', 'جميع الحقوق محفوظة')}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a href="#about" onClick={navigateTo('about')} className="hover:text-black">من نحن</a>
            <span>•</span>
            <a href="#privacy" onClick={navigateTo('privacy')} className="hover:text-black">الخصوصية</a>
            <span>•</span>
            <a href="#terms" onClick={navigateTo('terms')} className="hover:text-black">الشروط</a>
            <span>•</span>
            <a href="#contact" onClick={navigateTo('contact')} className="hover:text-black">الدعم</a>
            <span>•</span>
            <a href="#faq" onClick={navigateTo('faq')} className="hover:text-black">الأسئلة الشائعة</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
