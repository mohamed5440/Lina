import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Instagram,
  Award,
  Facebook,
  Phone,
} from "lucide-react";
import WhatsAppIcon from "../ui/WhatsAppIcon";

import { Category, ContactInfo } from "../../types";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
  categories: Category[];
  onSelectCategory: (id: string) => void;
  selectedCategory: string;
  contactInfo?: ContactInfo;
  onViewChange?: (view: "home" | "products") => void;
}

export default function SidebarMenu({
  isOpen,
  onClose,
  categories,
  onSelectCategory,
  selectedCategory,
  contactInfo,
  onViewChange,
}: SidebarMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="w-[85vw] min-[360px]:w-[340px] sm:w-[400px] bg-[#FFFFFF] text-stone-900 flex flex-col h-full border-l border-stone-200"
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-stone-200">
                <span className="text-lg font-extrabold tracking-wide text-stone-900">
                  لينا
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-stone-100 transition-colors text-stone-600 hover:text-stone-900"
                  aria-label="إغلاق القائمة"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-5 px-5 space-y-5">
                <div className="space-y-2.5">
                  <p className="text-stone-500 text-xs tracking-wider font-bold uppercase">
                    تصفح المنتجات
                  </p>
                  <ul className="space-y-2">
                    {[{ id: "all", name: "جميع المنتجات" }, ...categories].map(
                      (item) => {
                        const isSelected = selectedCategory === item.id;
                        return (
                          <motion.li
                            key={item.id}
                            whileHover={{ x: -4 }}
                            className="group"
                          >
                            <button
                              onClick={() => {
                                onSelectCategory(item.id);
                                if (onViewChange) {
                                  onViewChange("products");
                                }
                                onClose();
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`text-base font-semibold transition-colors flex items-center gap-2 text-right cursor-pointer outline-none bg-transparent border-none p-0 ${
                                isSelected
                                  ? "text-stone-950 font-bold"
                                  : "text-stone-700 hover:text-stone-950"
                              }`}
                            >
                              <span>{item.name}</span>
                              <span className="text-xs text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                ←
                              </span>
                            </button>
                          </motion.li>
                        );
                      },
                    )}
                  </ul>
                </div>

                {/* Certifications Badge */}
                <div className="bg-brand-cream p-3.5 rounded-xl border border-stone-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-stone-900">
                    <Award size={16} className="text-amber-600" />
                    <span className="text-xs font-bold text-stone-900">
                      تعهدنا بصحة العين والجودة
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-normal">
                    عدساتنا معقمة طبياً ومصممة بمواد حيوية ناعمة تحافظ على ترطيب
                    القرنية، مغلفة بعناية لضمان سلامة عينيك.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 bg-white border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-700 font-medium">
                  <span>لينا للعدسات © ٢٠٢٦</span>
                  <div className="flex gap-3 text-stone-600">
                    <a
                      href={contactInfo?.facebook || "https://www.facebook.com/share/19QcqQDZp3/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover:bg-stone-100 hover:text-blue-600 transition-colors"
                      title="فيسبوك"
                    >
                      <Facebook size={18} />
                    </a>
                    <a
                      href={contactInfo?.instagram || "https://www.instagram.com/lina_contact_lenses?igsh=aGx0Zms3eDA2dTA2"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover:bg-stone-100 hover:text-pink-600 transition-colors"
                      title="انستغرام"
                    >
                      <Instagram size={18} />
                    </a>
                    <a
                      href={`https://wa.me/${contactInfo?.whatsapp || "201204356416"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover:bg-stone-100 hover:text-emerald-600 transition-colors"
                      title="واتساب"
                    >
                      <WhatsAppIcon size={21} />
                    </a>
                    <a
                      href={`tel:${(contactInfo?.phone || "01204356416").replace(/\s+/g, "")}`}
                      className="p-1.5 rounded-full hover:bg-stone-100 hover:text-stone-950 transition-colors"
                      title="اتصل بنا"
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
