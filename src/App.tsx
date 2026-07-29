import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, ArrowRight } from "lucide-react";
import WhatsAppIcon from "./components/ui/WhatsAppIcon";
import {
  CartItem,
  NotificationItem,
  Product,
  Category,
  ShippingRate,
  ContactInfo,
  Order,
  Slide,
} from "./types";
import SidebarMenu from "./components/layout/SidebarMenu";
import CartDrawer from "./components/cart/CartDrawer";
import ProductsSection from "./components/product/ProductsSection";
import CheckoutSuccessModal from "./components/cart/CheckoutSuccessModal";
import Header from "./components/layout/Header";
import ProductDetailPage from "./components/product/ProductDetailPage";
import Footer from "./components/layout/Footer";
import LoginModal from "./components/admin/LoginModal";

const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));

import { trackEvent } from "./utils";

import {
  PRODUCTS,
  SLIDES,
  INITIAL_CART,
  INITIAL_NOTIFICATIONS,
  DEFAULT_SHIPPING_RATES,
  DEFAULT_CONTACT_INFO,
  DEFAULT_CATEGORIES,
} from "./data";

export default function App() {
  const [slides, setSlides] = useState<Slide[]>(SLIDES);
  const [contactInfo, setContactInfo] =
    useState<ContactInfo>(DEFAULT_CONTACT_INFO);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>(
    DEFAULT_SHIPPING_RATES,
  );
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [currentView, setCurrentView] = useState<"home" | "products">("home");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS,
  );

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("lina_admin_logged_in") === "true";
  });
  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem("lina_admin_token") || "";
  });

  const loadAdminData = async (token: string) => {
    if (!token) return;
    try {
      const notifsRes = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (notifsRes.ok) {
        const notifsData = await notifsRes.json();
        if (Array.isArray(notifsData)) {
          setNotifications(notifsData);
        }
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }

    try {
      const ordersRes = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        }
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  // Load initial data from Hostinger MySQL API
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingProducts(true);
      try {
        // Run all API requests in parallel for maximum speed and performance!
        const [slidesRes, catRes, prodRes, ratesRes, contactRes] =
          await Promise.all([
            fetch("/api/slides").catch(() => null),
            fetch("/api/categories").catch(() => null),
            fetch("/api/products").catch(() => null),
            fetch("/api/shipping-rates").catch(() => null),
            fetch("/api/contact-info").catch(() => null),
          ]);

        if (slidesRes && slidesRes.ok) {
          const slidesData = await slidesRes.json().catch(() => null);
          if (Array.isArray(slidesData) && slidesData.length > 0) {
            setSlides(slidesData);
          }
        }

        if (catRes && catRes.ok) {
          const catData = await catRes.json().catch(() => null);
          if (Array.isArray(catData)) {
            setCategories(catData);
          }
        }

        if (prodRes && prodRes.ok) {
          const prodData = await prodRes.json().catch(() => null);
          if (Array.isArray(prodData)) {
            setProducts(prodData);
          }
        }

        if (ratesRes && ratesRes.ok) {
          const ratesData = await ratesRes.json().catch(() => null);
          if (Array.isArray(ratesData)) {
            setShippingRates(ratesData);
          }
        }

        if (contactRes && contactRes.ok) {
          const contactData = await contactRes.json().catch(() => null);
          if (contactData && contactData.whatsapp) {
            setContactInfo(contactData);
          }
        }
      } catch (err) {
        console.error("Error loading data from database:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadData();
    const token = sessionStorage.getItem("lina_admin_token") || "";
    const loggedIn = sessionStorage.getItem("lina_admin_logged_in") === "true";
    if (loggedIn && token) {
      loadAdminData(token);
    }
  }, []);

  const handleUpdateProducts = async (newProducts: Product[]) => {
    const deleted = products.filter(
      (p) => !newProducts.some((np) => np.id === p.id),
    );
    const deletePromises = deleted.map((dp) =>
      fetch(`/api/products/${dp.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch((e) => console.error("Error deleting product from database:", e))
    );

    const updatePromises = newProducts
      .filter((np) => {
        const old = products.find((p) => p.id === np.id);
        return !old || JSON.stringify(old) !== JSON.stringify(np);
      })
      .map((np) =>
        fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(np),
        }).catch((e) => console.error("Error writing product to database:", e))
      );

    await Promise.all([...deletePromises, ...updatePromises]);
    setProducts(newProducts);
  };

  const handleUpdateCategories = async (newCategories: Category[]) => {
    const deleted = categories.filter(
      (c) => !newCategories.some((nc) => nc.id === c.id),
    );
    const deletePromises = deleted.map((dc) =>
      fetch(`/api/categories/${dc.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch((e) => console.error("Error deleting category from database:", e))
    );

    const updatePromises = newCategories
      .filter((nc) => {
        const old = categories.find((c) => c.id === nc.id);
        return !old || JSON.stringify(old) !== JSON.stringify(nc);
      })
      .map((nc) =>
        fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(nc),
        }).catch((e) => console.error("Error writing category to database:", e))
      );

    await Promise.all([...deletePromises, ...updatePromises]);
    setCategories(newCategories);
  };

  const handleUpdateShippingRates = async (newRates: ShippingRate[]) => {
    const deleted = shippingRates.filter(
      (r) => !newRates.some((nr) => nr.governorate === r.governorate),
    );
    const deletePromises = deleted.map((dr) =>
      fetch(
        `/api/shipping-rates/${encodeURIComponent(dr.governorate)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      ).catch((e) => console.error("Error deleting shipping rate", e))
    );

    const updatePromises = newRates
      .filter((nr) => {
        const old = shippingRates.find((r) => r.governorate === nr.governorate);
        return !old || old.price !== nr.price;
      })
      .map((nr) =>
        fetch("/api/shipping-rates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(nr),
        }).catch((e) => console.error("Error updating shipping rate:", e))
      );

    await Promise.all([...deletePromises, ...updatePromises]);
    setShippingRates(newRates);
  };

  const handleUpdateContactInfo = async (newInfo: ContactInfo) => {
    try {
      await fetch("/api/contact-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newInfo),
      });
    } catch (e) {
      console.error(e);
    }
    setContactInfo(newInfo);
  };

  const handleUpdateNotifications = async (
    newNotifications: NotificationItem[],
  ) => {
    const deleted = notifications.filter(
      (n) => !newNotifications.some((nn) => nn.id === n.id),
    );
    for (const dn of deleted) {
      try {
        await fetch(`/api/notifications/${dn.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch (e) {
        console.error("Error deleting notification", e);
      }
    }

    const updatedWithServerIds = [...newNotifications];
    for (let i = 0; i < updatedWithServerIds.length; i++) {
      const nn = updatedWithServerIds[i];
      const old = notifications.find((n) => n.id === nn.id);
      if (!old) {
        try {
          const res = await fetch("/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify(nn),
          });
          const data = await res.json();
          if (data && data.success && data.id) {
            updatedWithServerIds[i] = { ...nn, id: data.id };
          }
        } catch (e) {
          console.error(e);
        }
      } else if (
        old.text !== nn.text ||
        old.time !== nn.time ||
        old.unread !== nn.unread
      ) {
        try {
          await fetch(`/api/notifications/${nn.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify(nn),
          });
        } catch (e) {
          console.error("Error updating notification:", e);
        }
      }
    }
    setNotifications(updatedWithServerIds);
  };

  const handleUpdateOrders = async (newOrders: Order[]) => {
    const updatePromises = newOrders
      .filter((no) => {
        const old = orders.find((o) => o.id === no.id);
        return old && old.status !== no.status;
      })
      .map((no) =>
        fetch(`/api/orders/${no.id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: no.status }),
        }).catch((e) => console.error("Error updating order status:", e))
      );

    await Promise.all(updatePromises);
    setOrders(newOrders);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (e) {
      console.error("Error deleting order:", e);
    }
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Admin & Dashboard States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Access login or dashboard via secret URL parameter/link (e.g., ?admin=1, ?login=1, #admin, /admin)
  useEffect(() => {
    const checkSecretAdminAccess = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      const isSecretAdminUrl =
        params.get("admin") === "1" ||
        params.get("admin") === "true" ||
        params.get("login") === "1" ||
        params.get("admin_login") === "1" ||
        hash === "#admin" ||
        hash === "#login" ||
        pathname.endsWith("/admin") ||
        pathname.endsWith("/login");

      if (isSecretAdminUrl) {
        const loggedIn = sessionStorage.getItem("lina_admin_logged_in") === "true";
        if (loggedIn) {
          setIsDashboardOpen(true);
        } else {
          setIsLoginOpen(true);
        }
      }
    };

    checkSecretAdminAccess();
    window.addEventListener("popstate", checkSecretAdminAccess);
    window.addEventListener("hashchange", checkSecretAdminAccess);
    return () => {
      window.removeEventListener("popstate", checkSecretAdminAccess);
      window.removeEventListener("hashchange", checkSecretAdminAccess);
    };
  }, []);

  const handleLoginSuccess = (token: string) => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem("lina_admin_logged_in", "true");
    sessionStorage.setItem("lina_admin_token", token || "");
    setAdminToken(token || "");
    setIsDashboardOpen(true);
    if (token) {
      loadAdminData(token);
    }
  };

  const handleLogout = () => {
    if (adminToken) {
      fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
    }
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("lina_admin_logged_in");
    sessionStorage.removeItem("lina_admin_token");
    setAdminToken("");
    setIsDashboardOpen(false);
  };

  // Filter Category State for Products
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Overlays / Modals States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] =
    useState<Product | null>(null);

  // Scroll to top when product detail page is opened and track ViewContent with Meta Pixel
  useEffect(() => {
    if (selectedProductForDetail) {
      window.scrollTo(0, 0);
      trackEvent("ViewContent", {
        contentIds: [String(selectedProductForDetail.id)],
        contentName: selectedProductForDetail.name,
        contentType: "product",
        value: selectedProductForDetail.price,
        currency: "EGP",
        contents: [
          {
            id: String(selectedProductForDetail.id),
            quantity: 1,
            item_price: selectedProductForDetail.price,
          },
        ],
      });
    }
  }, [selectedProductForDetail]);

  // Business Data States
  const activeSlide = slides[currentSlide] || SLIDES[0] || null;

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const local = localStorage.getItem("lina_cart_items");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        /* ignore */
      }
    }
    return INITIAL_CART;
  });

  useEffect(() => {
    localStorage.setItem("lina_cart_items", JSON.stringify(cartItems));
  }, [cartItems]);

  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{
    name: string;
    phone: string;
    governorate: string;
    address: string;
    paymentMethod: string;
  } | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  // Interactive Toast state
  // Show a beautifully animated toast (Disabled as requested to remove bottom notifications)
  const showToast = useCallback((_message: string) => {
    void _message;
    // Disabled bottom notifications
  }, []);

  // Slideshow Auto-rotate interval
  useEffect(() => {
    if (!isPlaying) return;

    // Check if any overlay is open, if so, freeze the carousel
    const anyOverlayOpen =
      isMenuOpen ||
      isCartOpen ||
      isNotificationsOpen ||
      selectedProductForDetail !== null ||
      checkoutSuccess;
    if (anyOverlayOpen) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        slides.length > 0 ? (prev + 1) % slides.length : 0,
      );
    }, 5500);

    return () => clearInterval(timer);
  }, [
    isPlaying,
    isMenuOpen,
    isCartOpen,
    isNotificationsOpen,
    selectedProductForDetail,
    checkoutSuccess,
    slides.length,
  ]);

  // Cart Management
  const handleAddToCart = (
    id: number,
    name: string,
    price: number,
    image: string,
    power?: string,
    qty: number = 1,
  ) => {
    setCartItems((prev) => {
      // Create a unique key using product ID and power combined to allow different prescription options of same product in cart
      const existingIndex = prev.findIndex(
        (item) => item.id === id && item.power === power,
      );
      if (existingIndex > -1) {
        showToast(`تم زيادة كمية ${name} في حقيبتك`);
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      } else {
        showToast(`تم إضافة ${name} إلى حقيبة التسوق`);
        return [...prev, { id, name, price, quantity: qty, image, power }];
      }
    });

    // Track AddToCart with unified trackEvent helper (Pixel & Conversions API proxy)
    trackEvent("AddToCart", {
      contentIds: [String(id)],
      contentName: name,
      contentType: "product",
      value: price * qty,
      currency: "EGP",
      contents: [{ id: String(id), quantity: qty, item_price: price }],
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (
    id: number,
    power: string | undefined,
    delta: number,
  ) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.power === power) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      }),
    );
  };

  const handleRemoveItem = (id: number, power: string | undefined) => {
    const item = cartItems.find((i) => i.id === id && i.power === power);
    if (item) {
      showToast(`تم حذف ${item.name} من حقيبتك`);
    }
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.power === power)),
    );
  };

  const handleCheckout = async (customerData: {
    name: string;
    phone: string;
    governorate: string;
    address: string;
    paymentMethod: string;
    shippingFee: number;
    totalWithShipping: number;
  }) => {
    const newOrder: Order = {
      id: "LI-" + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split("T")[0],
      customerName: customerData.name,
      phone: customerData.phone,
      governorate: customerData.governorate,
      address: customerData.address,
      paymentMethod: customerData.paymentMethod,
      items: cartItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        power: item.power,
      })),
      shippingFee: customerData.shippingFee,
      total: customerData.totalWithShipping,
      status: "pending",
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      // Track Purchase with Meta Pixel
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Purchase", {
          value: customerData.totalWithShipping,
          currency: "EGP",
          content_type: "product",
          content_ids: cartItems.map((item) => String(item.id)),
          contents: cartItems.map((item) => ({
            id: String(item.id),
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
      }

      setCustomerInfo(customerData);
      setOrderTotal(customerData.totalWithShipping);
      setOrders((prev) => [newOrder, ...prev]);
      setCartItems([]);
      setCheckoutSuccess(true);
      setIsCartOpen(false);
    } catch (e) {
      console.error("Error creating order on server", e);
      alert("حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى.");
    }
  };

  // Notification Management
  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("تم تحديد جميع الإشعارات كمقروءة");
  };

  // Preload slide images for instant smooth hero transitions
  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image();
        img.src = slide.image;
      }
    });
  }, [slides]);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  // Filter Products list based on selected tab
  const filteredProducts = useMemo(() => {
    return selectedCategory === "all" ||
      !categories.some((c) => c.id === selectedCategory)
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, categories, products]);

  // Smooth scroll & view change helper for products
  const scrollToProducts = () => {
    setSelectedProductForDetail(null);
    setCurrentView("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Ensure top scroll whenever current view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentView]);

  return (
    <div
      className="relative w-full min-h-[100dvh] bg-[#FFFFFF] text-stone-900 select-none overflow-x-hidden"
      dir="rtl"
    >
      <Header
        setCurrentSlide={setCurrentSlide}
        showToast={showToast}
        isNotificationsOpen={isNotificationsOpen}
        setIsNotificationsOpen={setIsNotificationsOpen}
        unreadNotificationsCount={unreadNotificationsCount}
        notifications={notifications}
        handleMarkAsRead={handleMarkAsRead}
        handleMarkAllAsRead={handleMarkAllAsRead}
        setIsCartOpen={setIsCartOpen}
        cartItems={cartItems}
        setIsMenuOpen={setIsMenuOpen}
        forceSolidBg={!!selectedProductForDetail || currentView === "products"}
        onLogoClick={() => {
          setSelectedProductForDetail(null);
          setCurrentView("home");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentView={currentView}
        onViewChange={(v) => {
          setSelectedProductForDetail(null);
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {!selectedProductForDetail ? (
        <>
          {/* 1. FIRST FOLD: HERO SLIDESHOW (Flexible min-h-screen on mobile, fixed h-screen on desktop) */}
          {currentView === "home" && activeSlide && (
            <div className="relative w-full min-h-[100dvh] md:h-[100dvh] overflow-hidden flex flex-col justify-between bg-black">
              {/* Background Slideshow with crossfade */}
              <div className="absolute inset-0 z-0 bg-black">
                <AnimatePresence>
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${activeSlide.image})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    {/* Ambient gradients for text visibility and high-end photographic mood */}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Hero UI Overlay - Content framed beautifully */}
              <div className="relative z-10 w-full max-w-[1600px] mx-auto flex-1 flex flex-col justify-between px-4 pt-20 pb-0 sm:px-6 sm:pt-24 sm:pb-0 md:px-8 md:pt-28 md:pb-0 lg:px-12 lg:pt-32 lg:pb-0">
                {/* MIDDLE CONTENT: Large Typography & Narrative (Aligned Right for RTL) */}
                <main className="flex-1 flex flex-col justify-center max-w-2xl text-white md:pr-12 lg:pr-16 pb-10 sm:pb-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="space-y-6 sm:space-y-8 md:space-y-10 mt-8 sm:mt-12 md:mt-0"
                    >
                      {/* Category Micro-tag */}
                      {/* Big Headline */}
                      <h1 className="text-4xl min-[375px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] md:leading-[1.15] text-white">
                        <span className="block mb-2">{activeSlide.title1}</span>
                        <span className="relative inline-block pb-3 sm:pb-4">
                          {activeSlide.title2}

                          {/* Animating Hand-Drawn SVG Underline */}
                          <svg
                            className="absolute -bottom-1 sm:-bottom-2 right-0 w-full h-[10px] sm:h-[12px] opacity-90 pointer-events-none"
                            viewBox="0 0 100 10"
                            preserveAspectRatio="none"
                          >
                            <motion.path
                              d="M 0 5 Q 50 8 100 5"
                              fill="none"
                              stroke="#fff"
                              strokeWidth="3"
                              strokeLinecap="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{
                                duration: 0.5,
                                delay: 0.15,
                                ease: "easeInOut",
                              }}
                            />
                          </svg>
                        </span>
                      </h1>

                      {/* Sub-headline */}
                      <p className="text-xs sm:text-base text-white leading-relaxed max-w-lg font-medium">
                        {activeSlide.subtitle}
                      </p>

                      {/* Action Buttons */}
                      <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={scrollToProducts}
                          className="w-full sm:w-auto bg-[#FFFFFF] text-stone-950 font-semibold text-sm md:text-base px-6 py-4 md:px-8 md:py-4.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                        >
                          <span>تسوق العدسات الآن</span>
                          <ArrowRight size={18} />
                        </motion.button>

                        <motion.a
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={`https://wa.me/${contactInfo.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto bg-[#FFFFFF]/10 backdrop-blur-md border border-white/20 hover:bg-[#FFFFFF]/20 text-white font-semibold text-sm md:text-base px-6 py-4 md:px-8 md:py-4.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                        >
                          <span>تواصل معنا عبر واتساب</span>
                          <WhatsAppIcon size={24} className="text-white shrink-0" />
                        </motion.a>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </main>

                {/* BOTTOM UTILITIES: Carousel Indicator Dots */}
                <footer className="flex justify-center items-center w-full py-6 md:py-8 border-t border-white/15 mt-auto">
                  {/* Carousel Navigation (Dots + Playback) */}
                  <div className="flex items-center gap-4 md:gap-6">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => {
                        setIsPlaying(!isPlaying);
                        showToast(
                          isPlaying
                            ? "تم إيقاف التدوير التلقائي مؤقتاً"
                            : "تم استئناف التدوير التلقائي",
                        );
                      }}
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-stone-300 transition-colors focus:outline-none cursor-pointer p-0"
                      aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    {/* Indicators Dots */}
                    <div className="flex gap-2.5 items-center h-8">
                      {slides.map((slide, idx) => {
                        const isActive = idx === currentSlide;
                        return (
                          <button
                            key={slide.id}
                            onClick={() => {
                              setCurrentSlide(idx);
                              showToast(`عرض الشريحة ${idx + 1}`);
                            }}
                            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                              isActive
                                ? "bg-[#FFFFFF] w-6"
                                : "bg-[#FFFFFF]/30 hover:bg-[#FFFFFF]/50 w-2"
                            }`}
                            aria-label={`الشريحة ${idx + 1}`}
                          ></button>
                        );
                      })}
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          )}

          {/* 2. SECOND FOLD: LUXURY PRODUCTS GRID (E-Commerce section) */}
          <div
            className={
              currentView === "products" ? "pt-16 sm:pt-20" : ""
            }
          >
            <ProductsSection
              filteredProducts={filteredProducts}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setSelectedProductForDetail={setSelectedProductForDetail}
              handleAddToCart={handleAddToCart}
              categories={categories}
              isLoading={isLoadingProducts}
            />
          </div>
        </>
      ) : (
        <ProductDetailPage
          product={selectedProductForDetail}
          onAddToCart={handleAddToCart}
        />
      )}
      {/* FOOTER */}
      <Footer
        contactInfo={contactInfo}
        categories={categories}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedProductForDetail(null);
          setCurrentView("products");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onResetView={() => {
          setSelectedProductForDetail(null);
          setCurrentView("home");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* 3. DRAWERS, OVERLAYS & MODALS */}

      {/* Sidebar Navigation Menu */}
      <SidebarMenu
        categories={categories}
        isOpen={isMenuOpen}
        onOpenLogin={() => {
          if (isAdminLoggedIn) {
            setIsDashboardOpen(true);
          } else {
            setIsLoginOpen(true);
          }
        }}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedProductForDetail(null);
        }}
        selectedCategory={selectedCategory}
        onClose={() => setIsMenuOpen(false)}
        contactInfo={contactInfo}
        onViewChange={(v) => {
          setSelectedProductForDetail(null);
          setCurrentView(v);
        }}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        shippingRates={shippingRates}
        onClose={() => setIsCartOpen(false)}
      />

      {/* CHECKOUT SUCCESS FULLSCREEN MODAL */}
      <CheckoutSuccessModal
        isOpen={checkoutSuccess}
        onClose={() => {
          setCheckoutSuccess(false);
          setCustomerInfo(null);
          setOrderTotal(0);
        }}
        customerInfo={customerInfo || undefined}
        totalAmount={orderTotal}
      />

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={isLoginOpen}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* ADMIN DASHBOARD */}
      <Suspense fallback={null}>
        <AdminDashboard
          onClose={() => setIsDashboardOpen(false)}
          isOpen={isDashboardOpen}
          onLogout={handleLogout}
          onUpdateProducts={handleUpdateProducts}
          orders={orders}
          onUpdateOrders={handleUpdateOrders}
          onDeleteOrder={handleDeleteOrder}
          onUpdateCategories={handleUpdateCategories}
          shippingRates={shippingRates}
          onUpdateShippingRates={handleUpdateShippingRates}
          products={products}
          categories={categories}
          contactInfo={contactInfo}
          onUpdateContactInfo={handleUpdateContactInfo}
          notifications={notifications}
          onUpdateNotifications={handleUpdateNotifications}
        />
      </Suspense>
    </div>
  );
}
