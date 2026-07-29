export class ValidationError extends Error {
  isValidationError = true;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateCategory(data: unknown) {
  const d = data as Record<string, unknown>;
  const { id, name, description, type } = d;
  if (
    typeof id !== "string" ||
    !id.trim() ||
    id.length > 50 ||
    !/^[a-zA-Z0-9-_]+$/.test(id)
  ) {
    throw new ValidationError(
      "معرّف القسم غير صالح. يجب أن يحتوي على أحرف وأرقام وعلامات - أو _ فقط وبحد أقصى 50 حرفاً.",
    );
  }
  if (typeof name !== "string" || !name.trim() || name.length > 255) {
    throw new ValidationError("اسم القسم غير صالح. يجب ألا يتجاوز 255 حرفاً.");
  }
  if (
    description &&
    (typeof description !== "string" || description.length > 1000)
  ) {
    throw new ValidationError("الوصف غير صالح. الحد الأقصى 1000 حرف.");
  }
  if (typeof type !== "string" || !type.trim() || type.length > 50) {
    throw new ValidationError("نوع القسم غير صالح.");
  }
  return {
    id: id.trim(),
    name: name.trim(),
    description: description ? description.trim() : "",
    type: type.trim(),
  };
}

export function validateProduct(data: unknown) {
  const d = data as Record<string, unknown>;
  const {
    id,
    name,
    price,
    oldPrice,
    badgeText,
    category,
    description,
    image,
    waterContent,
    diameter,
    duration,
    isNew,
  } = d;

  const parsedId = parseInt(id);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new ValidationError("معرّف المنتج غير صالح.");
  }
  if (typeof name !== "string" || !name.trim() || name.length > 255) {
    throw new ValidationError("اسم المنتج غير صالح. الحد الأقصى 255 حرفاً.");
  }
  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    throw new ValidationError("سعر المنتج غير صالح.");
  }
  if (
    typeof category !== "string" ||
    !category.trim() ||
    category.length > 50
  ) {
    throw new ValidationError("القسم المختار غير صالح.");
  }
  if (
    typeof description !== "string" ||
    !description.trim() ||
    description.length > 5000
  ) {
    throw new ValidationError("وصف المنتج غير صالح. الحد الأقصى 5000 حرف.");
  }
  if (typeof image !== "string" || !image.trim() || image.length > 500) {
    throw new ValidationError("مسار الصورة غير صالح.");
  }
  if (image.includes("..")) {
    throw new ValidationError("مسار الصورة غير آمن.");
  }

  const parsedOldPrice =
    oldPrice !== undefined && oldPrice !== null && oldPrice !== ""
      ? Number(oldPrice)
      : null;

  return {
    id: parsedId,
    name: name.trim(),
    price: parsedPrice,
    oldPrice: parsedOldPrice,
    badgeText: badgeText ? String(badgeText).trim().substring(0, 100) : null,
    category: category.trim(),
    description: description.trim(),
    image: image.trim(),
    waterContent: waterContent
      ? String(waterContent).trim().substring(0, 50)
      : null,
    diameter: diameter ? String(diameter).trim().substring(0, 50) : null,
    duration: duration ? String(duration).trim().substring(0, 100) : null,
    isNew: !!isNew,
  };
}

export function validateSlide(data: unknown) {
  const d = data as Record<string, unknown>;
  const { id, title1, title2, subtitle, buttonText, image } = d;
  const parsedId = parseInt(id);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new ValidationError("معرّف الشريحة غير صالح.");
  }
  if (typeof title1 !== "string" || !title1.trim() || title1.length > 255) {
    throw new ValidationError("العنوان الرئيسي الأول غير صالح.");
  }
  if (typeof title2 !== "string" || !title2.trim() || title2.length > 255) {
    throw new ValidationError("العنوان الرئيسي الثاني غير صالح.");
  }
  if (
    typeof subtitle !== "string" ||
    !subtitle.trim() ||
    subtitle.length > 1000
  ) {
    throw new ValidationError("العنوان الفرعي غير صالح.");
  }
  if (
    typeof buttonText !== "string" ||
    !buttonText.trim() ||
    buttonText.length > 100
  ) {
    throw new ValidationError("نص الزر غير صالح.");
  }
  if (
    typeof image !== "string" ||
    !image.trim() ||
    image.length > 500 ||
    image.includes("..")
  ) {
    throw new ValidationError("مسار الصورة غير صالح أو غير آمن.");
  }
  return {
    id: parsedId,
    title1: title1.trim(),
    title2: title2.trim(),
    subtitle: subtitle.trim(),
    buttonText: buttonText.trim(),
    image: image.trim(),
  };
}

export function validateShippingRate(data: unknown) {
  const d = data as Record<string, unknown>;
  const { governorate, price } = d;
  if (
    typeof governorate !== "string" ||
    !governorate.trim() ||
    governorate.length > 100
  ) {
    throw new ValidationError("اسم المحافظة غير صالح.");
  }
  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    throw new ValidationError("سعر الشحن غير صالح.");
  }
  return {
    governorate: governorate.trim(),
    price: parsedPrice,
  };
}

