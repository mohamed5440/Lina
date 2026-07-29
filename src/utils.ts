/**
 * Normalizes Arabic text to make search flexible and ignore letter variations.
 * E.g., احمد matches أحمد, المنصورة matches المنصوره, etc.
 */
export function normalizeArabic(text: unknown): string {
  if (text === null || text === undefined || text === "") return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ئ/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/[ًٌٍَُِّْ]/g, "") // Remove Arabic diacritics (tashkeel)
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))) // Convert Arabic numerals to English
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))); // Convert Persian numerals to English
}

/**
 * Normalizes phone numbers to a clean format.
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  // Convert Arabic and Persian numerals to English digits first
  const cleanPhone = phone
    .trim()
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  let normalizedPhone = cleanPhone.replace(/[\s\-()]/g, "");
  if (normalizedPhone.startsWith("+20")) {
    normalizedPhone = "0" + normalizedPhone.slice(3);
  } else if (normalizedPhone.startsWith("0020")) {
    normalizedPhone = "0" + normalizedPhone.slice(4);
  } else if (
    normalizedPhone.startsWith("20") &&
    normalizedPhone.length === 12
  ) {
    normalizedPhone = "0" + normalizedPhone.slice(2);
  } else if (normalizedPhone.startsWith("+2")) {
    normalizedPhone = "0" + normalizedPhone.slice(2);
  } else if (normalizedPhone.startsWith("002")) {
    normalizedPhone = "0" + normalizedPhone.slice(3);
  }
  return normalizedPhone;
}

/**
 * Triggers Meta Pixel and server-side Conversions API (CAPI) proxy tracking.
 */
export function trackEvent(
  eventName: string,
  customData?: {
    value?: number;
    currency?: string;
    contentIds?: string[];
    contents?: Array<{ id: string; quantity: number; item_price?: number }>;
    contentName?: string;
    contentType?: string;
    [key: string]: any;
  },
  customerData?: {
    customerName?: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
  },
) {
  // 1. Client-side Meta Pixel (if enabled/loaded)
  if (typeof window !== "undefined" && (window as any).fbq) {
    try {
      (window as any).fbq("track", eventName, {
        value: customData?.value,
        currency: customData?.currency || "EGP",
        content_ids: customData?.contentIds,
        content_name: customData?.contentName,
        content_type: customData?.contentType || "product",
        contents: customData?.contents,
      });
    } catch (e) {
      console.warn("⚠️ Client-side Pixel tracking error:", e);
    }
  }

  // 2. Server-side Proxy Conversions API (CAPI)
  fetch("/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventName,
      eventSourceUrl:
        typeof window !== "undefined" ? window.location.href : undefined,
      customData: customData
        ? {
            value: customData.value,
            currency: customData.currency || "EGP",
            contentIds: customData.contentIds,
            contentType: customData.contentType || "product",
            contents: customData.contents,
          }
        : undefined,
      customerData,
    }),
  }).catch((err) => {
    console.error("⚠️ Server-side CAPI proxy tracking error:", err);
  });
}
