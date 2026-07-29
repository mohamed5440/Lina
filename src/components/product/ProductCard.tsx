import React, { useState, memo } from "react";
import { Product } from "../../types";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickAdd: (
    id: number,
    name: string,
    price: number,
    image: string,
    power?: string,
    qty?: number,
  ) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  onViewDetails,
  onQuickAdd,
}) => {
  const [imgError, setImgError] = useState(false);

  // Calculate discount percentage if oldPrice exists
  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const badgeContent =
    product.badgeText ||
    (discountPercent ? `وفر حتى ${discountPercent}%` : null) ||
    (product.isNew ? "جديد" : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group flex flex-col justify-between h-full bg-transparent border-none p-0 selection:bg-stone-200"
    >
      {/* Top Section: Rounded Image Container matching reference image */}
      <div className="flex flex-col flex-1">
        <div
          onClick={() => onViewDetails(product)}
          className="relative aspect-[3/4] w-full rounded-xl bg-brand-beige overflow-hidden cursor-pointer transition-transform duration-300"
        >
          {/* Top Left / Right Badge (Soft Pale Yellow Tag) */}
          {badgeContent && (
            <div className="absolute top-3 left-3 z-10 bg-brand-gold text-stone-900 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full tracking-wider uppercase shadow-2xs pointer-events-none">
              {badgeContent}
            </div>
          )}

          {/* Product Image */}
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-stone-150 p-4 text-center">
              <span className="text-xs font-bold text-stone-700 line-clamp-2 px-2">
                {product.name}
              </span>
            </div>
          )}

          {/* Floating Action Button (Plus Circle) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const isLens = product.category !== "solutions";
              const defaultPower = isLens ? "0.00 (تجميلي)" : undefined;
              onQuickAdd(
                product.id,
                product.name,
                product.price,
                product.image,
                defaultPower,
              );
            }}
            className="absolute bottom-3 right-3 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-900 hover:bg-black text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-900"
            title="إضافة سريعة للسلة"
            aria-label="إضافة سريعة للسلة"
          >
            <Plus size={20} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Text Section Below Image */}
        <div className="mt-3.5 sm:mt-4 space-y-1 text-right px-0.5">
          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-medium text-base sm:text-lg text-stone-900 hover:text-stone-600 transition-colors line-clamp-1 leading-snug cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Prices */}
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-base sm:text-lg font-medium text-stone-900">
              {product.price} جنيه
            </span>
            {product.oldPrice && (
              <span className="text-sm font-normal text-stone-400 line-through">
                {product.oldPrice} جنيه
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