export function validateContactInfo(data: unknown) {
  const d = data as Record<string, unknown>;
  const { whatsapp, phone, email, instagram, facebook, globalSite } = d;
  if (typeof whatsapp !== "string" || whatsapp.length > 50) {
    throw new ValidationError("رقم الواتساب غير صالح.");
  }
  if (typeof phone !== "string" || phone.length > 50) {
    throw new ValidationError("رقم الهاتف غير صالح.");
  }
  if (typeof email !== "string" || email.length > 100) {
    throw new ValidationError("البريد الإلكتروني غير صالح.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("صيغة البريد الإلكتروني غير صالحة.");
  }
  if (typeof instagram !== "string" || instagram.length > 255) {
    throw new ValidationError("رابط انستجرام غير صالح.");
  }
  if (facebook && (typeof facebook !== "string" || facebook.length > 255)) {
    throw new ValidationError("رابط فيسبوك غير صالح.");
  }
  if (typeof globalSite !== "string" || globalSite.length > 255) {
    throw new ValidationError("رابط الموقع غير صالح.");
  }
  return {
    whatsapp: whatsapp.trim(),
    phone: phone.trim(),
    email: email.trim(),
    instagram: instagram.trim(),
    facebook: facebook ? facebook.trim() : "",
    globalSite: globalSite.trim(),
  };
}

export function validateNotification(data: unknown) {
  const d = data as Record<string, unknown>;
  const { text, time, unread } = d;
  if (typeof text !== "string" || !text.trim() || text.length > 1000) {
    throw new ValidationError("نص التنبيه غير صالح.");
  }
  if (typeof time !== "string" || !time.trim() || time.length > 100) {
    throw new ValidationError("توقيت التنبيه غير صالح.");
  }
  return {
    text: text.trim(),
    time: time.trim(),
    unread: !!unread,
  };
}

export function validateOrder(data: unknown) {
  const d = data as Record<string, unknown>;
  const {
    id,
    date,
    customerName,
    phone,
    governorate,
    address,
    paymentMethod,
    shippingFee,
    total,
    status,
    items,
  } = d;

  if (typeof id !== "string" || !id.trim() || id.length > 50) {
    throw new ValidationError("معرّف الطلب غير صالح.");
  }
  if (typeof date !== "string" || !date.trim() || date.length > 50) {
    throw new ValidationError("تاريخ الطلب غير صالح.");
  }
  if (
    typeof customerName !== "string" ||
    !customerName.trim() ||
    customerName.length > 255
  ) {
    throw new ValidationError("اسم العميل غير صالح. يجب ألا يتجاوز 255 حرفاً.");
  }
  if (typeof phone !== "string" || !phone.trim() || phone.length > 50) {
    throw new ValidationError("رقم الهاتف غير صالح. يجب ألا يتجاوز 50 حرفاً.");
  }
  if (
    typeof governorate !== "string" ||
    !governorate.trim() ||
    governorate.length > 100
  ) {
    throw new ValidationError("المحافظة غير صالحة.");
  }
  if (typeof address !== "string" || !address.trim() || address.length > 1000) {
    throw new ValidationError(
      "العنوان التفصيلي غير صالح. يجب ألا يتجاوز 1000 حرفاً.",
    );
  }
  if (
    typeof paymentMethod !== "string" ||
    ![
      "cod",
      "vodafone",
      "card",
      "الدفع عند الاستلام",
      "فودافون كاش",
      "بطاقة بنكية",
    ].includes(paymentMethod)
  ) {
    throw new ValidationError("طريقة الدفع غير صالحة.");
  }

  const parsedShippingFee = Number(shippingFee);
  if (isNaN(parsedShippingFee) || parsedShippingFee < 0) {
    throw new ValidationError("قيمة الشحن غير صالحة.");
  }

  const parsedTotal = Number(total);
  if (isNaN(parsedTotal) || parsedTotal <= 0) {
    throw new ValidationError("إجمالي الطلب غير صالح.");
  }

  if (
    status &&
    (typeof status !== "string" ||
      !["pending", "preparing", "shipped", "completed", "cancelled"].includes(
        status,
      ))
  ) {
    throw new ValidationError("حالة الطلب غير صالحة.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("يجب أن يحتوي الطلب على منتج واحد على الأقل.");
  }

  const validatedItems = [];
  for (const item of items) {
    if (
      typeof item.name !== "string" ||
      !item.name.trim() ||
      item.name.length > 255
    ) {
      throw new ValidationError("اسم المنتج في الطلب غير صالح.");
    }
    const itemPrice = Number(item.price);
    if (isNaN(itemPrice) || itemPrice < 0) {
      throw new ValidationError("سعر المنتج في الطلب غير صالح.");
    }
    const itemQty = parseInt(item.quantity);
    if (isNaN(itemQty) || itemQty <= 0 || itemQty > 1000) {
      throw new ValidationError("كمية المنتج غير صالحة (الحد الأقصى 1000).");
    }
    const itemPower = item.power ? String(item.power).substring(0, 50) : null;

    validatedItems.push({
      name: item.name.trim(),
      price: itemPrice,
      quantity: itemQty,
      power: itemPower,
    });
  }

  return {
    id: id.trim(),
    date: date.trim(),
    customerName: customerName.trim(),
    phone: phone.trim(),
    governorate: governorate.trim(),
    address: address.trim(),
    paymentMethod,
    shippingFee: parsedShippingFee,
    total: parsedTotal,
    status: status || "pending",
    items: validatedItems,
  };
}
