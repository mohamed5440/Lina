import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { motion } from "motion/react";
import ProductCard from "./ProductCard";
import { Product, Category } from "../../types";
import { normalizeArabic } from "../../utils";
import { Input } from "../ui/ui";

interface ProductsSectionProps {
  filteredProducts: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  setSelectedProductForDetail: (product: Product | null) => void;
  handleAddToCart: (
    id: number,
    name: string,
    price: number,
    image: string,
    power?: string,
    qty?: number,
  ) => void;
  categories: Category[];
  isLoading?: boolean;
}

export default function ProductsSection({
  filteredProducts,
  selectedCategory,
  setSelectedCategory,
  setSelectedProductForDetail,
  handleAddToCart,
  categories,
  isLoading = false,
}: ProductsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = normalizeArabic(searchQuery);

  // Filter local displayed list based on Arabic Normalized query
  const displayedProducts = useMemo(() => {
    return filteredProducts.filter((product) => {
      if (!normalizedQuery) return true;
      const categoryName =
        categories.find((c) => c.id === product.category)?.name || "";
      return (
        normalizeArabic(product.name || "").includes(normalizedQuery) ||
        normalizeArabic(product.description || "").includes(normalizedQuery) ||
        normalizeArabic(categoryName).includes(normalizedQuery) ||
        normalizeArabic(String(product.price || "")).includes(normalizedQuery)
      );
    });
  }, [filteredProducts, normalizedQuery, categories]);

  return (
    <section
      id="products-section"
      className="relative z-10 w-full bg-[#FFFFFF] px-4 sm:px-6 py-4 sm:py-6 md:px-8 md:py-8 lg:px-12 lg:py-10"
    >
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        {/* Section Heading */}
        <div className="flex flex-col gap-1.5 text-right">
          <div className="flex items-center gap-1.5 justify-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-900" />
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-stone-500 font-bold">
              تـشـكـيـلـتـنـا الـمـمـيـزة
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-snug text-stone-900">
            أفضل المنتجات العالمية
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-normal max-w-lg">
            اكتشفي الأناقة والجاذبية مع تشكيلة عدساتنا اللاصقة والملونة الأكثر
            مبيعاً
          </p>
        </div>
        {/* Search Bar & Filtering tabs Row */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-1 pb-4 border-b border-stone-100">
          <div
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap justify-start w-full scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[{ id: "all", name: "جميع المنتجات" }, ...categories].map(
              (tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedCategory(tab.id);
                    }}
                    className={`relative px-4 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer focus:outline-none ${
                      isActive
                        ? "text-stone-900 font-bold"
                        : "text-stone-500 hover:text-stone-800 font-medium"
                    }`}
                  >
                    <span>{tab.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryUnderline"
                        className="absolute bottom-0 right-0 left-0 h-[3px] bg-stone-900 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 32,
                        }}
                      />
                    )}
                  </button>
                );
              },
            )}
          </div>

          {/* Elegant Product Search Input */}
          <div className="relative w-full md:w-80 shrink-0 mt-2 md:mt-0">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="ابحث عن عدسة، لون، أو اسم المنتج..."
              className="bg-brand-cream border-stone-200 focus:border-stone-900 focus:bg-white pr-9 pl-8 rounded-lg text-right"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-500">
              <Search size={15} />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 left-3 flex items-center text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-5 lg:gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex flex-col justify-between">
                <div>
                  <div className="relative aspect-square bg-stone-100/80 animate-pulse rounded-lg" />
                  <div className="pt-3 space-y-2">
                    <div className="h-4 bg-stone-100 animate-pulse rounded-md w-3/4" />
                    <div className="h-4 bg-stone-100 animate-pulse rounded-md w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-lg border border-stone-200 col-span-full">
            <p className="text-stone-800 text-sm font-bold">
              لا توجد منتجات تطابق البحث حالياً
            </p>
            <p className="text-stone-500 text-xs mt-1">
              يرجى تجربة كلمات بحث أخرى أو تصفح باقي الأقسام المتوفرة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-5 lg:gap-8">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(p) => setSelectedProductForDetail(p)}
                onQuickAdd={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
