import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle2, AlertCircle, MessageSquare, Clock, MapPin, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ContactUsViewProps {
  onBack: () => void;
}

export const ContactUsView: React.FC<ContactUsViewProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) return;

    setLoading(true);
    // Simulate sending message
    setTimeout(() => {
      const generatedTicket = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
      setTicketId(generatedTicket);
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

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
          Support & Inquiries — الدعم والاستفسارات
        </span>
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-sm border border-blue-100">
          <Mail size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight mb-3">
          {isAr ? 'اتصل بفريق منصة «روايتي»' : 'Contact Roayti Support Team'}
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'نسعد دائماً بالتواصل معكم والإجابة على كافة استفسارات الكتاب والقرّاء، وتلقي البلاغات والشكاوى المتعلقة بحقوق الملكية الفكرية أو الدعم الفني.'
            : 'We welcome your feedback, author and reader support requests, and intellectual property/DMCA notices. We are here to assist you.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Contact Form */}
        <div className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {isAr ? 'تم استلام رسالتك بنجاح!' : 'Your message has been received!'}
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                {isAr
                  ? `شكراً لتواصلك معنا. تم فتح تذكرة دعم بالرقم (${ticketId}). سيقوم فريق الدعم الفني بمراجعة طلبك والرد على بريدك الإلكتروني خلال 24 ساعة.`
                  : `Thank you for reaching out. A support ticket has been created with ID (${ticketId}). Our team will review your inquiry and reply to your email within 24 hours.`}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                  setSubject('');
                }}
                className="mt-6 inline-block text-xs font-bold underline text-black/60 hover:text-black"
              >
                {isAr ? 'إرسال رسالة أخرى' : 'Send another inquiry'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    {isAr ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-black focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-black focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {isAr ? 'نوع الاستفسار' : 'Inquiry Category'} *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-black focus:outline-none transition-all bg-white"
                >
                  <option value="general">{isAr ? 'استفسار عام أو اقتراح' : 'General Inquiry / Feedback'}</option>
                  <option value="technical">{isAr ? 'دعم فني ومشاكل المحرر' : 'Technical Support / Editor Issue'}</option>
                  <option value="author">{isAr ? 'استفسارات الكتاب والنشر' : 'Author & Publishing Query'}</option>
                  <option value="dmca">{isAr ? 'بلاغ حقوق ملكية فكرية (DMCA)' : 'Copyright / DMCA Notice'}</option>
                  <option value="ads">{isAr ? 'استفسارات الإعلانات والشراكات' : 'Advertising & Commercial Partnership'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {isAr ? 'موضوع الرسالة' : 'Subject'} *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isAr ? 'عنوان ملخص للاستفسار' : 'Brief subject summary'}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-black focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {isAr ? 'نص الرسالة أو تفاصيل البلاغ' : 'Message Details'} *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isAr ? 'اكتب تفاصيل استفسارك أو مشكلتك هنا مع ذكر الروابط المعنية إن وجدت...' : 'Describe your inquiry or report in detail...'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-black focus:outline-none transition-all resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-black/80 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>{isAr ? 'جاري الإرسال...' : 'Sending...'}</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{isAr ? 'إرسال الرسالة إلى فريق الدعم' : 'Submit Inquiry to Support'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Channels & SLA */}
        <div className="space-y-6">
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-600" />
              {isAr ? 'قنوات الاتصال المباشرة' : 'Direct Support Channels'}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-xs text-gray-500 mb-0.5">{isAr ? 'البريد الإلكتروني الرسمي:' : 'Official Support Email:'}</span>
                <a href="mailto:ahmad.meshaalp@gmail.com" className="font-mono font-bold text-black hover:underline break-all">
                  ahmad.meshaalp@gmail.com
                </a>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-xs text-gray-500 mb-0.5">{isAr ? 'سرعة الاستجابة المقدرة:' : 'Estimated Response Time:'}</span>
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-500" />
                  {isAr ? 'خلال 24 إلى 48 ساعة عمل' : 'Within 24 to 48 business hours'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-xs text-gray-500 mb-0.5">{isAr ? 'النطاق والمقر:' : 'Platform Jurisdiction:'}</span>
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-500" />
                  {isAr ? 'المملكة العربية السعودية / متاح عالمياً' : 'Saudi Arabia / Globally Accessible'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-700" />
              {isAr ? 'حماية حقوق النشر والملكية (DMCA)' : 'Copyright & DMCA Inquiries'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isAr
                ? 'إذا كنت صاحب حق نشر وتعتقد أن عملاً على منصة روايتي ينتهك حقوقك الفكرية، يُرجى اختيار نوع الاستفسار "بلاغ حقوق ملكية" وتزويدنا برابط العمل والوثائق المثبتة للملكية، وسنتخذ الإجراءات الفورية اللازمة وفقاً للقانون.'
                : 'If you are a copyright owner and believe a novel on Roayti infringes your rights, please select "Copyright / DMCA Notice" and provide the work URL and proof of ownership. We strictly enforce DMCA compliance.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
