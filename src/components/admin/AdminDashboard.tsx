import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Modal, { ConfirmDeleteModal } from "../ui/Modal";
import { Input, Select, Textarea } from "../ui/ui";
import {
  X,
  ShoppingBag,
  Package,
  Plus,
  Edit,
  Trash,
  Check,
  LogOut,
  MapPin,
  CreditCard,
  Phone,
  User,
  Calendar,
  Tag,
  AlertCircle,
  UploadCloud,
  Lock,
  Copy,
} from "lucide-react";
import WhatsAppIcon from "../ui/WhatsAppIcon";
import {
  Product,
  Category,
  ShippingRate,
  ContactInfo,
  NotificationItem,
  Order,
} from "../../types";
import { EGYPT_GOVERNORATES } from "../../data";
import { normalizeArabic } from "../../utils";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  products: Product[];
  onUpdateProducts: (newProducts: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (newOrders: Order[]) => void;
  onDeleteOrder: (id: string) => void;
  categories: Category[];
  onUpdateCategories: (newCategories: Category[]) => void;
  shippingRates: ShippingRate[];
  onUpdateShippingRates: (rates: ShippingRate[]) => void;
  contactInfo: ContactInfo;
  onUpdateContactInfo: (info: ContactInfo) => void;
  notifications: NotificationItem[];
  onUpdateNotifications: (items: NotificationItem[]) => void;
}

