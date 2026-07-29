import {
  Product,
  Slide,
  CartItem,
  NotificationItem,
  ShippingRate,
  ContactInfo,
  Category,
} from "./types";

import coloredLensImg from "./assets/images/colored_lens_eye_1783352024147.jpg";
import contactLensImg from "./assets/images/contact_lens_product_1783352001276.jpg";

export const SLIDES: Slide[] = [
  {
    id: 1,
    title1: "رؤيةٌ نقية،",
    title2: "راحةٌ فائقة.",
    subtitle:
      "عدسات لاصقة طبية وتجميلية معقمة، تجمع بين الجودة العالية والألوان الطبيعية في العالم العربي.",
    buttonText: "اكتشف قصة لينا",
    image: "https://i.postimg.cc/rFbs54b9/file-00000000f34c81f484ecd3e81a1ff5f3.png",
  },
  {
    id: 2,
    title1: "ألوانٌ طبيعية،",
    title2: "إطلالةٌ ساحرة.",
    subtitle:
      "مجموعة عدساتنا الملونة المستوحاة من تفاصيل الطبيعة لتعزيز جاذبية عينيك براحة مثالية وترطيب يدوم طوال اليوم.",
    buttonText: "تصفح الألوان الفاخرة",
    image: coloredLensImg,
  },
  {
    id: 3,
    title1: "ترطيبٌ فائق،",
    title2: "حمايةٌ تامة.",
    subtitle:
      "عدسات شفافة ومحاليل رعاية معززة بحمض الهيالورونيك الحيوي لترطيب مستمر وحماية قصوى للعيون الحساسة.",
    buttonText: "تسوق عدسات هايدرو",
    image: contactLensImg,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_CART: CartItem[] = [];

export const PRODUCTS: Product[] = [];

export const EGYPT_GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "القليوبية",
  "الدقهلية",
  "الغربية",
  "الشرقية",
  "المنوفية",
  "البحيرة",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "الوادي الجديد",
  "مطروح",
  "شمال سيناء",
  "جنوب سيناء",
];

export const DEFAULT_SHIPPING_RATES: ShippingRate[] = [
  { governorate: "القاهرة", price: 50 },
  { governorate: "الجيزة", price: 50 },
  { governorate: "الإسكندرية", price: 60 },
  { governorate: "القليوبية", price: 55 },
  { governorate: "الدقهلية", price: 65 },
  { governorate: "الغربية", price: 65 },
  { governorate: "الشرقية", price: 65 },
  { governorate: "البحيرة", price: 70 },
  { governorate: "المنوفية", price: 65 },
  { governorate: "كفر الشيخ", price: 65 },
  { governorate: "بورسعيد", price: 70 },
  { governorate: "السويس", price: 70 },
  { governorate: "الإسماعيلية", price: 70 },
  { governorate: "دمياط", price: 70 },
  { governorate: "الفيوم", price: 75 },
  { governorate: "بني سويف", price: 75 },
  { governorate: "المنيا", price: 80 },
  { governorate: "أسيوط", price: 85 },
  { governorate: "سوهاج", price: 90 },
  { governorate: "قنا", price: 95 },
  { governorate: "الأقصر", price: 100 },
  { governorate: "أسوان", price: 100 },
  { governorate: "مطروح", price: 90 },
  { governorate: "الوادي الجديد", price: 100 },
  { governorate: "شمال سيناء", price: 100 },
  { governorate: "البحر الأحمر", price: 100 },
  { governorate: "جنوب سيناء", price: 110 },
];

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  whatsapp: "201204356416",
  phone: "01204356416",
  email: "info@lina-lenses.com",
  instagram: "https://www.instagram.com/lina_contact_lenses?igsh=aGx0Zms3eDA2dTA2",
  facebook: "https://www.facebook.com/share/19QcqQDZp3/",
  globalSite: "https://lina-lenses.com",
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "colored",
    name: "عدسات ملونة",
    description:
      "تشكيلة من العدسات اللاصقة الملونة التجميلية الفاخرة التي تمنح عينيك مظهراً طبيعياً جذاباً.",
    type: "lenses",
  },
  {
    id: "clear",
    name: "عدسات شفافة وطبية",
    description:
      "عدسات لاصقة شفافة طبية توفر رؤية مثالية وحماية ممتازة مع ترطيب مستمر للعين.",
    type: "lenses",
  },
  {
    id: "solutions",
    name: "محاليل ومعقمات",
    description:
      "محاليل تعقيم وتنظيف وحفظ العدسات اللاصقة لضمان بقائها معقمة ورطبة دائماً.",
    type: "lenses",
  },
];
