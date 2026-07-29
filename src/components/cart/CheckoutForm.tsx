import React, { useState } from "react";
import {
  ArrowRight,
  MapPin,
  Phone,
  User,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { ShippingRate } from "../../types";
import { EGYPT_GOVERNORATES } from "../../data";
import { Input, Select as UISelect, Textarea } from "../ui/ui";
import { normalizePhoneNumber } from "../../utils";

interface CheckoutFormProps {
  totalAmount: number;
  shippingRates: ShippingRate[];
  onBack: () => void;
  onSubmit: (data: {
    name: string;
    phone: string;
    governorate: string;
    address: string;
    paymentMethod: string;
    shippingFee: number;
    totalWithShipping: number;
  }) => void;
}

interface FormFieldProps {
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, icon: Icon, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
        <Icon size={14} className="text-stone-700 shrink-0" />
        <span>{label}</span>
      </label>
      {children}
      {error && (
        <span className="text-[11px] text-red-600 font-bold block mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}

export default function CheckoutForm({
  totalAmount,
  shippingRates = [],
  onBack,
  onSubmit,
}: CheckoutFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Find the shipping rate for the selected governorate
  const selectedRateObj = shippingRates?.find(
    (r) => r && r.governorate === governorate,
  );
  const shippingFee = selectedRateObj ? selectedRateObj.price : 0;
  const totalWithShipping = totalAmount + shippingFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "يرجى إدخال الاسم بالكامل";
    } else if (name.trim().split(/\s+/).length < 2) {
      newErrors.name = "يرجى إدخال الاسم ثنائياً على الأقل";
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone) {
      newErrors.phone = "يرجى إدخال رقم الهاتف";
    } else if (
      !/^[0-9+]+$/.test(normalizedPhone) ||
      normalizedPhone.length < 5
    ) {
      newErrors.phone = "يرجى إدخال رقم هاتف صحيح";
    }

    if (!governorate) {
      newErrors.governorate = "يرجى اختيار المحافظة";
    }

    if (!address.trim()) {
      newErrors.address = "يرجى إدخال العنوان بالتفصيل";
    } else if (address.trim().length < 8) {
      newErrors.address = "يرجى إدخال عنوان تفصيلي واضح ليسهل التوصيل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (validateForm()) {
      const normalizedPhone = normalizePhoneNumber(phone);

      onSubmit({
        name: name.trim(),
        phone: normalizedPhone,
        governorate,
        address: address.trim(),
        paymentMethod,
        shippingFee,
        totalWithShipping,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-stone-900" dir="rtl">
      {/* Back navigation header */}
      <div className="px-4 sm:px-6 py-3 flex items-center gap-3 border-b border-stone-100 shrink-0">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-stone-100 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
          aria-label="رجوع للحقيبة"
        >
          <ArrowRight size={18} />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-stone-700 font-medium truncate">
            الخطوة الأخيرة
          </span>
          <span className="text-sm font-bold text-stone-900 truncate">
            بيانات الشحن والتوصيل
          </span>
        </div>
      </div>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
      >
        {/* Name Input */}
        <FormField
          label="الاسم بالكامل (ثنائي أو أكثر) *"
          icon={User}
          error={errors.name}
        >
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل الاسم بالكامل"
            className={
              errors.name
                ? "border-red-500 focus:border-red-600 focus:ring-red-600"
                : ""
            }
          />
        </FormField>

        {/* Phone Input */}
        <FormField label="رقم الموبايل *" icon={Phone} error={errors.phone}>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="أدخل رقم الموبايل المكون من 11 رقماً"
            className={
              errors.phone
                ? "border-red-500 focus:border-red-600 focus:ring-red-600 ltr-input"
                : "ltr-input"
            }
            dir="ltr"
          />
        </FormField>

        {/* Governorate Select */}
        <FormField label="المحافظة *" icon={MapPin} error={errors.governorate}>
          <UISelect
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            className={
              errors.governorate
                ? "border-red-500 focus:border-red-600 focus:ring-red-600"
                : ""
            }
          >
            <option value="">-- اختر المحافظة --</option>
            {shippingRates && shippingRates.length > 0
              ? shippingRates.map((rate) => (
                  <option key={rate.governorate} value={rate.governorate}>
                    {rate.governorate} (
                    {rate.price === 0 ? "شحن مجاني" : `+${rate.price} جنيه`})
                  </option>
                ))
              : EGYPT_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
          </UISelect>
        </FormField>

        {/* Address Input */}
        <FormField
          label="العنوان بالتفصيل *"
          icon={MapPin}
          error={errors.address}
        >
          <Textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="أدخل العنوان التفصيلي بالكامل"
            rows={2}
            className={
              errors.address
                ? "border-red-500 focus:border-red-600 focus:ring-red-600"
                : ""
            }
          />
        </FormField>

        {/* Payment Method Selector */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-stone-850 block">
            طريقة الدفع
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {/* Cash on Delivery */}
            <label
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                paymentMethod === "cod"
                  ? "bg-brand-cream/60 border-stone-900 ring-2 ring-stone-900/10"
                  : "bg-white border-stone-200 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="w-4 h-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                />
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-stone-900">
                    الدفع عند الاستلام (COD)
                  </span>
                  <span className="text-[10px] text-stone-600 font-medium">
                    ادفع نقدًا عند باب منزلك
                  </span>
                </div>
              </div>
              <ShieldCheck size={18} className="text-emerald-700" />
            </label>

            {/* Vodafone Cash */}
            <label
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                paymentMethod === "vodafone"
                  ? "bg-brand-cream/60 border-stone-900 ring-2 ring-stone-900/10"
                  : "bg-white border-stone-200 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "vodafone"}
                  onChange={() => setPaymentMethod("vodafone")}
                  className="w-4 h-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                />
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-stone-900">
                    فودافون كاش
                  </span>
                  <span className="text-[10px] text-stone-600 font-medium">
                    تحويل سريع لجميع المحافظ الإلكترونية
                  </span>
                </div>
              </div>
              <div className="bg-rose-50 text-rose-700 text-[9px] font-bold px-2 py-0.5 rounded-md border border-rose-200/80">
                شائع
              </div>
            </label>

            {/* Card Payment */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/50 opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  disabled
                  checked={false}
                  className="w-4 h-4 text-stone-400 border-stone-300 cursor-not-allowed"
                />
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-stone-400">
                    بطاقة بنكية (فيزا / ماستر كارد) - قريباً
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium">
                    دفع آمن بالكامل (غير متوفر حالياً)
                  </span>
                </div>
              </div>
              <CreditCard size={16} className="text-stone-400" />
            </div>
          </div>
        </div>
      </form>

      {/* Price Summary and Sticky checkout button */}
      <div className="p-4 sm:p-5 bg-[#FFFFFF] border-t border-stone-100 space-y-3 shrink-0">
        <div className="space-y-1.5 text-xs text-stone-700">
          <div className="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span className="font-semibold text-stone-900">
              {totalAmount.toFixed(2)} جنيه
            </span>
          </div>
          <div className="flex justify-between">
            <span>سعر الشحن للمحافظة:</span>
            <span className="font-semibold text-stone-900">
              {governorate
                ? `${shippingFee.toFixed(2)} جنيه`
                : "يرجى تحديد المحافظة"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs sm:text-sm text-stone-900 border-t border-stone-100 pt-2">
          <div className="flex flex-col">
            <span className="text-stone-700 text-xs font-semibold">
              المجموع الكلي
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">
              {shippingFee === 0 && governorate
                ? "شحن مجاني للمحافظة"
                : "توصيل سريع وآمن"}
            </span>
          </div>
          <span className="text-base sm:text-lg font-extrabold text-stone-900">
            {totalWithShipping.toFixed(2)} جنيه
          </span>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-stone-900 text-white hover:bg-black py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <span>تأكيد الطلب والدفع الآمن</span>
        </button>
      </div>
    </div>
  );
}
