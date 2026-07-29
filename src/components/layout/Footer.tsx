import { memo } from "react";
import { Instagram, Mail, Phone, Facebook } from "lucide-react";
import WhatsAppIcon from "../ui/WhatsAppIcon";
import { ContactInfo, Category } from "../../types";

interface FooterProps {
  contactInfo: ContactInfo;
  categories: Category[];
  onSelectCategory?: (id: string) => void;
  onResetView?: () => void;
}

const Footer = memo(function Footer({
  contactInfo,
  categories,
  onSelectCategory,
  onResetView,
}: FooterProps) {
  const scrollToTop = () => {
    if (onResetView) {
      onResetView();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      id="app-footer"
      className="bg-[#FFFFFF] border-t border-stone-200 pt-8 pb-4 md:pt-12 md:pb-6 px-4 sm:px-6 md:px-8 lg:px-12 text-stone-800"
      dir="rtl"
    >
      <div className="max-w-[1600px] mx-auto space-y-8">
        {" "}
        {/* Top Section: Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-right">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div
              className="cursor-pointer group flex flex-col items-start"
              onClick={scrollToTop}
            >
              <span className="font-bold tracking-wide text-xl text-stone-900 group-hover:text-stone-700 transition-colors">
                لينا
              </span>
              <span className="text-[11px] tracking-wider text-stone-500 font-medium uppercase mt-0.5">
                عدسـات لاصقـة فاخـرة
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed font-normal max-w-xs">
              عدسات لاصقة طبية وتجميلية مستدامة، مصممة بأعلى معايير الراحة
              والترطيب الفائق لحماية عينيك والحفاظ على كوكبنا.
            </p>
          </div>

          {/* Column 2: Products Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900 tracking-wide">
              تصفح المنتجات
            </h3>
            <ul className="space-y-2">
              {[
                { id: "all", name: "جميع المنتجات" },
                ...(categories || []).map((c) => ({ id: c.id, name: c.name })),
              ].map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(link.id);
                      } else {
                        document
                          .getElementById("products-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="text-sm text-stone-600 hover:text-stone-900 hover:mr-1 transition-all duration-200 font-normal inline-block text-right cursor-pointer bg-transparent border-none p-0"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900 tracking-wide">
              تواصل معنا
            </h3>
            <ul className="space-y-2 font-normal text-sm text-stone-600">
              <li className="flex items-center gap-2.5 justify-start">
                <Phone size={15} className="text-stone-600 shrink-0" />
                <a
                  href={`tel:${(contactInfo.phone || "01204356416").replace(/\s+/g, "")}`}
                  className="hover:text-stone-900 transition-colors font-medium text-stone-800"
                  dir="ltr"
                >
                  {contactInfo.phone || "01204356416"}
                </a>
              </li>
              <li className="flex items-center gap-2.5 justify-start">
                <WhatsAppIcon size={19} className="text-emerald-600 shrink-0" />
                <a
                  href={`https://wa.me/${contactInfo.whatsapp || "201204356416"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 transition-colors font-medium text-stone-800"
                >
                  واتساب: {contactInfo.phone || "01204356416"}
                </a>
              </li>
              <li className="flex items-center gap-2.5 justify-start">
                <Mail size={15} className="text-stone-500 shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:text-stone-900 transition-colors"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 justify-start pt-2">
                <div className="flex gap-2.5">
                  <a
                    href={contactInfo.facebook || "https://www.facebook.com/share/19QcqQDZp3/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8.5 h-8.5 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    aria-label="صفحة الفيسبوك"
                    title="صفحة الفيسبوك"
                  >
                    <Facebook size={16} />
                  </a>
                  <a
                    href={contactInfo.instagram || "https://www.instagram.com/lina_contact_lenses?igsh=aGx0Zms3eDA2dTA2"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8.5 h-8.5 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 hover:text-pink-600 hover:border-pink-400 hover:bg-pink-50 transition-colors"
                    aria-label="صفحة انستغرام"
                    title="صفحة انستغرام"
                  >
                    <Instagram size={16} />
                  </a>
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp || "201204356416"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8.5 h-8.5 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                    aria-label="تواصل عبر واتساب"
                    title="واتساب"
                  >
                    <WhatsAppIcon size={19} />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Section: Copyright & Eco Stamp */}
        <div className="border-t border-stone-100 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-right">
          <p className="text-xs font-normal text-stone-500">
            جميع الحقوق محفوظة © ٢٠٢٦ لينا للعدسات. مصممة بحب وبشكل مستدام في
            الوطن العربي.
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
