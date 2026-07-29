import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, ShoppingBag } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { NotificationItem, CartItem } from "../../types";

interface HeaderProps {
  setCurrentSlide: (index: number) => void;
  showToast: (msg: string) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  unreadNotificationsCount: number;
  notifications: NotificationItem[];
  handleMarkAsRead: (id: number) => void;
  handleMarkAllAsRead: () => void;
  setIsCartOpen: (open: boolean) => void;
  cartItems: CartItem[];
  setIsMenuOpen: (open: boolean) => void;
  forceSolidBg?: boolean;
  onLogoClick?: () => void;
  currentView?: "home" | "products";
  onViewChange?: (view: "home" | "products") => void;
}

const Header = memo(function Header({
  setCurrentSlide,
  showToast,
  isNotificationsOpen,
  setIsNotificationsOpen,
  unreadNotificationsCount,
  notifications,
  handleMarkAsRead,
  handleMarkAllAsRead,
  setIsCartOpen,
  cartItems,
  setIsMenuOpen,
  forceSolidBg = false,
  onLogoClick,
  currentView = "home",
  onViewChange,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    // Initialize scroll state
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSolid = scrolled || forceSolidBg;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          isSolid
            ? "py-2 sm:py-3.5 border-b border-stone-200/80 bg-white/95 backdrop-blur-md"
            : "pt-4 sm:pt-6 md:pt-6 lg:pt-8 pb-4"
        }`}
        style={{
          backgroundColor: isSolid
            ? "rgba(255, 255, 255, 0.95)"
            : "transparent",
          backgroundImage: isSolid
            ? "none"
            : "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 flex justify-between items-center">
          {/* Logo Right-Aligned for Arabic */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-start cursor-pointer group shrink-0"
            onClick={() => {
              setCurrentSlide(0);
              if (onLogoClick) {
                onLogoClick();
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              showToast("مرحباً بك في عالم لينا المستدام للعدسات 🌿");
            }}
          >
            <span
              className="font-black tracking-wide text-xl sm:text-2xl transition-all duration-300 group-hover:tracking-wider"
              style={{ color: isSolid ? "#000000" : "#FFFFFF" }}
            >
              لينا
            </span>
            <span
              className="text-[10px] sm:text-xs tracking-wider font-semibold uppercase mt-0.5 transition-colors duration-300 opacity-90 group-hover:opacity-100"
              style={{ color: isSolid ? "#1c1917" : "#F5F5F4" }}
            >
              عدسـات لاصقـة فاخـرة
            </span>
          </motion.div>

          {/* Centered Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold transition-all duration-300">
            <button
              onClick={() => {
                if (onViewChange) onViewChange("home");
              }}
              className={`pb-1 border-b-2 transition-all duration-300 cursor-pointer ${
                currentView === "home"
                  ? isSolid
                    ? "border-stone-900 text-stone-900 font-bold"
                    : "border-white text-white font-bold"
                  : isSolid
                    ? "border-transparent text-stone-500 hover:text-stone-900"
                    : "border-transparent text-white/70 hover:text-white"
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                if (onViewChange) onViewChange("products");
              }}
              className={`pb-1 border-b-2 transition-all duration-300 cursor-pointer ${
                currentView === "products"
                  ? isSolid
                    ? "border-stone-900 text-stone-900 font-bold"
                    : "border-white text-white font-bold"
                  : isSolid
                    ? "border-transparent text-stone-500 hover:text-stone-900"
                    : "border-transparent text-white/70 hover:text-white"
              }`}
            >
              المنتجات
            </button>
          </nav>

          {/* Luxury Utilities Left-Aligned */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
            {/* Notification Bell */}
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 relative focus:outline-none cursor-pointer group flex items-center justify-center ${
                  isSolid
                    ? "hover:bg-stone-100 text-stone-900"
                    : "hover:bg-white/15 text-white"
                }`}
                aria-label="الإشعارات"
              >
                <Bell className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] transition-transform duration-300 group-hover:scale-105" />
                {unreadNotificationsCount > 0 && (
                  <span
                    className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full border transition-all duration-300 animate-pulse"
                    style={{
                      backgroundColor: isSolid ? "#000000" : "#FFFFFF",
                      borderColor: isSolid ? "#FFFFFF" : "#000000",
                    }}
                  />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <NotificationDropdown
                    onClose={() => setIsNotificationsOpen(false)}
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Bag/Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 relative focus:outline-none cursor-pointer group flex items-center justify-center ${
                isSolid
                  ? "hover:bg-stone-100 text-stone-900"
                  : "hover:bg-white/15 text-white"
              }`}
              aria-label="حقيبة التسوق"
            >
              <ShoppingBag className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] transition-transform duration-300 group-hover:scale-105" />
              {cartItems.length > 0 && (
                <span
                  className="absolute top-0.5 left-0.5 font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all duration-300"
                  style={{
                    backgroundColor: isSolid ? "#000000" : "#FFFFFF",
                    color: isSolid ? "#FFFFFF" : "#000000",
                    borderColor: isSolid ? "#FFFFFF" : "#000000",
                  }}
                >
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Menu Toggle Button (Sleek 2 bars) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 relative focus:outline-none cursor-pointer group flex flex-col justify-center items-end gap-1.5 w-10 h-10 sm:w-11 sm:h-11 ${
                isSolid
                  ? "hover:bg-stone-100 text-stone-900"
                  : "hover:bg-white/15 text-white"
              }`}
              aria-label="القائمة"
            >
              <span className="w-5 h-0.5 bg-current transition-all duration-300" />
              <span className="w-3.5 h-0.5 bg-current transition-all duration-300" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
});

export default Header;
