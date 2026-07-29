import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { Product } from "../../types";
import { Select } from "../ui/ui";

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (
    id: number,
    name: string,
    price: number,
    image: string,
    power?: string,
    qty?: number,
  ) => void;
}

const POWERS = [
  "0.00 (تجميلي)",
  "+6.00",
  "+5.75",
  "+5.50",
  "+5.25",
  "+5.00",
  "+4.75",
  "+4.50",
  "+4.25",
  "+4.00",
  "+3.75",
  "+3.50",
  "+3.25",
  "+3.00",
  "+2.75",
  "+2.50",
  "+2.25",
  "+2.00",
  "+1.75",
  "+1.50",
  "+1.25",
  "+1.00",
  "+0.75",
  "+0.50",
  "+0.25",
  "-0.25",
  "-0.50",
  "-0.75",
  "-1.00",
  "-1.25",
  "-1.50",
  "-1.75",
  "-2.00",
  "-2.25",
  "-2.50",
  "-2.75",
  "-3.00",
  "-3.25",
  "-3.50",
  "-3.75",
  "-4.00",
  "-4.25",
  "-4.50",
  "-4.75",
  "-5.00",
  "-5.25",
  "-5.50",
  "-5.75",
  "-6.00",
  "-6.50",
  "-7.00",
  "-7.50",
  "-8.00",
  "-8.50",
  "-9.00",
  "-9.50",
  "-10.00",
  "-10.50",
  "-11.00",
  "-11.50",
  "-12.00",
];

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onAddToCart,
}) => {
  const [selectedPower, setSelectedPower] = useState("0.00 (تجميلي)");
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setSelectedPower("0.00 (تجميلي)");
    setQuantity(1);
    setImgError(false);
  }, [product?.id]);

  // Calculate dynamic badge content to unify and link with ProductCard on the main page
  const discountPercent = product?.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const badgeContent =
    product?.badgeText ||
    (discountPercent ? `وفر حتى ${discountPercent}%` : null) ||
    (product?.isNew ? "جديد" : null);

  const lensCheck = product?.category !== "solutions";

  const handleAddToCartClick = () => {
    if (!product) return;
    onAddToCart(
      product.id,
      product.name,
      product.price,
      product.image,
      lensCheck ? selectedPower : undefined,
      quantity,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full min-h-screen bg-[#FFFFFF] text-stone-900 px-4 pt-24 pb-6 sm:px-6 md:px-8 lg:px-12 sm:pt-28 max-w-[1600px] mx-auto"
      dir="rtl"
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* Column 1: Image & Highlight Specifications */}
        <div className="lg:w-1/2 flex flex-col space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square rounded-xl overflow-hidden bg-brand-beige">
            {/* Unified Dynamic Badge linked with main page */}
            {badgeContent && (
              <div className="absolute top-4 left-4 z-10 bg-brand-gold text-stone-900 text-xs font-semibold px-3 py-1 rounded-full tracking-wider uppercase shadow-2xs pointer-events-none">
                {badgeContent}
              </div>
            )}

            {!imgError && product.image ? (
              <img
                loading="lazy"
                src={product.image}
                alt={product.name}
                onError={() => setImgError(true)}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-stone-150 p-6 text-center">
                <span className="text-stone-700 font-bold text-base">
                  لينا للعدسات اللاصقة
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Order Options */}
        <div className="lg:w-1/2 flex flex-col space-y-6 bg-brand-cream/40 p-5 sm:p-6 lg:p-8 rounded-2xl border border-stone-200/50">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 mb-1.5 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-stone-900">
                {product.price} جنيه
              </span>
              {product.oldPrice && (
                <span className="text-sm text-stone-400 line-through">
                  {product.oldPrice} جنيه
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-stone-200/60 pt-5">
            <span className="text-xs sm:text-sm font-bold text-stone-900 block mb-2">
              الوصف والمزايا
            </span>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-700 whitespace-pre-line max-w-prose">
              {product.description}
            </p>
          </div>

          {lensCheck && (
            <div className="space-y-3 border-t border-stone-200/60 pt-5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-900">
                  قياس النظر المطلوب (SPH)
                </span>
                <span className="text-stone-500 font-medium text-[10px]">
                  للعدستين معاً
                </span>
              </div>
              <div className="relative">
                <Select
                  value={selectedPower}
                  onChange={(e) => setSelectedPower(e.target.value)}
                  className="w-full bg-brand-cream border-stone-200 text-stone-900 text-sm font-semibold rounded-lg px-4 py-3 pl-10 focus:ring-stone-900 focus:bg-white hover:border-stone-300"
                >
                  {POWERS.map((pow) => (
                    <option key={pow} value={pow}>
                      {pow}
                    </option>
                  ))}
                </Select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-600">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between gap-4 border-t border-stone-200/60 pt-5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-900">الكمية</span>
              <div className="flex items-center border border-stone-200 rounded-full bg-brand-cream p-1">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-stone-800 hover:bg-stone-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer focus:outline-none"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-xs text-stone-900 select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-stone-800 hover:bg-stone-200 transition-all cursor-pointer focus:outline-none"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-[10px] text-stone-500 font-medium">
              العلبة = زوج عدسات.
            </span>
          </div>

          {/* Checkout CTA */}
          <div className="border-t border-stone-200/60 pt-5 flex flex-row items-center justify-between gap-4">
            <div className="text-right shrink-0">
              <span className="text-[10px] text-stone-500 block mb-0.5">
                الإجمالي
              </span>
              <span className="text-lg sm:text-xl font-bold text-stone-900">
                {(product.price * quantity).toFixed(2)} جنيه
              </span>
            </div>

            <button
              onClick={handleAddToCartClick}
              className="flex-1 sm:max-w-[220px] bg-stone-900 hover:bg-black text-white py-3.5 px-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-sm outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 shadow-xs"
            >
              <ShoppingBag size={17} />
              <span>أضف للسلة</span>
            </button>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default ProductDetailPage;
