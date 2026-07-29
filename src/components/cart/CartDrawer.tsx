import { useState, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { CartItem, ShippingRate } from "../../types";
import CheckoutForm from "./CheckoutForm";
import { trackEvent } from "../../utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  shippingRates: ShippingRate[];
  onUpdateQuantity: (
    id: number,
    power: string | undefined,
    delta: number,
  ) => void;
  onRemoveItem: (id: number, power: string | undefined) => void;
  onCheckout: (customerInfo: {
    name: string;
    phone: string;
    governorate: string;
    address: string;
    paymentMethod: string;
    shippingFee: number;
    totalWithShipping: number;
  }) => void;
}

const CartDrawer = memo(function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  shippingRates = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsCheckingOut(false);
    }
  }, [isOpen]);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems],
  );
  const isCartEmpty = cartItems.length === 0;

  useEffect(() => {
    if (isCheckingOut) {
      trackEvent("InitiateCheckout", {
        value: subtotal,
        currency: "EGP",
        contentType: "product",
        contentIds: cartItems.map((item) => String(item.id)),
        contents: cartItems.map((item) => ({
          id: String(item.id),
          quantity: item.quantity,
          item_price: item.price,
        })),
        num_items: cartItems.reduce((acc, item) => acc + item.quantity, 0),
      });
    }
  }, [isCheckingOut, subtotal, cartItems]);

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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="w-[88vw] min-[360px]:w-[350px] sm:w-[400px] bg-[#FFFFFF] text-stone-900 flex flex-col h-full border-l border-stone-200"
            >
              {isCheckingOut ? (
                <CheckoutForm
                  totalAmount={subtotal}
                  shippingRates={shippingRates}
                  onBack={() => setIsCheckingOut(false)}
                  onSubmit={(customerData) => {
                    onCheckout(customerData);
                    setIsCheckingOut(false);
                  }}
                />
              ) : (
                <>
                  {/* Header */}
                  <div className="px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-stone-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FFFFFF] flex items-center justify-center border border-stone-200">
                        <ShoppingBag className="text-stone-900" size={16} />
                      </div>
                      <span className="text-base font-extrabold text-stone-900">
                        حقيبة التسوق
                      </span>
                      <span className="bg-stone-100 text-xs font-bold text-stone-800 px-2 py-0.5 rounded-md border border-stone-200">
                        {cartItems.reduce(
                          (acc, item) => acc + item.quantity,
                          0,
                        )}
                      </span>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-full hover:bg-stone-100 transition-colors text-stone-600 hover:text-stone-950 cursor-pointer"
                      aria-label="إغلاق حقيبة التسوق"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto py-4 sm:py-5 px-4 sm:px-6">
                    {isCartEmpty ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-5">
                        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center border border-stone-200 text-stone-700">
                          <ShoppingBag size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-stone-800">
                            حقيبتك فارغة حالياً
                          </h3>
                          <p className="text-xs text-stone-700 max-w-[240px] mx-auto leading-relaxed">
                            أضف بعضاً من عدساتنا اللاصقة الفاخرة لبدء تجربة
                            الرؤية الفائقة والجمال.
                          </p>
                        </div>
                        <button
                          onClick={onClose}
                          className="text-xs bg-stone-900 text-white hover:bg-black transition-all px-4 py-2 rounded-lg font-bold cursor-pointer active:scale-95 shadow-xs"
                        >
                          تصفح المنتجات
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="divide-y divide-stone-200">
                          <AnimatePresence initial={false}>
                            {cartItems.map((item) => (
                              <motion.div
                                key={`${item.id}-${item.power || "none"}`}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                  opacity: 0,
                                  height: 0,
                                  marginTop: 0,
                                  paddingBottom: 0,
                                }}
                                className="py-4 flex gap-4 items-center justify-between"
                              >
                                {/* Image & Product info */}
                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                  {/* Product Image */}
                                  <div className="relative w-16 h-16 bg-brand-beige rounded-xl overflow-hidden shrink-0">
                                    <img
                                      loading="lazy"
                                      src={item.image}
                                      alt={item.name}
                                      className="absolute inset-0 w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>

                                  {/* Product Details */}
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-xs sm:text-sm text-stone-900 truncate">
                                      {item.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5 items-center mt-1">
                                      <span className="text-[10px] text-stone-500 font-normal">
                                        عبوة معقمة وآمنة
                                      </span>
                                      {item.power && (
                                        <span className="text-[9px] bg-brand-cream text-stone-900 px-2 py-0.5 rounded-md border border-stone-200 font-semibold">
                                          قياس: {item.power}
                                        </span>
                                      )}
                                    </div>

                                    {/* Quantity Selector inside details for better layout */}
                                    <div className="flex items-center gap-3 mt-2.5">
                                      <div className="flex items-center border border-stone-200 rounded-lg bg-brand-cream p-0.5">
                                        <button
                                          onClick={() =>
                                            onUpdateQuantity(
                                              item.id,
                                              item.power,
                                              -1,
                                            )
                                          }
                                          className="p-1.5 px-2.5 text-stone-700 hover:text-stone-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                          disabled={item.quantity <= 1}
                                        >
                                          <Minus size={10} />
                                        </button>
                                        <span className="text-xs px-1.5 font-bold text-stone-900">
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() =>
                                            onUpdateQuantity(
                                              item.id,
                                              item.power,
                                              1,
                                            )
                                          }
                                          className="p-1.5 px-2.5 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
                                        >
                                          <Plus size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Price & Remove Button */}
                                <div className="flex flex-col items-end justify-between self-stretch py-1 pl-1">
                                  <button
                                    onClick={() =>
                                      onRemoveItem(item.id, item.power)
                                    }
                                    className="p-1.5 text-stone-500 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-all cursor-pointer"
                                    aria-label="حذف المنتج"
                                  >
                                    <Trash2 size={14} />
                                  </button>

                                  <span className="text-xs sm:text-sm font-bold text-stone-900 shrink-0">
                                    {(item.price * item.quantity).toFixed(2)}{" "}
                                    جنيه
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subtotal & Action */}
                  {!isCartEmpty && (
                    <div className="p-4 sm:p-6 bg-white border-t border-stone-200 space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex justify-between text-xs text-stone-700 font-medium">
                          <span>المجموع الفرعي للسلع</span>
                          <span className="text-stone-900 font-semibold">
                            {subtotal.toFixed(2)} جنيه
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-stone-700 font-medium">
                          <span>سعر الشحن للمحافظة</span>
                          <span className="text-stone-800 font-bold">
                            يُحتسب عند الدفع
                          </span>
                        </div>
                        <div className="border-t border-stone-200 my-2 pt-2.5 flex justify-between text-sm font-bold text-stone-900">
                          <span>المجموع الفرعي</span>
                          <span className="text-base text-stone-900 font-extrabold">
                            {subtotal.toFixed(2)} جنيه
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full bg-stone-900 text-white hover:bg-black py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
                      >
                        <CreditCard size={15} />
                        <span>إتمام الشراء والدفع الآمن</span>
                      </button>

                      <div className="text-center">
                        <p className="text-[9px] text-stone-700 font-medium leading-relaxed max-w-[90%] mx-auto">
                          كل شحنة من لينا يتم تعويض انبعاثات الكربون منها
                          بالكامل لدعم مبادرات زراعة الغابات في عالمنا العربي.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
});

export default CartDrawer;
