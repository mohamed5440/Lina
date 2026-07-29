import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, User, MapPin, CreditCard } from "lucide-react";

interface CheckoutSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerInfo?: {
    name: string;
    phone: string;
    governorate: string;
    address: string;
    paymentMethod: string;
  };
  totalAmount?: number;
}

export default function CheckoutSuccessModal({
  isOpen,
  onClose,
  customerInfo,
  totalAmount,
}: CheckoutSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#FFFFFF] overflow-y-auto text-stone-900"
          dir="rtl"
        >
          <div className="flex w-full min-h-full items-center justify-center text-center p-4 sm:p-10 md:p-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="w-full max-w-xl mx-auto space-y-6 my-auto"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200/80">
                <CheckCircle2 size={38} />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-emerald-900 font-bold ">
                  تم قبول طلبك بنجاح
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold ">
                  شكراً لثقتك وصحة عينيك!
                </h2>
                <p className="text-sm text-stone-750 leading-relaxed font-medium">
                  شكراً لتسوقك من لينا. طلبك قيد المعالجة والتجهيز الآن، وسنقوم
                  بتوصيله إليك في أقرب وقت ممكن.
                </p>
              </div>

              {/* Customer Info Card */}
              {customerInfo && (
                <div className="p-6 rounded-xl bg-white border border-stone-200 text-right space-y-4 shadow-xs">
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900 border-b border-stone-200/80 pb-2.5 flex items-center gap-2">
                    <User size={15} className="text-stone-700 shrink-0" />
                    <span>تفاصيل الطلب والتسليم</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs text-stone-800 font-medium">
                    <div>
                      <span className="text-stone-500 block text-[10px] mb-0.5 font-bold">
                        الاسم بالكامل
                      </span>
                      <span className="font-bold text-stone-900">
                        {customerInfo.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] mb-0.5 font-bold">
                        رقم الهاتف
                      </span>
                      <span className="font-bold text-stone-900" dir="ltr">
                        {customerInfo.phone}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-stone-500 block text-[10px] mb-0.5 font-bold">
                        عنوان التوصيل
                      </span>
                      <span className="font-bold text-stone-900 flex items-center gap-1">
                        <MapPin size={13} className="text-stone-500 shrink-0" />
                        <span>
                          {customerInfo.governorate} - {customerInfo.address}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] mb-0.5 font-bold">
                        طريقة الدفع
                      </span>
                      <span className="font-bold text-stone-900 flex items-center gap-1">
                        <CreditCard
                          size={13}
                          className="text-stone-500 shrink-0"
                        />
                        <span>
                          {customerInfo.paymentMethod === "cod" &&
                            "الدفع عند الاستلام"}
                          {customerInfo.paymentMethod === "vodafone" &&
                            "فودافون كاش"}
                          {customerInfo.paymentMethod === "card" &&
                            "بطاقة بنكية"}
                          {!["cod", "vodafone", "card"].includes(
                            customerInfo.paymentMethod,
                          ) && customerInfo.paymentMethod}
                        </span>
                      </span>
                    </div>
                    {totalAmount !== undefined && (
                      <div>
                        <span className="text-stone-500 block text-[10px] mb-0.5 font-bold">
                          إجمالي القيمة
                        </span>
                        <span className="font-extrabold text-emerald-800 text-sm sm:text-base">
                          {totalAmount.toFixed(2)} جنيه
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <button
                  onClick={onClose}
                  className="bg-stone-900 text-white hover:bg-black transition-all font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl w-full cursor-pointer shadow-xs"
                >
                  العودة لتصفح مجموعاتنا
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
