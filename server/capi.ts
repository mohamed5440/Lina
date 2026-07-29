import crypto from "crypto";

const DEFAULT_PIXEL_ID = "1024255776469535";
const DEFAULT_ACCESS_TOKEN =
  "EAAO1HZCRZABzoBSF32YeS4LQEmo9QbQqZAoAaaA72y9NVqInBZBTIrM2etNY7RJgZCux8HsOs1eMVOHZCx6Yi5jn28L7KFFL68T2HZBX85kba5Qhc9bbukPY9QSC43L1uUU0knZAkYVqnAaZAHSLUWyChyOXwueqdsSd1ZCQPSZCCmM64F0exA9GcMbZCbvMVkHnWvUDGwZDZD";

function sha256(val: string): string {
  return crypto
    .createHash("sha256")
    .update(val.trim().toLowerCase())
    .digest("hex");
}

export interface CapiEventData {
  eventName: string;
  eventSourceUrl?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
  customerData?: {
    customerName?: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
  };
  customData?: {
    value?: number;
    currency?: string;
    contents?: Array<{
      id: string;
      quantity: number;
      item_price: number;
    }>;
    contentIds?: string[];
    contentType?: string;
  };
}

export async function sendMetaCAPIEvent(event: CapiEventData) {
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN || (process.env.NODE_ENV === "production" ? "" : DEFAULT_ACCESS_TOKEN);

  if (!pixelId || !accessToken) {
    console.warn(
      "⚠️ Meta Pixel ID or Access Token is missing/not configured in environment variables. CAPI event skipped.",
    );
    return;
  }

  // Parse first and last name from customerName
  let fn: string | undefined;
  let ln: string | undefined;
  if (event.customerData?.customerName) {
    const parts = event.customerData.customerName.trim().split(/\s+/);
    if (parts.length > 0) {
      fn = parts[0];
      if (parts.length > 1) {
        ln = parts.slice(1).join(" ");
      }
    }
  }

  // Prepare hashed user data
  const userData: Record<string, any> = {};

  if (fn) {
    userData.fn = [sha256(fn)];
  }
  if (ln) {
    userData.ln = [sha256(ln)];
  }

  if (event.customerData?.phone) {
    // Sanitize phone: remove any non-digit character, e.g. spaces, symbols, plus sign.
    let cleanPhone = event.customerData.phone.replace(/\D/g, "");
    // Egypt default country prefix rule if it looks like Egyptian phone: 01xxxxxxxxx -> 201xxxxxxxxx
    if (cleanPhone.startsWith("01") && cleanPhone.length === 11) {
      cleanPhone = "20" + cleanPhone.substring(1);
    }
    userData.ph = [sha256(cleanPhone)];
  }

  if (event.customerData?.email) {
    userData.em = [sha256(event.customerData.email)];
  } else {
    // Fallback email hash as some CAPI flows perform better with at least an email or placeholder
    userData.em = [sha256("guest@linalenses.com")];
  }

  if (event.customerData?.city) {
    userData.ct = [sha256(event.customerData.city)];
  }
  if (event.customerData?.state) {
    userData.st = [sha256(event.customerData.state)];
  }

  // Pass unhashed IP, User Agent, and Cookie IDs if present
  if (event.clientIpAddress) {
    userData.client_ip_address = event.clientIpAddress;
  }
  if (event.clientUserAgent) {
    userData.client_user_agent = event.clientUserAgent;
  }
  if (event.fbc) {
    userData.fbc = event.fbc;
  }
  if (event.fbp) {
    userData.fbp = event.fbp;
  }

  // Set event_id for deduplication. For purchases, we use a structured order ID.
  const eventId =
    event.eventName === "Purchase"
      ? `purchase_${event.customData?.contentIds?.[0] || ""}_${Date.now()}`
      : `event_${event.eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: event.eventSourceUrl || "https://linalenses.com",
        action_source: "website",
        user_data: userData,
        custom_data: event.customData
          ? {
              value: event.customData.value,
              currency: event.customData.currency || "EGP",
              content_type: event.customData.contentType || "product",
              contents: event.customData.contents,
              content_ids: event.customData.contentIds,
            }
          : undefined,
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      if (result?.error?.error_subcode === 33 || result?.error?.type === "GraphMethodException") {
        console.warn(
          "⚠️ Meta CAPI Token/Pixel Notice: The configured Meta Pixel ID or Access Token is invalid or expired. Please update META_PIXEL_ID and META_ACCESS_TOKEN in environment variables.",
        );
      } else {
        console.warn("⚠️ Meta CAPI Event Notice:", result?.error?.message || result);
      }
    } else {
      console.log(
        `✅ Meta CAPI Event [${event.eventName}] sent successfully! Response:`,
        result,
      );
    }
  } catch (err) {
    console.warn("⚠️ Error sending Meta CAPI Event (network or timeout):", err instanceof Error ? err.message : err);
  }
}