export default function AdminDashboard({
  isOpen,
  onClose,
  onLogout,
  products,
  onUpdateProducts,
  orders,
  onUpdateOrders,
  onDeleteOrder,
  categories,
  onUpdateCategories,
  shippingRates = [],
  onUpdateShippingRates,
  contactInfo,
  onUpdateContactInfo,
  notifications = [],
  onUpdateNotifications,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    | "orders"
    | "products"
    | "categories"
    | "shipping"
    | "contact"
    | "notifications_manage"
    | "security"
  >("orders");

  // Admin Password Change States
  const [adminCurrentPassword, setAdminCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [isChangingAdminPassword, setIsChangingAdminPassword] = useState(false);
  const [adminPasswordResult, setAdminPasswordResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [contactWhatsapp, setContactWhatsapp] = useState(
    contactInfo?.whatsapp || "",
  );
  const [contactPhone, setContactPhone] = useState(contactInfo?.phone || "");
  const [contactEmail, setContactEmail] = useState(contactInfo?.email || "");
  const [contactInstagram, setContactInstagram] = useState(
    contactInfo?.instagram || "",
  );
  const [contactFacebook, setContactFacebook] = useState(
    contactInfo?.facebook || "",
  );
  const [dashboardSuccessMessage, setDashboardSuccessMessage] = useState<
    string | null
  >(null);
  const [dashboardErrorMessage, setDashboardErrorMessage] = useState<
    string | null
  >(null);
  const [isAddNotificationOpen, setIsAddNotificationOpen] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<NotificationItem | null>(null);
  const [notifText, setNotifText] = useState("");
  const [notifTime, setNotifTime] = useState("");
  const [notifUnread, setNotifUnread] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  React.useEffect(() => {
    if (contactInfo) {
      setContactWhatsapp(contactInfo.whatsapp || "");
      setContactPhone(contactInfo.phone || "");
      setContactEmail(contactInfo.email || "");
      setContactInstagram(contactInfo.instagram || "");
      setContactFacebook(contactInfo.facebook || "");
    }
  }, [contactInfo]);

  // Filtered lists for search capabilities with Arabic Normalization support
  const filteredOrders = orders.filter((order) => {
    const query = normalizeArabic(searchQuery);
    if (!query) return true;

    const idMatch = normalizeArabic(String(order.id || "")).includes(query);
    const nameMatch = normalizeArabic(
      String(order.customerName || ""),
    ).includes(query);
    const phoneMatch = normalizeArabic(String(order.phone || "")).includes(
      query,
    );
    const govMatch = normalizeArabic(String(order.governorate || "")).includes(
      query,
    );
    const addressMatch = normalizeArabic(String(order.address || "")).includes(
      query,
    );
    const dateMatch = normalizeArabic(String(order.date || "")).includes(query);

    // Map English status codes to Arabic labels as shown in UI
    const statusLabel =
      order.status === "pending"
        ? "جديد معلق"
        : order.status === "preparing"
          ? "جاري التجهيز"
          : order.status === "shipped"
            ? "تم الشحن"
            : order.status === "completed"
              ? "مكتمل"
              : order.status === "cancelled"
                ? "ملغي مسترجع"
                : "";
    const statusMatch =
      normalizeArabic(statusLabel).includes(query) ||
      normalizeArabic(String(order.status || "")).includes(query);

    // Map English payment methods to Arabic labels as shown in UI
    const paymentLabel =
      order.paymentMethod === "cod"
        ? "الدفع عند الاستلام كاش"
        : order.paymentMethod === "vodafone"
          ? "فودافون كاش"
          : order.paymentMethod === "card"
            ? "بطاقة بنكية فيزا ماستر كارد"
            : "";
    const paymentMatch =
      normalizeArabic(paymentLabel).includes(query) ||
      normalizeArabic(String(order.paymentMethod || "")).includes(query);

    const itemsMatch =
      order.items?.some((item) =>
        normalizeArabic(String(item.name || "")).includes(query),
      ) || false;

    const totalMatch = normalizeArabic(String(order.total || "")).includes(
      query,
    );

    return (
      idMatch ||
      nameMatch ||
      phoneMatch ||
      govMatch ||
      addressMatch ||
      dateMatch ||
      statusMatch ||
      paymentMatch ||
      itemsMatch ||
      totalMatch
    );
  });

  const filteredProductsList = products.filter((product) => {
    const query = normalizeArabic(searchQuery);
    if (!query) return true;
    const categoryName =
      categories.find((c) => c.id === product.category)?.name || "";
    return (
      normalizeArabic(String(product.name || "")).includes(query) ||
      normalizeArabic(String(product.description || "")).includes(query) ||
      normalizeArabic(categoryName).includes(query) ||
      normalizeArabic(String(product.price || "")).includes(query) ||
      normalizeArabic(String(product.id || "")).includes(query)
    );
  });

  const filteredCategoriesList = categories.filter((category) => {
    const query = normalizeArabic(searchQuery);
    if (!query) return true;
    return (
      normalizeArabic(String(category.name || "")).includes(query) ||
      normalizeArabic(String(category.description || "")).includes(query) ||
      normalizeArabic(String(category.id || "")).includes(query)
    );
  });

  const filteredShippingRatesList = shippingRates.filter((rate) => {
    const query = normalizeArabic(searchQuery);
    if (!query) return true;
    return (
      normalizeArabic(String(rate.governorate || "")).includes(query) ||
      normalizeArabic(String(rate.price || "")).includes(query)
    );
  });

  const filteredNotificationsList = notifications.filter((notif) => {
    const query = normalizeArabic(searchQuery);
    if (!query) return true;
    return (
      normalizeArabic(String(notif.text || "")).includes(query) ||
      normalizeArabic(String(notif.time || "")).includes(query)
    );
  });

  // Notification handlers
  const handleSaveNewNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotif: NotificationItem = {
      id: Date.now(),
      text: notifText,
      time: notifTime,
      unread: notifUnread,
    };
    onUpdateNotifications([newNotif, ...notifications]);
    setIsAddNotificationOpen(false);
    setNotifText("");
    setNotifTime("");
    setDashboardSuccessMessage("تم إنشاء الإشعار ونشره بنجاح! 🔔");
    setTimeout(() => setDashboardSuccessMessage(null), 4000);
  };

  const handleSaveEditNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification) return;
    const updated = notifications.map((n) =>
      n.id === editingNotification.id
        ? { ...n, text: notifText, time: notifTime, unread: notifUnread }
        : n,
    );
    onUpdateNotifications(updated);
    setIsAddNotificationOpen(false);
    setEditingNotification(null);
    setNotifText("");
    setNotifTime("");
    setDashboardSuccessMessage("تم تعديل الإشعار وتحديثه بنجاح! 🔔");
    setTimeout(() => setDashboardSuccessMessage(null), 4000);
  };

  const handleDeleteNotification = (id: number) => {
    const updated = notifications.filter((n) => n.id !== id);
    onUpdateNotifications(updated);
    setDashboardSuccessMessage("تم حذف الإشعار بنجاح! 🗑️");
    setTimeout(() => setDashboardSuccessMessage(null), 4000);
  };

  // Shipping rates administration states
  const [isAddShippingOpen, setIsAddShippingOpen] = useState(false);
  const [editingShipping, setEditingShipping] = useState<ShippingRate | null>(
    null,
  );
  const [shippingGov, setShippingGov] = useState("");
  const [shippingPrice, setShippingPrice] = useState<number>(50);
  const [customGov, setCustomGov] = useState("");

  // State for Add/Edit Product form
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState(100);
  const [formCategory, setFormCategory] = useState<string>(
    categories[0]?.id || "colored",
  );
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleImageFileChange = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP, GIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("حجم الصورة يجب ألا يتجاوز 10 ميجابايت");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileData = reader.result as string;
        try {
          const token =
            sessionStorage.getItem("lina_admin_token") || "admin_session_token";
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileData,
              fileName: file.name,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.url) {
              setFormImage(data.url);
              setUploadError("");
              setIsUploading(false);
              return;
            }
          }

          // Fallback to Base64 data URL if server endpoint returns error
          if (fileData) {
            setFormImage(fileData);
            setUploadError("");
          } else {
            throw new Error("فشل تجهيز الصورة");
          }
        } catch {
          // On network error or server disconnect, fall back gracefully to Base64
          if (fileData) {
            setFormImage(fileData);
            setUploadError("");
          } else {
            setUploadError("حدث خطأ أثناء قراءة الصورة");
          }
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadError("فشل قراءة ملف الصورة");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch {
      setUploadError("حدث خطأ غير متوقع أثناء الرفع");
      setIsUploading(false);
    }
  };
  // Categories administration states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [adminWarning, setAdminWarning] = useState<string | null>(null);

  // Form states for Category
  const [catId, setCatId] = useState("");
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  const handleStartAddCategory = () => {
    setCatId("");
    setCatName("");
    setCatDesc("");

    setIsAddCategoryOpen(true);
  };

  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const id = catId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!id) {
      setAdminWarning(
        "اسم المعرف بالإنجليزية غير صالح. يرجى استخدام أحرف وأرقام إنجليزية ومواصلات فقط (-).",
      );
      return;
    }

    // Check if ID already exists
    if (categories.some((c) => c.id === id)) {
      setAdminWarning(
        "معرف التصنيف هذا موجود بالفعل، يرجى كتابة اسم آخر بالإنجليزية.",
      );
      return;
    }

    const newCat: Category = {
      id,
      name: catName,
      description: catDesc,
      type: "lenses",
    };

    onUpdateCategories([...categories, newCat]);
    setIsAddCategoryOpen(false);
    setDashboardSuccessMessage("تم إضافة التصنيف الجديد بنجاح! 🏷️");
    setTimeout(() => setDashboardSuccessMessage(null), 4000);
  };

  const handleStartEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const updated = categories.map((c) =>
      c.id === editingCategory.id
        ? { ...c, name: catName, description: catDesc, type: "lenses" as const }
        : c,
    );

    onUpdateCategories(updated);
    setEditingCategory(null);
    setDashboardSuccessMessage("تم حفظ وتحديث بيانات التصنيف بنجاح! 🏷️");
    setTimeout(() => setDashboardSuccessMessage(null), 4000);
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      setAdminWarning(
        "لا يمكن حذف هذا التصنيف لأنه التصنيف الوحيد المتبقي في المتجر. يجب أن يحتوي المتجر على تصنيف واحد على الأقل.",
      );
      return;
    }
    // Check if category is protected or has products
    const productCount = products.filter((p) => p.category === id).length;
    if (productCount > 0) {
      setAdminWarning(
        `لا يمكن حذف هذا التصنيف لوجود عدد (${productCount}) من المنتجات مرتبطة به حالياً. يرجى تعديل فئة المنتجات أو حذفها أولاً.`,
      );
      return;
    }
    setCategoryToDelete(id);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete !== null) {
      const filtered = categories.filter((c) => c.id !== categoryToDelete);
      onUpdateCategories(filtered);
      setCategoryToDelete(null);
      setDashboardSuccessMessage("تم حذف التصنيف بنجاح! 🗑️");
      setTimeout(() => setDashboardSuccessMessage(null), 4000);
    }
  };

  // Open product edit form
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormCategory(product.category);
    setFormDesc(product.description || "");
    setFormImage(product.image || "");
  };

  // Handle update product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated = products.map((p) =>
      p.id === editingProduct.id
        ? {
            ...p,
            name: formName,
            price: Number(formPrice),
            category: formCategory,
            description: formDesc,
            image: formImage || p.image,
          }
        : p,
    );

    onUpdateProducts(updated);
    setEditingProduct(null);
    setDashboardSuccessMessage("تم حفظ وتحديث بيانات المنتج بنجاح! 📦");
    setTimeout(() => setDashboardSuccessMessage(null), 4000);
  };

  // Open add product form
  const handleStartAdd = () => {
    setFormName("");
    setFormPrice(150);
    setFormCategory(categories[0]?.id || "colored");
    setFormDesc("");
    setFormImage(
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=600",
    ); // placeholder elegant lens photo
    setIsAddProductOpen(true);
  };

  // Handle add product
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const maxId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) : 200;
    const newProduct: Product = {
      id: maxId + 1,
      name: formName,
      price: Number(formPrice),
      category: formCategory,
      description: formDesc,
      image: formImage,
      isNew: true,
    };

    onUpdateProducts([newProduct, ...products]);
    setIsAddProductOpen(false);
    setDashboardSuccessMessage("تم إضافة المنتج الجديد بنجاح! 📦");
    setTimeout(() => setDashboardSuccessMessage(null), 4000);
  };

  // Handle duplicate product
  const handleDuplicateProduct = (product: Product) => {
    const maxId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) : 200;
    const duplicatedProduct: Product = {
      ...product,
      id: maxId + 1,
      name: `${product.name} (نسخة)`,
      isNew: true,
    };

    onUpdateProducts([duplicatedProduct, ...products]);
    setDashboardSuccessMessage("تم تكرار المنتج بنجاح! 📋");
    setTimeout(() => setDashboardSuccessMessage(null), 4000);
  };

  // Handle delete product
  const handleDeleteProduct = (id: number) => {
    setProductToDelete(id);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete !== null) {
      const filtered = products.filter((p) => p.id !== productToDelete);
      onUpdateProducts(filtered);
      setProductToDelete(null);
      setDashboardSuccessMessage("تم حذف المنتج بنجاح! 🗑️");
      setTimeout(() => setDashboardSuccessMessage(null), 4000);
    }
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete !== null) {
      onDeleteOrder(orderToDelete);
      setOrderToDelete(null);
      setDashboardSuccessMessage("تم حذف الطلب بنجاح! 🗑️");
      setTimeout(() => setDashboardSuccessMessage(null), 4000);
    }
  };

  // Handle update order status
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o,
    );
    onUpdateOrders(updated);
  };

  // Handle WhatsApp confirmation
  const handleConfirmOnWhatsapp = (order: Order) => {
    const itemsText = order.items
      .map(
        (item) =>
          `• ${item.name}${item.power ? ` (قياس: ${item.power})` : ""} | العدد: ${item.quantity}`,
      )
      .join("\n");

    const message = `مرحبًا يا ${order.customerName}، معك متجر لينا للعدسات 🌸\n\nنود تأكيد طلبك رقم #${order.id}:\n${itemsText}\n\nإجمالي قيمة الطلب: ${order.total} جنيه\nالعنوان: ${order.governorate}، ${order.address}\n\nيرجى تأكيد طلبك بالرد على هذه الرسالة لنبدأ تجهيزه فورًا وشحنه لك ✨`;

    let cleanPhone = order.phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "2" + cleanPhone;
    } else if (cleanPhone.length === 10) {
      cleanPhone = "20" + cleanPhone;
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Status labels in Arabic
  const statusLabels = {
    pending: {
      label: "جديد / معلق",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    preparing: {
      label: "جاري التجهيز",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    shipped: {
      label: "تم الشحن",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    completed: {
      label: "مكتمل",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    cancelled: {
      label: "ملغي",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-[#FFFFFF] text-stone-900"
          dir="rtl"
        >
          {/* Dashboard Header */}
          <header className="bg-[#FFFFFF] border-b border-stone-200 px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-stone-950 flex items-center justify-center text-white font-black text-lg">
                  ل
                </div>

                <div>
                  <h1 className="text-lg font-extrabold tracking-tight text-stone-900">
                    لوحة تحكم لينا
                  </h1>
                  <p className="text-[10px] text-stone-700 font-bold">
                    بوابة إدارة المبيعات والمنتجات الفاخرة
                  </p>
                </div>
              </div>
              <div className="flex lg:hidden items-center gap-2">
                <button
                  onClick={onLogout}
                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all cursor-pointer"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-stone-100 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200 transition-all cursor-pointer"
                  aria-label="إغلاق لوحة التحكم"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-nowrap justify-start lg:justify-center items-center bg-stone-50/80 border border-stone-200 p-1 rounded-xl gap-1 w-full lg:w-auto overflow-x-auto touch-pan-x scrollbar-none shrink-0">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center shrink-0 gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  activeTab === "orders"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-950 hover:bg-white"
                }`}
              >
                <ShoppingBag size={14} />
                <span>الطلبات ({orders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center shrink-0 gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  activeTab === "products"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-950 hover:bg-white"
                }`}
              >
                <Package size={14} />
                <span>المنتجات ({products.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center shrink-0 gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  activeTab === "categories"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-950 hover:bg-white"
                }`}
              >
                <Tag size={14} />
                <span>الأقسام ({categories.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center shrink-0 gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  activeTab === "shipping"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-950 hover:bg-white"
                }`}
              >
                <MapPin size={14} />
                <span>الشحن ({shippingRates.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center shrink-0 gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  activeTab === "contact"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-950 hover:bg-white"
                }`}
              >
                <Phone size={14} />
                <span>بيانات التواصل</span>
              </button>
              <button
                onClick={() => setActiveTab("notifications_manage")}
                className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center shrink-0 gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  activeTab === "notifications_manage"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-950 hover:bg-white"
                }`}
              >
                <AlertCircle size={14} />
                <span>إدارة الإشعارات ({notifications.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center shrink-0 gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  activeTab === "security"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-950 hover:bg-white"
                }`}
              >
                <Lock size={14} />
                <span>الأمان والحماية</span>
              </button>
            </div>

            {/* Header Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={onLogout}
                className="px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-stone-100 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200 transition-all cursor-pointer"
                aria-label="إغلاق لوحة التحكم"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Main Work Area */}
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 lg:px-12 max-w-7xl w-full mx-auto">
            {dashboardSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 mb-6">
                <Check size={16} />
                <span>{dashboardSuccessMessage}</span>
              </div>
            )}

            {dashboardErrorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 mb-6">
                <AlertCircle size={16} />
                <span>{dashboardErrorMessage}</span>
              </div>
            )}

            {/* SECTION 1: ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-base font-extrabold text-stone-900">
                      سجل طلبات العملاء
                    </h2>
                    <p className="text-xs text-stone-700 font-medium">
                      متابعة وتحديث حالات تسليم الشحنات والمدفوعات
                    </p>
                  </div>

                  {/* Search bar inside Orders Tab */}
                  {orders.length > 0 && (
                    <div className="relative w-full sm:w-80">
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن طلب، اسم العميل، الهاتف، أو رقم الطلب..."
                        className="bg-[#FFFFFF] border-stone-300 focus:border-stone-500 pr-9 rounded-lg text-xs"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          ></path>
                        </svg>
                      </div>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute inset-y-0 left-3 flex items-center text-stone-400 hover:text-stone-700"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-[#FFFFFF] rounded-lg border border-stone-200">
                    <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag size={20} />
                    </div>
                    <p className="text-stone-600 text-xs font-bold">
                      لا توجد أي طلبات واردة بعد
                    </p>
                    <p className="text-stone-400 text-[10px] mt-1">
                      عند قيام العملاء بالطلب، ستظهر البيانات هنا مباشرة.
                    </p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-[#FFFFFF] rounded-lg border border-stone-200">
                    <p className="text-stone-600 text-xs font-bold">
                      لا توجد نتائج تطابق البحث حالياً.
                    </p>
                    <p className="text-stone-400 text-[10px] mt-1">
                      يرجى تجربة كلمات بحث أخرى أو مسح حقل البحث.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        className="bg-[#FFFFFF] border border-stone-200 rounded-lg p-5 space-y-4 transition-all"
                      >
                        {/* Order Title bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md">
                              رقم الطلب {order.id}
                            </span>
                            <span className="text-[10px] text-stone-700 flex items-center gap-1 font-bold">
                              <Calendar size={12} />
                              {order.date}
                            </span>
                          </div>

                          {/* Status Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-stone-700 font-bold">
                              حالة الطلب:
                            </span>
                            <Select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value as Order["status"],
                                )
                              }
                              className={`text-xs font-bold border rounded-lg px-2.5 py-1 outline-none transition-colors ${
                                statusLabels[order.status]?.color ||
                                "bg-stone-50 text-stone-700 border-stone-200"
                              }`}
                            >
                              <option value="pending">جديد / معلق</option>
                              <option value="preparing">جاري التجهيز</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="completed">مكتمل</option>
                              <option value="cancelled">ملغي / مسترجع</option>
                            </Select>
                          </div>
                        </div>

                        {/* Customer & Product Grid Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left column: Customer Details */}
                          <div className="space-y-2.5">
                            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                              بيانات العميل والشحن
                            </h4>
                            <div className="bg-[#FFFFFF] p-4 rounded-lg border border-stone-200 space-y-2">
                              <div className="flex items-center gap-2 text-xs text-stone-800 font-bold">
                                <User
                                  size={13}
                                  className="text-stone-500 flex-shrink-0"
                                />
                                <span>{order.customerName}</span>
                              </div>
                              <div
                                className="flex items-center gap-2 text-xs text-stone-750 ltr-input"
                                dir="ltr"
                              >
                                <Phone
                                  size={13}
                                  className="text-stone-500 flex-shrink-0"
                                />
                                <span>{order.phone}</span>
                              </div>
                              <div className="flex items-start gap-2 text-xs text-stone-750">
                                <MapPin
                                  size={13}
                                  className="text-stone-500 mt-0.5 flex-shrink-0"
                                />
                                <span>
                                  {order.governorate}، {order.address}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-stone-750 border-t border-stone-200/50 pt-2 mt-1">
                                <CreditCard
                                  size={13}
                                  className="text-stone-500 flex-shrink-0"
                                />
                                <span>
                                  طريقة الدفع:{" "}
                                  <span className="font-bold text-stone-900">
                                    {order.paymentMethod === "cod"
                                      ? "الدفع عند الاستلام كاش"
                                      : order.paymentMethod === "vodafone"
                                        ? "فودافون كاش"
                                        : order.paymentMethod === "card"
                                          ? "بطاقة بنكية (فيزا / ماستر كارد)"
                                          : order.paymentMethod}
                                  </span>
                                </span>
                              </div>
                              <div className="pt-2 mt-1 border-t border-stone-100 flex flex-col gap-2">
                                <button
                                  onClick={() => handleConfirmOnWhatsapp(order)}
                                  className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all "
                                >
                                  <WhatsAppIcon size={16} className="text-white shrink-0" />
                                  <span>تأكيد الطلب عبر الواتساب</span>
                                </button>
                                <button
                                  onClick={() => setOrderToDelete(order.id)}
                                  className="w-full py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all "
                                >
                                  <Trash size={14} />
                                  <span>حذف الطلب</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right column: Order Items */}
                          <div className="space-y-2.5">
                            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                              المنتجات المطلوبة
                            </h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center gap-2 text-xs p-2 bg-[#FFFFFF] rounded-lg border border-stone-100"
                                >
                                  <div className="flex-1 min-w-0">
                                    <span className="font-bold text-stone-900 block truncate">
                                      {item.name}
                                    </span>
                                    {item.power && (
                                      <span className="block text-[10px] text-stone-500 font-medium truncate">
                                        القياس: {item.power}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-stone-500 font-semibold whitespace-nowrap shrink-0">
                                    {item.quantity} × {item.price} جنيه
                                  </span>
                                </div>
                              ))}

                              {/* Order Total Price */}
                              <div className="flex justify-between items-center bg-stone-900 text-white p-3 rounded-lg border border-stone-800 mt-2">
                                <span className="text-xs font-bold">
                                  إجمالي قيمة الطلب
                                </span>
                                <span className="text-sm font-extrabold">
                                  {order.total} جنيه
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: PRODUCTS TAB */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-stone-900">
                      إدارة العدسات
                    </h2>
                    <p className="text-xs text-stone-700 font-medium">
                      إضافة، تعديل وحذف منتجات المعرض
                    </p>
                  </div>
                  <button
                    onClick={handleStartAdd}
                    className="w-full sm:w-auto px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>إضافة منتج جديد</span>
                  </button>
                </div>

                {/* Search bar inside Products Tab */}
                {products.length > 0 && (
                  <div className="relative w-full sm:w-80">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن منتج، وصف، أو تصنيف..."
                      className="bg-[#FFFFFF] border-stone-300 focus:border-stone-500 pr-9 rounded-lg text-xs"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 left-3 flex items-center text-stone-400 hover:text-stone-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Product List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProductsList.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-[#FFFFFF] rounded-lg border border-stone-200">
                      <p className="text-stone-600 text-xs font-bold">
                        لا توجد منتجات تطابق البحث حالياً.
                      </p>
                      <p className="text-stone-400 text-[10px] mt-1">
                        يرجى تجربة كلمات بحث أخرى أو مسح حقل البحث.
                      </p>
                    </div>
                  ) : (
                    filteredProductsList.map((product) => (
                      <div
                        key={product.id}
                        className="bg-[#FFFFFF] border border-stone-200 rounded-lg p-4 flex flex-col justify-between transition-all"
                      >
                        <div>
                          {/* Image & Main Info */}
                          <div className="flex gap-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#FFFFFF] border border-stone-200/50 flex-shrink-0">
                              <img
                                loading="lazy"
                                src={product.image}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-750 mb-1">
                                {categories.find(
                                  (c) => c.id === product.category,
                                )?.name || product.category}
                              </span>
                              <h4 className="font-extrabold text-xs text-stone-900 line-clamp-2 leading-tight">
                                {product.name}
                              </h4>
                              <span className="text-xs font-extrabold text-stone-900 block mt-1">
                                {product.price} جنيه
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-stone-700 font-medium mt-3 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t border-stone-100 pt-3 mt-4">
                          <button
                            onClick={() => handleStartEdit(product)}
                            className="flex-1 py-1.5 text-[11px] font-bold bg-[#FFFFFF] hover:bg-stone-50 text-stone-700 rounded-lg border border-stone-200 flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <Edit size={12} />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(product)}
                            className="flex-1 py-1.5 text-[11px] font-bold bg-[#FFFFFF] hover:bg-stone-50 text-stone-700 rounded-lg border border-stone-200 flex items-center justify-center gap-1 cursor-pointer transition-all"
                            title="تكرار المنتج"
                          >
                            <Copy size={12} />
                            <span>تكرار</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 flex items-center justify-center cursor-pointer transition-all"
                            title="حذف المنتج"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SECTION 3: CATEGORIES TAB */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-stone-900">
                      إدارة تصنيفات المنتجات
                    </h2>
                    <p className="text-xs text-stone-700 font-medium">
                      عرض، إضافة وتعديل الفئات والتصنيفات في المتجر
                    </p>
                  </div>
                  <button
                    onClick={handleStartAddCategory}
                    className="w-full sm:w-auto px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>إضافة تصنيف جديد</span>
                  </button>
                </div>

                {/* Search bar inside Categories Tab */}
                {categories.length > 0 && (
                  <div className="relative w-full sm:w-80">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن تصنيف، اسم، أو وصف..."
                      className="bg-[#FFFFFF] border-stone-300 focus:border-stone-500 pr-9 rounded-lg text-xs"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 left-3 flex items-center text-stone-400 hover:text-stone-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Category List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategoriesList.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-[#FFFFFF] rounded-lg border border-stone-200">
                      <p className="text-stone-600 text-xs font-bold">
                        لا توجد تصنيفات تطابق البحث حالياً.
                      </p>
                      <p className="text-stone-400 text-[10px] mt-1">
                        يرجى تجربة كلمات بحث أخرى أو مسح حقل البحث.
                      </p>
                    </div>
                  ) : (
                    filteredCategoriesList.map((category) => {
                      const productCount = products.filter(
                        (p) => p.category === category.id,
                      ).length;
                      return (
                        <div
                          key={category.id}
                          className="bg-[#FFFFFF] border border-stone-200 rounded-lg p-4 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200/50">
                                عدسات لاصقة
                              </span>
                              <span className="text-[10px] font-bold text-stone-700 bg-[#FFFFFF] px-2.5 py-1 rounded-md border border-stone-200/60">
                                {productCount} منتج
                              </span>
                            </div>
                            <h3 className="font-extrabold text-sm text-stone-900 mb-1">
                              {category.name}
                            </h3>
                            <p
                              className="text-[10px] text-stone-600 font-mono mb-2"
                              dir="ltr"
                            >
                              Slug ID: {category.id}
                            </p>
                            <p className="text-xs text-stone-700 font-medium leading-relaxed line-clamp-3">
                              {category.description}
                            </p>
                          </div>

                          <div className="flex gap-2 border-t border-stone-100 pt-3 mt-4">
                            <button
                              onClick={() => handleStartEditCategory(category)}
                              className="flex-1 py-1.5 text-[11px] font-bold bg-[#FFFFFF] hover:bg-stone-50 text-stone-700 rounded-lg border border-stone-200 flex items-center justify-center gap-1 cursor-pointer transition-all"
                            >
                              <Edit size={12} />
                              <span>تعديل</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 flex items-center justify-center cursor-pointer transition-all"
                              title="حذف التصنيف"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* SECTION 4: SHIPPING TAB */}
            {activeTab === "shipping" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-stone-900">
                      إدارة أسعار الشحن
                    </h2>
                    <p className="text-xs text-stone-700 font-medium">
                      عرض، تعديل وإضافة أسعار التوصيل والشحن لكل محافظة
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShippingGov("");
                      setShippingPrice(50);
                      setCustomGov("");
                      setIsAddShippingOpen(true);
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95 animate-fade-in"
                  >
                    <Plus size={15} />
                    <span>إضافة سعر شحن جديد</span>
                  </button>
                </div>

                {/* Search bar inside Shipping Tab */}
                {shippingRates.length > 0 && (
                  <div className="relative w-full sm:w-80">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن محافظة..."
                      className="bg-[#FFFFFF] border-stone-300 focus:border-stone-500 pr-9 rounded-lg text-xs"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 left-3 flex items-center text-stone-400 hover:text-stone-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Shipping Rates List Table/Grid */}
                <div className="bg-[#FFFFFF] border border-stone-200 rounded-md overflow-hidden">
                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-right border-collapse text-xs font-sans whitespace-nowrap">
                      <thead>
                        <tr className="bg-[#FFFFFF] border-b border-stone-200 text-stone-700 font-bold">
                          <th className="p-3.5 sm:p-4">المحافظة</th>
                          <th className="p-3.5 sm:p-4">سعر الشحن</th>
                          <th className="p-3.5 sm:p-4 text-center">الخيارات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredShippingRatesList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={3}
                              className="p-8 text-center text-stone-500 font-medium"
                            >
                              لا توجد أسعار شحن مضافة حالياً أو تطابق البحث.
                            </td>
                          </tr>
                        ) : (
                          filteredShippingRatesList.map((rate) => (
                            <tr
                              key={rate.governorate}
                              className="hover:bg-stone-100/20 transition-colors"
                            >
                              <td className="p-3.5 sm:p-4 font-extrabold text-stone-900">
                                {rate.governorate}
                              </td>
                              <td className="p-3.5 sm:p-4 font-bold text-emerald-700">
                                {rate.price === 0
                                  ? "شحن مجاني"
                                  : `${rate.price} جنيه`}
                              </td>
                              <td className="p-3.5 sm:p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingShipping(rate);
                                      setShippingGov(rate.governorate);
                                      setShippingPrice(rate.price);
                                    }}
                                    className="py-1.5 px-3 text-[10px] font-bold bg-[#FFFFFF] hover:bg-stone-50 text-stone-700 rounded-md border border-stone-200 flex items-center justify-center gap-1 cursor-pointer transition-all"
                                  >
                                    <Edit size={11} />
                                    <span>تعديل</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = shippingRates.filter(
                                        (r) =>
                                          r.governorate !== rate.governorate,
                                      );
                                      onUpdateShippingRates(updated);
                                      setDashboardSuccessMessage(
                                        "تم حذف سعر الشحن بنجاح! 🗑️",
                                      );
                                      setTimeout(
                                        () => setDashboardSuccessMessage(null),
                                        4000,
                                      );
                                    }}
                                    className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md border border-red-100 flex items-center justify-center cursor-pointer transition-all"
                                    title="حذف سعر المحافظة"
                                  >
                                    <Trash size={11} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: CONTACT TAB */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-stone-900">
                    إدارة معلومات التواصل
                  </h2>
                  <p className="text-xs text-stone-700 font-medium">
                    تعديل أرقام الهواتف، البريد الإلكتروني، وروابط التواصل
                    الاجتماعي لتحديثها تلقائياً في الموقع
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    const isValidUrl = (url: string) => {
                      if (!url) return true;
                      try {
                        const parsed = new URL(url);
                        return (
                          parsed.protocol === "http:" ||
                          parsed.protocol === "https:"
                        );
                      } catch {
                        return false;
                      }
                    };

                    const digitsOnly = /^[0-9]+$/;
                    if (
                      contactWhatsapp &&
                      !digitsOnly.test(contactWhatsapp.trim())
                    ) {
                      setDashboardErrorMessage(
                        "يرجى إدخال أرقام فقط لرقم واتساب بدون رموز أو مسافات (مثال: 96692000000)",
                      );
                      setTimeout(() => setDashboardErrorMessage(null), 5000);
                      return;
                    }

                    if (!isValidUrl(contactInstagram)) {
                      setDashboardErrorMessage(
                        "يرجى إدخال رابط صالح لحساب انستقرام (يبدأ بـ http:// أو https://)",
                      );
                      setTimeout(() => setDashboardErrorMessage(null), 5000);
                      return;
                    }

                    if (!isValidUrl(contactFacebook)) {
                      setDashboardErrorMessage(
                        "يرجى إدخال رابط صالح لحساب فيسبوك (يبدأ بـ http:// أو https://)",
                      );
                      setTimeout(() => setDashboardErrorMessage(null), 5000);
                      return;
                    }

                    setDashboardErrorMessage(null);

                    onUpdateContactInfo({
                      whatsapp: contactWhatsapp,
                      phone: contactPhone,
                      email: contactEmail,
                      instagram: contactInstagram,
                      facebook: contactFacebook,
                      globalSite: "",
                    });
                    setDashboardSuccessMessage(
                      "تم حفظ وتحديث معلومات التواصل بنجاح! 🌿",
                    );
                    setTimeout(() => setDashboardSuccessMessage(null), 4000);
                  }}
                  className="bg-[#FFFFFF] border border-stone-200 rounded-md p-4 sm:p-6 space-y-4 max-w-2xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        رقم واتساب الأساسي (أرقام فقط بدون + أو 00) *
                      </label>
                      <Input
                        type="text"
                        required
                        value={contactWhatsapp}
                        onChange={(e) => setContactWhatsapp(e.target.value)}
                        placeholder="أدخل رقم الواتساب بدون + أو أصفار في البداية"
                      />
                      <span className="text-[10px] text-stone-500 block font-bold">
                        يتم استخدامه لإنشاء رابط واتساب المباشر (wa.me) في
                        الموقع.
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        رقم الهاتف المعروض *
                      </label>
                      <Input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="أدخل رقم الهاتف مع رمز الدولة"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      البريد الإلكتروني للدعم *
                    </label>
                    <Input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="أدخل البريد الإلكتروني المخصص للدعم"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        رابط حساب فيسبوك
                      </label>
                      <Input
                        type="text"
                        value={contactFacebook}
                        onChange={(e) => setContactFacebook(e.target.value)}
                        placeholder="أدخل رابط حساب الفيسبوك بالكامل"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        رابط حساب انستقرام
                      </label>
                      <Input
                        type="text"
                        value={contactInstagram}
                        onChange={(e) => setContactInstagram(e.target.value)}
                        placeholder="أدخل رابط حساب الانستغرام بالكامل"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Check size={14} />
                    <span>حفظ التعديلات وتطبيقها</span>
                  </button>
                </form>
              </div>
            )}

            {/* SECTION 6: NOTIFICATIONS MANAGER TAB */}
            {activeTab === "notifications_manage" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-stone-900">
                      إدارة الإشعارات النشطة
                    </h2>
                    <p className="text-xs text-stone-700 font-medium">
                      إنشاء، تعديل، حذف ونشر الإشعارات مباشرة على الموقع
                      وتحديثها للمستخدمين
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingNotification(null);
                      setNotifText("");
                      setNotifTime("منذ لحظات");
                      setNotifUnread(true);
                      setIsAddNotificationOpen(true);
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95 animate-fade-in"
                  >
                    <Plus size={15} />
                    <span>إنشاء إشعار جديد</span>
                  </button>
                </div>

                {/* Search bar inside Notifications Tab */}
                {notifications.length > 0 && (
                  <div className="relative w-full sm:w-80">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن إشعار..."
                      className="bg-[#FFFFFF] border-stone-300 focus:border-stone-500 pr-9 rounded-lg text-xs"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 left-3 flex items-center text-stone-400 hover:text-stone-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Notifications list */}
                <div className="bg-[#FFFFFF] border border-stone-200 rounded-md overflow-hidden">
                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-right border-collapse text-xs font-sans whitespace-nowrap">
                      <thead>
                        <tr className="bg-[#FFFFFF] border-b border-stone-200 text-stone-700 font-bold">
                          <th className="p-3.5 sm:p-4">نص الإشعار</th>
                          <th className="p-3.5 sm:p-4">الوقت المعروض</th>
                          <th className="p-3.5 sm:p-4">الحالة</th>
                          <th className="p-3.5 sm:p-4 text-center">الخيارات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredNotificationsList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-8 text-center text-stone-500 font-medium"
                            >
                              لا توجد إشعارات تطابق البحث أو لا توجد إشعارات
                              نشطة حالياً.
                            </td>
                          </tr>
                        ) : (
                          filteredNotificationsList.map((notif) => (
                            <tr
                              key={notif.id}
                              className="hover:bg-stone-100/20 transition-colors"
                            >
                              <td className="p-3.5 sm:p-4 font-extrabold text-stone-900 max-w-md truncate whitespace-normal">
                                {notif.text}
                              </td>
                              <td className="p-3.5 sm:p-4 font-bold text-stone-700">
                                {notif.time}
                              </td>
                              <td className="p-3.5 sm:p-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                                    notif.unread
                                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                                      : "bg-stone-100 text-stone-700 border border-stone-300"
                                  }`}
                                >
                                  {notif.unread ? "غير مقروء" : "مقروء"}
                                </span>
                              </td>
                              <td className="p-3.5 sm:p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingNotification(notif);
                                      setNotifText(notif.text);
                                      setNotifTime(notif.time);
                                      setNotifUnread(notif.unread);
                                      setIsAddNotificationOpen(true);
                                    }}
                                    className="py-1.5 px-3 text-[10px] font-bold bg-[#FFFFFF] hover:bg-stone-50 text-stone-700 rounded-md border border-stone-200 flex items-center justify-center gap-1 cursor-pointer transition-all"
                                  >
                                    <Edit size={11} />
                                    <span>تعديل</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = notifications.map((n) =>
                                        n.id === notif.id
                                          ? { ...n, unread: !n.unread }
                                          : n,
                                      );
                                      onUpdateNotifications(updated);
                                    }}
                                    className="py-1.5 px-2.5 text-[10px] font-bold bg-[#FFFFFF] hover:bg-stone-50 text-stone-700 rounded-md border border-stone-200 cursor-pointer transition-all"
                                    title="تغيير حالة القراءة"
                                  >
                                    <span>
                                      {notif.unread
                                        ? "ميز كمقروء"
                                        : "ميز كغير مقروء"}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteNotification(notif.id)
                                    }
                                    className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md border border-red-100 flex items-center justify-center cursor-pointer transition-all"
                                    title="حذف الإشعار"
                                  >
                                    <Trash size={11} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-stone-900">
                    إعدادات الأمان والحماية للمسؤول
                  </h2>
                  <p className="text-xs text-stone-700 font-medium">
                    قم بإدارة إعدادات الأمان وحماية لوحة التحكم وتحديث كلمة
                    المرور لضمان منع الوصول غير المصرح به للمتجر.
                  </p>
                </div>

                {/* Security Settings Section */}
                <div className="bg-[#FFFFFF] border border-stone-200 rounded-md p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
                    <span className="p-1.5 bg-red-50 text-red-700 rounded-md">
                      <Lock size={16} />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-stone-900">
                        تغيير كلمة المرور للمسؤول
                      </h3>
                      <p className="text-[10px] text-stone-500 font-bold mt-0.5">
                        قم بتحديث كلمة مرور لوحة التحكم الخاصة بالمدير بشكل دوري
                        لضمان حماية المتجر ومنع الوصول غير المصرح به.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setAdminPasswordResult(null);

                      if (adminNewPassword !== adminConfirmPassword) {
                        setAdminPasswordResult({
                          success: false,
                          message:
                            "كلمة المرور الجديدة وتأكيدها غير متطابقتين!",
                        });
                        return;
                      }

                      if (adminNewPassword.length < 6) {
                        setAdminPasswordResult({
                          success: false,
                          message:
                            "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.",
                        });
                        return;
                      }

                      setIsChangingAdminPassword(true);

                      try {
                        const token =
                          sessionStorage.getItem("lina_admin_token") || "";
                        const res = await fetch("/api/admin/change-password", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            currentPassword: adminCurrentPassword,
                            newPassword: adminNewPassword,
                          }),
                        });

                        const data = await res.json();
                        if (res.ok && data.success) {
                          setAdminPasswordResult({
                            success: true,
                            message:
                              data.message || "تم تغيير كلمة المرور بنجاح! 🔒",
                          });
                          setAdminCurrentPassword("");
                          setAdminNewPassword("");
                          setAdminConfirmPassword("");
                        } else {
                          setAdminPasswordResult({
                            success: false,
                            message:
                              data.error ||
                              "فشل تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية.",
                          });
                        }
                      } catch (err: any) {
                        setAdminPasswordResult({
                          success: false,
                          message: `حدث خطأ غير متوقع: ${err?.message || String(err)}`,
                        });
                      } finally {
                        setIsChangingAdminPassword(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-750 block">
                          كلمة المرور الحالية *
                        </label>
                        <Input
                          type="password"
                          required
                          value={adminCurrentPassword}
                          onChange={(e) =>
                            setAdminCurrentPassword(e.target.value)
                          }
                          placeholder="أدخل كلمة المرور الحالية"
                          className="ltr-input font-mono"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-750 block">
                          كلمة المرور الجديدة *
                        </label>
                        <Input
                          type="password"
                          required
                          value={adminNewPassword}
                          onChange={(e) => setAdminNewPassword(e.target.value)}
                          placeholder="أدخل كلمة المرور الجديدة"
                          className="ltr-input font-mono"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-750 block">
                          تأكيد كلمة المرور الجديدة *
                        </label>
                        <Input
                          type="password"
                          required
                          value={adminConfirmPassword}
                          onChange={(e) =>
                            setAdminConfirmPassword(e.target.value)
                          }
                          placeholder="أعد كتابة كلمة المرور الجديدة"
                          className="ltr-input font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {adminPasswordResult && (
                      <div
                        className={`p-3 rounded text-xs font-bold leading-relaxed flex items-start gap-2 ${adminPasswordResult.success ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-red-50 text-red-800 border border-red-100"}`}
                      >
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{adminPasswordResult.message}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-stone-100 flex justify-end">
                      <button
                        type="submit"
                        disabled={isChangingAdminPassword}
                        className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChangingAdminPassword ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
                            <span>جاري التحديث...</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            <span>تحديث كلمة مرور لوحة التحكم</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>


              </div>
            )}
          </main>

          {/* MODAL: ADD / EDIT PRODUCT */}
          <Modal
            isOpen={isAddProductOpen || editingProduct !== null}
            onClose={() => {
              setIsAddProductOpen(false);
              setEditingProduct(null);
            }}
            title={
              editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد للمتجر"
            }
            icon={editingProduct ? <Edit size={16} /> : <Plus size={16} />}
            className="w-full max-w-xl bg-[#FFFFFF] text-stone-900 rounded-md overflow-hidden border border-stone-100 my-4 sm:my-8 flex flex-col max-h-[95vh] sm:max-h-[90vh] relative"
          >
            {/* Modal Form Content */}
            <form
              onSubmit={
                editingProduct ? handleSaveProduct : handleSaveNewProduct
              }
              className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1"
            >
              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    اسم المنتج *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="أدخل اسم المنتج بالكامل"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    التصنيف *
                  </label>
                  <Select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Price & Image */}
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    السعر بالجنيه *
                  </label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2 border-t border-stone-100 pt-3">
                <label className="text-xs font-bold text-stone-700 block">
                  صورة المنتج *
                </label>

                {/* Drag and Drop Zone / Preview */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 text-center ${
                    dragActive
                      ? "border-amber-500 bg-amber-50/10"
                      : "border-stone-200 hover:border-stone-400 bg-stone-50/50"
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleImageFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                      <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
                      <p className="text-xs font-bold text-stone-600">
                        جاري رفع الصورة...
                      </p>
                    </div>
                  ) : formImage ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="relative w-32 h-32 rounded-md overflow-hidden border border-stone-200 bg-white">
                        <img
                          src={formImage}
                          alt="معاينة المنتج"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setFormImage("")}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                          title="إزالة الصورة"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <UploadCloud size={32} className="text-stone-300" />
                      <p className="text-xs font-bold text-stone-600">
                        اسحب الصورة وأفلتها هنا، أو اضغط للرفع
                      </p>
                      <p className="text-[10px] text-stone-400">
                        يفضل استخدام صور مربعة بخلفية بيضاء (JPG, PNG)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageFileChange(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                  {uploadError && (
                    <p className="text-xs text-red-600 mt-2 font-bold flex items-center justify-center gap-1">
                      <AlertCircle size={14} />
                      <span>{uploadError}</span>
                    </p>
                  )}
                </div>

                {/* Manual Link Input Toggle */}
                <div className="mt-2 text-right">
                  <details className="group">
                    <summary className="text-xs text-stone-500 hover:text-stone-700 cursor-pointer focus:outline-none select-none list-none flex items-center gap-1 justify-end">
                      <span className="underline font-medium">
                        أو أدخل رابط الصورة يدويًا
                      </span>
                    </summary>
                    <div className="mt-2 pt-2 border-t border-dashed border-stone-100">
                      <Input
                        type="text"
                        placeholder="أدخل رابط الصورة المباشر هنا (مثل https://...)"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="ltr-input text-xs"
                        dir="ltr"
                      />
                    </div>
                  </details>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  وصف المستحضر والفوائد *
                </label>
                <Textarea
                  required
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="عدسات لاصقة تمنح إطلالة مريحة وطبيعية..."
                />
              </div>

              {/* Save button */}
              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  {editingProduct ? "حفظ التغييرات" : "إضافة المنتج الآن"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </Modal>

          {/* CUSTOM DELETE CONFIRMATION MODAL */}
          <ConfirmDeleteModal
            isOpen={productToDelete !== null}
            onClose={() => setProductToDelete(null)}
            onConfirm={confirmDeleteProduct}
            title="تأكيد حذف المنتج"
            description="هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر؟ لا يمكن التراجع عن هذا الإجراء."
            confirmText="نعم، احذف المنتج"
          />

          {/* CUSTOM DELETE ORDER CONFIRMATION MODAL */}
          <ConfirmDeleteModal
            isOpen={orderToDelete !== null}
            onClose={() => setOrderToDelete(null)}
            onConfirm={confirmDeleteOrder}
            title="تأكيد حذف الطلب"
            description="هل أنت متأكد من حذف هذا الطلب نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
            confirmText="نعم، احذف الطلب"
          />

          {/* CUSTOM DELETE CATEGORY CONFIRMATION MODAL */}
          <ConfirmDeleteModal
            isOpen={categoryToDelete !== null}
            onClose={() => setCategoryToDelete(null)}
            onConfirm={confirmDeleteCategory}
            title="تأكيد حذف التصنيف"
            description="هل أنت متأكد من حذف هذا التصنيف نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
            confirmText="نعم، احذف التصنيف"
          />

          {/* MODAL: ADD CATEGORY */}
          <Modal
            isOpen={isAddCategoryOpen}
            onClose={() => setIsAddCategoryOpen(false)}
            title="إضافة تصنيف منتجات جديد"
            icon={<Plus size={16} />}
            className="relative w-full max-w-xl bg-[#FFFFFF] text-stone-900 rounded-md overflow-hidden border border-stone-100 my-4 sm:my-8 flex flex-col max-h-[95vh] sm:max-h-[90vh]"
          >
            <form
              onSubmit={handleSaveNewCategory}
              className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    اسم التصنيف بالعربية *
                  </label>
                  <Input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="مثال: عدسات لاصقة تجميلية"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    المعرف بالإنجليزية (Slug) *
                  </label>
                  <Input
                    type="text"
                    required
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    placeholder="cosmetic (أحرف إنجليزية فقط)"
                    className="ltr-input"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  نوع منتجات التصنيف *
                </label>
                <Select>
                  <option value="lenses">
                    عدسات لاصقة (تتطلب اختيار قياس نظر)
                  </option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  وصف التصنيف *
                </label>
                <Textarea
                  required
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="اكتب وصفاً مختصراً يوضح منتجات هذا التصنيف وفائدتها..."
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  إضافة التصنيف الآن
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </Modal>

          {/* MODAL: EDIT CATEGORY */}
          <Modal
            isOpen={editingCategory !== null}
            onClose={() => setEditingCategory(null)}
            title="تعديل بيانات التصنيف"
            icon={<Edit size={16} />}
            className="relative w-full max-w-xl bg-[#FFFFFF] text-stone-900 rounded-md overflow-hidden border border-stone-100 my-4 sm:my-8 flex flex-col max-h-[95vh] sm:max-h-[90vh]"
          >
            <form
              onSubmit={handleSaveCategory}
              className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  اسم التصنيف بالعربية *
                </label>
                <Input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  نوع منتجات التصنيف *
                </label>
                <Select>
                  <option value="lenses">
                    عدسات لاصقة (تتطلب اختيار قياس نظر)
                  </option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  وصف التصنيف *
                </label>
                <Textarea
                  required
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </Modal>

          {/* MODAL: ADD SHIPPING RATE */}
          <Modal
            isOpen={isAddShippingOpen}
            onClose={() => setIsAddShippingOpen(false)}
            title="إضافة سعر شحن جديد"
            icon={<Plus size={16} />}
            className="relative w-full max-w-md bg-[#FFFFFF] text-stone-900 rounded-md overflow-hidden border border-stone-100 flex flex-col max-h-[95vh] sm:max-h-[90vh]"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const finalGov =
                  shippingGov === "custom" ? customGov.trim() : shippingGov;
                if (!finalGov) {
                  setAdminWarning("يرجى إدخال اسم محافظة صالح.");
                  return;
                }

                if (shippingRates.some((r) => r.governorate === finalGov)) {
                  setAdminWarning(
                    "هذه المحافظة مضافة بالفعل. يمكنك تعديل سعرها بدلاً من إضافة محافظة مكررة.",
                  );
                  return;
                }

                const newRate: ShippingRate = {
                  governorate: finalGov,
                  price: Number(shippingPrice),
                };

                onUpdateShippingRates([...shippingRates, newRate]);
                setIsAddShippingOpen(false);
                setDashboardSuccessMessage(
                  "تم إضافة سعر شحن المحافظة بنجاح! 🚚",
                );
                setTimeout(() => setDashboardSuccessMessage(null), 4000);
              }}
              className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  المحافظة *
                </label>
                <Select
                  required
                  value={shippingGov}
                  onChange={(e) => setShippingGov(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-stone-200 focus:border-stone-400 py-2.5 px-3 rounded-md outline-none text-xs sm:text-sm font-bold text-stone-800"
                >
                  <option value="">-- اختر المحافظة --</option>
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option
                      key={gov}
                      value={gov}
                      disabled={shippingRates.some(
                        (r) => r.governorate === gov,
                      )}
                    >
                      {gov}{" "}
                      {shippingRates.some((r) => r.governorate === gov)
                        ? "(مضافة مسبقاً)"
                        : ""}
                    </option>
                  ))}
                  <option value="custom">
                    -- محافظة أخرى (كتابة يدوية) --
                  </option>
                </Select>
              </div>

              {shippingGov === "custom" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-bold text-stone-700">
                    اسم المحافظة الأخرى *
                  </label>
                  <Input
                    type="text"
                    required
                    value={customGov}
                    onChange={(e) => setCustomGov(e.target.value)}
                    placeholder="مثال: مدينة السادات، الساحل الشمالي"
                    className="w-full bg-[#FFFFFF] border border-stone-200 focus:border-stone-400 py-2.5 px-3 rounded-md outline-none text-xs sm:text-sm font-bold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  سعر الشحن (بالجنيه المصري) *
                </label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={shippingPrice}
                  onChange={(e) => setShippingPrice(Number(e.target.value))}
                  placeholder="مثال: 50"
                  className="w-full bg-[#FFFFFF] border border-stone-200 focus:border-stone-400 py-2.5 px-3 rounded-md outline-none text-xs sm:text-sm font-bold text-stone-900 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddShippingOpen(false)}
                  className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </Modal>

          {/* MODAL: EDIT SHIPPING RATE */}
          <Modal
            isOpen={editingShipping !== null}
            onClose={() => setEditingShipping(null)}
            title={`تعديل سعر الشحن - ${editingShipping?.governorate}`}
            icon={<Edit size={16} />}
            className="relative w-full max-w-md bg-[#FFFFFF] text-stone-900 rounded-md overflow-hidden border border-stone-100 flex flex-col max-h-[95vh] sm:max-h-[90vh]"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updated = shippingRates.map((r) =>
                  r.governorate === editingShipping?.governorate
                    ? { ...r, price: Number(shippingPrice) }
                    : r,
                );
                onUpdateShippingRates(updated);
                setEditingShipping(null);
                setDashboardSuccessMessage("تم تحديث سعر الشحن بنجاح! 🚚");
                setTimeout(() => setDashboardSuccessMessage(null), 4000);
              }}
              className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-750">
                  المحافظة
                </label>
                <Input
                  type="text"
                  disabled
                  value={editingShipping?.governorate || ""}
                  className="w-full bg-stone-100 border border-stone-200 py-2.5 px-3 rounded-md outline-none text-xs sm:text-sm text-stone-600 font-extrabold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  سعر الشحن الجديد (بالجنيه المصري) *
                </label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={shippingPrice}
                  onChange={(e) => setShippingPrice(Number(e.target.value))}
                  placeholder="مثال: 50"
                  className="w-full bg-[#FFFFFF] border border-stone-200 focus:border-stone-400 py-2.5 px-3 rounded-md outline-none text-xs sm:text-sm font-bold text-stone-900 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingShipping(null)}
                  className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </Modal>

          {/* NOTIFICATION CREATION/EDIT MODAL */}
          <Modal
            isOpen={isAddNotificationOpen}
            onClose={() => {
              setIsAddNotificationOpen(false);
              setEditingNotification(null);
            }}
            title={editingNotification ? "تعديل الإشعار" : "إنشاء إشعار جديد"}
            icon={<AlertCircle size={16} />}
            className="w-full max-w-md bg-[#FFFFFF] rounded-md p-6 border border-stone-100 space-y-4 relative flex flex-col"
          >
            <form
              onSubmit={
                editingNotification
                  ? handleSaveEditNotification
                  : handleSaveNewNotification
              }
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  نص الإشعار *
                </label>
                <Textarea
                  required
                  value={notifText}
                  onChange={(e) => setNotifText(e.target.value)}
                  placeholder="اكتب نص الإشعار هنا..."
                  rows={3}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  الوقت المعروض *
                </label>
                <Input
                  type="text"
                  required
                  value={notifTime}
                  onChange={(e) => setNotifTime(e.target.value)}
                  placeholder="مثال: منذ ساعتين، منذ يوم واحد، منذ لحظات"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="notif_unread_cb"
                  checked={notifUnread}
                  onChange={(e) => setNotifUnread(e.target.checked)}
                  className="w-4 h-4 text-stone-900 focus:ring-stone-900 border-stone-300 rounded"
                />
                <label
                  htmlFor="notif_unread_cb"
                  className="text-xs font-bold text-stone-700 cursor-pointer"
                >
                  عرض كإشعار جديد غير مقروء (سيظهر نقطة التنبيه)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  {editingNotification ? "تحديث ونشر" : "إنشاء ونشر الآن"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddNotificationOpen(false);
                    setEditingNotification(null);
                  }}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </Modal>

          {/* CUSTOM WARNING/ALERT MODAL */}
          <Modal
            isOpen={adminWarning !== null}
            onClose={() => setAdminWarning(null)}
            className="w-full max-w-sm bg-[#FFFFFF] rounded-md p-6 border border-stone-100 text-center space-y-4 relative"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-stone-900">
                تنبيه من النظام
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                {adminWarning}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setAdminWarning(null)}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </div>
          </Modal>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
