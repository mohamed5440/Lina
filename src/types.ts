export interface Slide {
  id: number;
  title1: string;
  title2: string;
  subtitle: string;
  buttonText: string;
  image: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  power?: string; // Contact lens sphere power
}

export interface NotificationItem {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  type: "lenses";
}

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  badgeText?: string;
  category: string;
  description: string;
  image: string;
  waterContent?: string;
  diameter?: string;
  duration?: string;
  isNew?: boolean;
}

export interface ShippingRate {
  governorate: string;
  price: number;
}

export interface ContactInfo {
  whatsapp: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  globalSite?: string;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  power?: string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  shippingFee?: number;
  total: number;
  status: "pending" | "preparing" | "shipped" | "completed" | "cancelled";
}
