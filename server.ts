import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import crypto from "crypto";
import compression from "compression";

import {
  ValidationError,
  validateCategory,
  validateProduct,
  validateSlide,
  validateShippingRate,
  validateContactInfo,
  validateNotification,
  validateOrder,
} from "./server/validation";

import mysql from "mysql2/promise";

import { dbState, initializeDatabase, createDatabaseSchema } from "./server/db";

import { sendMetaCAPIEvent } from "./server/capi";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  checkLoginLockout,
  registerFailedAttempt,
  resetFailedAttempts,
} from "./server/security";

dotenv.config();

const rateLimits = new Map<string, { count: number; resetTime: number }>();

// Periodic cleanup every 10 minutes to prevent memory accumulation
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimits.entries()) {
    if (now > record.resetTime) {
      rateLimits.delete(ip);
    }
  }
}, 10 * 60 * 1000);

const rateLimit = (limit: number, windowMs: number) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const ipStr = Array.isArray(ip) ? ip[0] : ip;
    const now = Date.now();
    const record = rateLimits.get(ipStr);

    if (!record || now > record.resetTime) {
      rateLimits.set(ipStr, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > limit) {
      return res.status(429).json({
        error:
          "لقد تجاوزت حد الطلبات المسموح به. يرجى المحاولة مرة أخرى لاحقاً.",
      });
    }
    next();
  };
};

const handleApiError = (res: express.Response, err: unknown) => {
  console.error("🔴 API Error:", err);
  const errorMessage = err instanceof Error ? err.message : String(err);

  if (err && typeof err === "object" && "isValidationError" in err && err.isValidationError) {
    return res.status(400).json({ error: errorMessage });
  }

  return res.status(500).json({
    error: "حدث خطأ غير متوقع في الخادم. يرجى المحاولة مرة أخرى لاحقاً.",
  });
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Enable response compression (gzip/deflate) for extremely fast loading times!
  app.use(compression());

  let currentMemoryAdminHash = hashPassword("sohaib200596");

  app.use(express.json({ limit: "20mb" }));
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"), {
      maxAge: "30d",
      immutable: true,
    }),
  );

  // Custom Security Headers (safe for iframes)
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // In-memory active session tracker
  const activeSessions = new Set<string>();

  // Helper to extract session token from cookies or Authorization header
  const getSessionToken = (req: express.Request): string | null => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce(
        (acc, cookie) => {
          const [key, val] = cookie.split("=").map((c) => c.trim());
          if (key && val) acc[key] = val;
          return acc;
        },
        {} as Record<string, string>,
      );
      return cookies["admin_session"] || null;
    }
    return null;
  };

  // Middleware to authorize only logged-in administrators
  const requireAdmin = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const token = getSessionToken(req);
    if (token && activeSessions.has(token)) {
      return next();
    }
    return res
      .status(401)
      .json({ error: "غير مصرح به! يرجى تسجيل الدخول كمسؤول." });
  };

  app.post("/api/upload", requireAdmin, (req, res) => {
    try {
      const { fileData, fileName } = req.body;
      if (!fileData || !fileName) {
        return res.status(400).json({ error: "بيانات الملف أو الاسم مفقود" });
      }

      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Secure MIME type regex check
      const matches = fileData.match(
        /^data:(image\/[A-Za-z0-9.+-]+);base64,(.+)$/,
      );
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "تنسيق الصورة غير صالح" });
      }

      const mimeType = matches[1].toLowerCase();
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];
      if (!allowedMimeTypes.includes(mimeType)) {
        return res
          .status(400)
          .json({ error: "نوع الملف غير مدعوم. يرجى رفع صورة صالحة فقط." });
      }

      const imageBuffer = Buffer.from(matches[2], "base64");

      // Limit file size strictly to 10MB
      if (imageBuffer.length > 10 * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "حجم الصورة يجب ألا يتجاوز 10 ميجابايت" });
      }

      const rawExt = path.extname(fileName).toLowerCase() || ".jpg";
      const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".svg",
      ];
      const ext = allowedExtensions.includes(rawExt) ? rawExt : ".jpg";

      const uniqueFileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(filePath, imageBuffer);

      res.json({ success: true, url: `/uploads/${uniqueFileName}` });
    } catch (_err: unknown) {
      res
        .status(500)
        .json({ error: _err instanceof Error ? _err.message : "Error" });
    }
  });

  // Initialize Database state
  await initializeDatabase();

  app.get("/api/config", (req, res) => {
    let databaseName = "Local-Memory Fallback";
    if (dbState.useMySQL) {
      databaseName = process.env.MYSQL_DATABASE || "";
      const configPath = path.join(process.cwd(), "database_config.json");
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
          if (config.database) databaseName = config.database;
        } catch {
          // ignore
        }
      }
    }

    res.json({
      mysqlConnected: dbState.useMySQL,
      database: databaseName,
      dbError: dbState.dbError,
      dbConfigured:
        !!(
          process.env.MYSQL_HOST &&
          process.env.MYSQL_USER &&
          process.env.MYSQL_DATABASE
        ) || fs.existsSync(path.join(process.cwd(), "database_config.json")),
    });
  });

  app.get("/api/db-config", requireAdmin, (req, res) => {
    let mysqlHost = process.env.MYSQL_HOST || "";
    let mysqlUser = process.env.MYSQL_USER || "";
    let mysqlDatabase = process.env.MYSQL_DATABASE || "";
    let mysqlPort = process.env.MYSQL_PORT || "3306";
    let hasPassword = !!process.env.MYSQL_PASSWORD;

    const configPath = path.join(process.cwd(), "database_config.json");
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (config.host) mysqlHost = config.host;
        if (config.user) mysqlUser = config.user;
        if (config.database) mysqlDatabase = config.database;
        if (config.port) mysqlPort = String(config.port);
        if (config.password !== undefined) hasPassword = !!config.password;
      } catch {
        // ignore
      }
    }

    res.json({
      host: mysqlHost,
      user: mysqlUser,
      database: mysqlDatabase,
      port: mysqlPort,
      hasPassword,
    });
  });

  app.post("/api/db-config", requireAdmin, async (req, res) => {
    const { host, user, password, database, port } = req.body;

    if (!host || !user || !database) {
      return res
        .status(400)
        .json({
          error: "اسم المضيف، اسم المستخدم، واسم قاعدة البيانات حقول مطلوبة.",
        });
    }

    const parsedPort = parseInt(port) || 3306;

    let finalPassword = password;
    if (password === undefined || password === "") {
      const configPath = path.join(process.cwd(), "database_config.json");
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
          finalPassword = config.password || process.env.MYSQL_PASSWORD || "";
        } catch {
          finalPassword = process.env.MYSQL_PASSWORD || "";
        }
      } else {
        finalPassword = process.env.MYSQL_PASSWORD || "";
      }
    }

    try {
      // 1. Create temporary pool to test connection
      const testPool = mysql.createPool({
        host,
        user,
        password: finalPassword,
        database,
        port: parsedPort,
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0,
        connectTimeout: 5000,
      });

      const conn = await testPool.getConnection();
      conn.release();
      await testPool.end();

      // 2. Connection successful! Save to file database_config.json
      const configPath = path.join(process.cwd(), "database_config.json");
      fs.writeFileSync(
        configPath,
        JSON.stringify(
          {
            host,
            user,
            password: finalPassword,
            database,
            port: parsedPort,
          },
          null,
          2,
        ),
      );

      // 3. Close old pool if exists and replace with new pool
      if (dbState.pool) {
        await dbState.pool.end().catch(() => {});
      }

      dbState.pool = mysql.createPool({
        host,
        user,
        password: finalPassword,
        database,
        port: parsedPort,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      dbState.useMySQL = true;
      dbState.dbError = null;

      // 4. Create Tables and Seed!
      await createDatabaseSchema(dbState.pool);

      res.json({
        success: true,
        message: "تم الاتصال بقاعدة بيانات Hostinger وحفظ الإعدادات بنجاح!",
      });
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      console.error("❌ Test connection to Hostinger MySQL failed:", err);
      res.status(400).json({
        error: `فشل الاتصال بقاعدة البيانات: ${errorObj?.message || String(err)}`,
      });
    }
  });

  // Login API with enhanced security (lockout, rate-limiting, and PBKDF2 hashing)
  app.post("/api/login", rateLimit(10, 60 * 1000), async (req, res) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const ipStr = Array.isArray(ip) ? ip[0] : ip;

    try {
      // 1. Check brute force lockout
      const lockoutStatus = checkLoginLockout(ipStr);
      if (lockoutStatus.locked) {
        return res.status(429).json({
          success: false,
          error: `لقد تم حظر محاولات تسجيل الدخول مؤقتاً من عنوان IP الخاص بك بسبب محاولات فاشلة متكررة. يرجى الانتظار لمدة ${lockoutStatus.timeLeftMinutes} دقيقة قبل المحاولة مرة أخرى.`,
        });
      }

      const { username, password } = req.body;
      if (typeof username !== "string" || typeof password !== "string") {
        throw new ValidationError("بيانات غير صالحة.");
      }
      const cleanUsername = username.trim().substring(0, 100);
      const cleanPassword = password.substring(0, 255);
      if (!cleanUsername || !cleanPassword) {
        throw new ValidationError("اسم المستخدم وكلمة المرور مطلوبة.");
      }

      let loginSuccess = false;
      let userData = { username: "sohaib200596@gmail.com", role: "admin" };

      if (dbState.useMySQL && dbState.pool) {
        // Query user by username only to avoid password-based query logic
        const [rows] = await dbState.pool.query(
          "SELECT * FROM users WHERE username = ?",
          [cleanUsername],
        );
        const users = rows as Array<Record<string, unknown>>;
        if (users.length > 0) {
          const user = users[0];
          // Timing-safe password verification
          const isMatch = verifyPassword(cleanPassword, String(user.password || ""));
          if (isMatch) {
            userData = { username: user.username, role: user.role };
            loginSuccess = true;
          }
        }
      } else {
        // Fallback safely to memory credentials using secure hashed verification
        if (
          cleanUsername === "sohaib200596@gmail.com" &&
          verifyPassword(cleanPassword, currentMemoryAdminHash)
        ) {
          loginSuccess = true;
        }
      }

      if (loginSuccess) {
        // Reset failed attempts upon successful authentication
        resetFailedAttempts(ipStr);

        // Generate a high-entropy crypto token
        const token = generateSessionToken();
        activeSessions.add(token);

        res.cookie("admin_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.json({
          success: true,
          token,
          user: userData,
        });
      } else {
        // Register failed attempt and determine if a lockout should trigger
        const failStatus = registerFailedAttempt(ipStr);
        if (failStatus.locked) {
          return res.status(429).json({
            success: false,
            error:
              "لقد تم حظر محاولات تسجيل الدخول مؤقتاً من عنوان IP الخاص بك بسبب 5 محاولات فاشلة متتالية. يرجى المحاولة مرة أخرى بعد 15 دقيقة.",
          });
        }

        res.status(401).json({
          success: false,
          error: "اسم المستخدم أو كلمة المرور غير صحيحة!",
        });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  // Logout API
  app.post("/api/logout", (req, res) => {
    const token = getSessionToken(req);
    if (token) {
      activeSessions.delete(token);
    }
    res.clearCookie("admin_session");
    res.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
  });

  // Change Password API for administrators
  app.post("/api/admin/change-password", requireAdmin, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (
        typeof currentPassword !== "string" ||
        typeof newPassword !== "string"
      ) {
        throw new ValidationError("بيانات غير صالحة.");
      }

      const cleanCurrent = currentPassword.substring(0, 255);
      const cleanNew = newPassword.substring(0, 255);

      if (!cleanCurrent || !cleanNew) {
        throw new ValidationError("كلمة المرور الحالية والجديدة حقول مطلوبة.");
      }
      if (cleanNew.length < 6) {
        throw new ValidationError(
          "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.",
        );
      }

      const adminUsername = "sohaib200596@gmail.com";

      if (dbState.useMySQL && dbState.pool) {
        // Fetch current password from database
        const [rows] = await dbState.pool.query(
          "SELECT * FROM users WHERE username = ?",
          [adminUsername],
        );
        const users = rows as Array<Record<string, unknown>>;
        if (users.length === 0) {
          return res.status(404).json({ error: "المستخدم غير موجود." });
        }

        const user = users[0];
        const isMatch = verifyPassword(cleanCurrent, String(user.password || ""));
        if (!isMatch) {
          return res
            .status(400)
            .json({ error: "كلمة المرور الحالية غير صحيحة." });
        }

        // Hash new password and update in database
        const newHashed = hashPassword(cleanNew);
        await dbState.pool.query(
          "UPDATE users SET password = ? WHERE username = ?",
          [newHashed, adminUsername],
        );

        res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح!" });
      } else {
        // Fallback safely for memory mode (re-hash the fallback password)
        if (!verifyPassword(cleanCurrent, currentMemoryAdminHash)) {
          return res
            .status(400)
            .json({ error: "كلمة المرور الحالية غير صحيحة." });
        }

        // Update memory hash
        currentMemoryAdminHash = hashPassword(cleanNew);
        res.json({
          success: true,
          message: "تم تغيير كلمة المرور بنجاح (وضع الحفظ المحلي)!",
        });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  // 1. Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      if (dbState.useMySQL && dbState.pool) {
        const [rows] = await dbState.pool.query("SELECT * FROM categories");
        res.json(rows);
      } else {
        res.json(dbState.categories);
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const validated = validateCategory(req.body);
      const { id, name, description, type } = validated;
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query(
          "INSERT INTO categories (id, name, description, type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, description=?, type=?",
          [id, name, description, type, name, description, type],
        );
        res.json({ success: true });
      } else {
        const idx = dbState.categories.findIndex((c) => c.id === id);
        if (idx > -1) {
          dbState.categories[idx] = { id, name, description, type };
        } else {
          dbState.categories.push({ id, name, description, type });
        }
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string" || !id.trim() || id.length > 50) {
        throw new ValidationError("معرّف القسم غير صالح.");
      }
      const cleanId = id.trim();
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query("DELETE FROM categories WHERE id=?", [
          cleanId,
        ]);
        res.json({ success: true });
      } else {
        dbState.categories = dbState.categories.filter((c) => c.id !== cleanId);
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  // 2. Slides API
  app.get("/api/slides", async (req, res) => {
    try {
      if (dbState.useMySQL && dbState.pool) {
        const [rows] = await dbState.pool.query(
          "SELECT * FROM slides ORDER BY id ASC",
        );
        res.json(rows);
      } else {
        res.json(dbState.slides);
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/slides", requireAdmin, async (req, res) => {
    try {
      const validated = validateSlide(req.body);
      const { id, title1, title2, subtitle, buttonText, image } = validated;
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query(
          "INSERT INTO slides (id, title1, title2, subtitle, buttonText, image) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title1=?, title2=?, subtitle=?, buttonText=?, image=?",
          [
            id,
            title1,
            title2,
            subtitle,
            buttonText,
            image,
            title1,
            title2,
            subtitle,
            buttonText,
            image,
          ],
        );
        res.json({ success: true });
      } else {
        const idx = dbState.slides.findIndex((s) => s.id === id);
        if (idx > -1) {
          dbState.slides[idx] = {
            id,
            title1,
            title2,
            subtitle,
            buttonText,
            image,
          };
        } else {
          dbState.slides.push({
            id,
            title1,
            title2,
            subtitle,
            buttonText,
            image,
          });
        }
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.delete("/api/slides/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new ValidationError("معرّف البنر غير صالح.");
      }
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query("DELETE FROM slides WHERE id=?", [numericId]);
        res.json({ success: true });
      } else {
        dbState.slides = dbState.slides.filter((s) => s.id !== numericId);
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  // 3. Products API
  app.get("/api/products", async (req, res) => {
    try {
      if (dbState.useMySQL && dbState.pool) {
        const [rows] = await dbState.pool.query("SELECT * FROM products");
        const formatted = (rows as Array<Record<string, unknown>>).map((r) => ({
          ...r,
          id: Number(r.id),
          price: Number(r.price),
          oldPrice:
            r.oldPrice !== null && r.oldPrice !== undefined
              ? Number(r.oldPrice)
              : undefined,
          badgeText: r.badgeText || undefined,
          waterContent: r.waterContent || "",
          diameter: r.diameter || "",
          duration: r.duration || "",
          isNew: !!r.isNew,
        }));
        res.json(formatted);
      } else {
        res.json(dbState.products);
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const validated = validateProduct(req.body);
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
      } = validated;
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query(
          `INSERT INTO products (id, name, price, oldPrice, badgeText, category, description, image, waterContent, diameter, duration, isNew) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE name=?, price=?, oldPrice=?, badgeText=?, category=?, description=?, image=?, waterContent=?, diameter=?, duration=?, isNew=?`,
          [
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
            isNew ? 1 : 0,
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
            isNew ? 1 : 0,
          ],
        );
        res.json({ success: true });
      } else {
        const idx = dbState.products.findIndex((p) => p.id === id);
        const formattedProduct = {
          id,
          name,
          price,
          oldPrice: oldPrice || undefined,
          badgeText: badgeText || undefined,
          category,
          description,
          image,
          waterContent,
          diameter,
          duration,
          isNew,
        };
        if (idx > -1) {
          dbState.products[idx] = formattedProduct;
        } else {
          dbState.products.push(formattedProduct);
        }
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        throw new ValidationError("معرّف المنتج غير صالح.");
      }
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query("DELETE FROM products WHERE id=?", [id]);
        res.json({ success: true });
      } else {
        dbState.products = dbState.products.filter((p) => p.id !== id);
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  // 4. Shipping Rates API
  app.get("/api/shipping-rates", async (req, res) => {
    try {
      if (dbState.useMySQL && dbState.pool) {
        const [rows] = await dbState.pool.query("SELECT * FROM shipping_rates");
        const formatted = (rows as Array<Record<string, unknown>>).map((r) => ({
          ...r,
          price: Number(r.price),
        }));
        res.json(formatted);
      } else {
        res.json(dbState.shippingRates);
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/shipping-rates", requireAdmin, async (req, res) => {
    try {
      const validated = validateShippingRate(req.body);
      const { governorate, price } = validated;
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query(
          "INSERT INTO shipping_rates (governorate, price) VALUES (?, ?) ON DUPLICATE KEY UPDATE price=?",
          [governorate, price, price],
        );
        res.json({ success: true });
      } else {
        const idx = dbState.shippingRates.findIndex(
          (r) => r.governorate === governorate,
        );
        if (idx > -1) {
          dbState.shippingRates[idx].price = price;
        } else {
          dbState.shippingRates.push({ governorate, price });
        }
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.delete(
    "/api/shipping-rates/:governorate",
    requireAdmin,
    async (req, res) => {
      try {
        const { governorate } = req.params;
        if (
          typeof governorate !== "string" ||
          !governorate.trim() ||
          governorate.length > 100
        ) {
          throw new ValidationError("اسم المحافظة غير صالح.");
        }
        const cleanGov = governorate.trim();
        if (dbState.useMySQL && dbState.pool) {
          await dbState.pool.query(
            "DELETE FROM shipping_rates WHERE governorate = ?",
            [cleanGov],
          );
          res.json({ success: true });
        } else {
          dbState.shippingRates = dbState.shippingRates.filter(
            (r) => r.governorate !== cleanGov,
          );
          res.json({ success: true });
        }
      } catch (_err: unknown) {
        handleApiError(res, _err);
      }
    },
  );

  // 5. Contact Info API
  app.get("/api/contact-info", async (req, res) => {
    try {
      if (dbState.useMySQL && dbState.pool) {
        const [rows] = await dbState.pool.query(
          "SELECT * FROM contact_info LIMIT 1",
        );
        if ((rows as Array<Record<string, unknown>>).length > 0) {
          res.json((rows as Array<Record<string, unknown>>)[0]);
        } else {
          res.json(dbState.contactInfo);
        }
      } else {
        res.json(dbState.contactInfo);
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/contact-info", requireAdmin, async (req, res) => {
    try {
      const validated = validateContactInfo(req.body);
      const { whatsapp, phone, email, instagram, facebook, globalSite } =
        validated;
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query(
          `INSERT INTO contact_info (id, whatsapp, phone, email, instagram, facebook, globalSite) 
           VALUES (1, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE whatsapp=?, phone=?, email=?, instagram=?, facebook=?, globalSite=?`,
          [
            whatsapp,
            phone,
            email,
            instagram,
            facebook,
            globalSite,
            whatsapp,
            phone,
            email,
            instagram,
            facebook,
            globalSite,
          ],
        );
        res.json({ success: true });
      } else {
        dbState.contactInfo = {
          whatsapp,
          phone,
          email,
          instagram,
          facebook,
          globalSite,
        };
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  // 6. Notifications API
  app.get("/api/notifications", requireAdmin, async (req, res) => {
    try {
      if (dbState.useMySQL && dbState.pool) {
        const [rows] = await dbState.pool.query(
          "SELECT * FROM notifications ORDER BY id DESC",
        );
        const formatted = (rows as Array<Record<string, unknown>>).map((r) => ({
          ...r,
          id: Number(r.id),
          unread: !!r.unread,
        }));
        res.json(formatted);
      } else {
        res.json(dbState.notifications);
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/notifications", requireAdmin, async (req, res) => {
    try {
      const validated = validateNotification(req.body);
      const { text, time, unread } = validated;
      if (dbState.useMySQL && dbState.pool) {
        const [result] = await dbState.pool.query(
          "INSERT INTO notifications (text, time, unread) VALUES (?, ?, ?)",
          [text, time, unread ? 1 : 0],
        );
        res.json({ success: true, id: (result as unknown as { insertId: number }).insertId });
      } else {
        const newId =
          dbState.notifications.length > 0
            ? Math.max(...dbState.notifications.map((n) => n.id)) + 1
            : 1;
        const newNotif = { id: newId, text, time, unread };
        dbState.notifications.unshift(newNotif);
        res.json({ success: true, id: newId });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/notifications/:id/read", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        throw new ValidationError("معرّف التنبيه غير صالح.");
      }
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query(
          "UPDATE notifications SET unread = 0 WHERE id = ?",
          [id],
        );
        res.json({ success: true });
      } else {
        dbState.notifications = dbState.notifications.map((n) =>
          n.id === id ? { ...n, unread: false } : n,
        );
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/notifications/read-all", requireAdmin, async (req, res) => {
    try {
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query("UPDATE notifications SET unread = 0");
        res.json({ success: true });
      } else {
        dbState.notifications = dbState.notifications.map((n) => ({
          ...n,
          unread: false,
        }));
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.put("/api/notifications/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        throw new ValidationError("معرّف التنبيه غير صالح.");
      }
      const validated = validateNotification(req.body);
      const { text, time, unread } = validated;
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query(
          "UPDATE notifications SET text = ?, time = ?, unread = ? WHERE id = ?",
          [text, time, unread ? 1 : 0, id],
        );
        res.json({ success: true });
      } else {
        const idx = dbState.notifications.findIndex((n) => n.id === id);
        if (idx > -1) {
          dbState.notifications[idx] = { id, text, time, unread };
        }
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.delete("/api/notifications/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        throw new ValidationError("معرّف التنبيه غير صالح.");
      }
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query("DELETE FROM notifications WHERE id = ?", [
          id,
        ]);
        res.json({ success: true });
      } else {
        dbState.notifications = dbState.notifications.filter(
          (n) => n.id !== id,
        );
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  // 7. Orders API
  app.get("/api/orders", requireAdmin, async (req, res) => {
    try {
      if (dbState.useMySQL && dbState.pool) {
        const [ordersRows] = await dbState.pool.query(
          "SELECT * FROM orders ORDER BY date DESC, id DESC",
        );
        const [itemsRows] = await dbState.pool.query(
          "SELECT * FROM order_items",
        );

        const itemsByOrderId: Record<string, Array<Record<string, unknown>>> = {};
        for (const item of itemsRows as Array<Record<string, unknown>>) {
          if (!itemsByOrderId[String(item.orderId)]) {
            itemsByOrderId[String(item.orderId)] = [];
          }
          itemsByOrderId[String(item.orderId)].push({
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            power: item.power,
          });
        }

        const formattedOrders = (ordersRows as Array<Record<string, unknown>>).map((o) => ({
          id: o.id,
          date: o.date,
          customerName: o.customerName,
          phone: o.phone,
          governorate: o.governorate,
          address: o.address,
          paymentMethod: o.paymentMethod,
          shippingFee: o.shippingFee ? Number(o.shippingFee) : undefined,
          total: Number(o.total),
          status: o.status,
          items: itemsByOrderId[o.id] || [],
        }));

        res.json(formattedOrders);
      } else {
        res.json(dbState.orders);
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/orders", rateLimit(5, 5 * 60 * 1000), async (req, res) => {
    try {
      const validated = validateOrder(req.body);
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
      } = validated;
      if (dbState.useMySQL && dbState.pool) {
        const connection = await dbState.pool.getConnection();
        try {
          await connection.beginTransaction();
          await connection.query(
            `INSERT INTO orders (id, date, customerName, phone, governorate, address, paymentMethod, shippingFee, total, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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
            ],
          );

          for (const item of items) {
            await connection.query(
              `INSERT INTO order_items (orderId, name, price, quantity, power) 
               VALUES (?, ?, ?, ?, ?)`,
              [id, item.name, item.price, item.quantity, item.power],
            );
          }

          await connection.commit();

          // Trigger Meta Conversions API (CAPI) Purchase Event asynchronously
          try {
            const cookieHeader = req.headers.cookie;
            let fbc: string | undefined;
            let fbp: string | undefined;
            if (cookieHeader) {
              const cookies = cookieHeader.split(";").reduce(
                (acc, cookie) => {
                  const [key, val] = cookie.split("=").map((c) => c.trim());
                  if (key && val) acc[key] = val;
                  return acc;
                },
                {} as Record<string, string>,
              );
              fbc = cookies["_fbc"];
              fbp = cookies["_fbp"];
            }

            const ip = req.ip || req.headers["x-forwarded-for"] || "";
            const ipStr = Array.isArray(ip) ? ip[0] : ip;
            const userAgent = req.headers["user-agent"] || "";

            sendMetaCAPIEvent({
              eventName: "Purchase",
              eventSourceUrl:
                req.headers.referer ||
                `${process.env.APP_URL || "https://linalenses.com"}/checkout`,
              clientIpAddress: ipStr,
              clientUserAgent: userAgent,
              fbc,
              fbp,
              customerData: {
                customerName,
                phone,
                state: governorate,
                city: governorate,
              },
              customData: {
                value: total,
                currency: "EGP",
                contentType: "product",
                contents: items.map((item: { name: string; quantity: number; price: number }) => ({
                  id: item.name,
                  quantity: item.quantity,
                  item_price: item.price,
                })),
                contentIds: items.map((item: { name: string }) => item.name),
              },
            }).catch((err) =>
              console.error(
                "⚠️ Failed to send Purchase event to Meta CAPI:",
                err,
              ),
            );
          } catch (capiErr) {
            console.error(
              "⚠️ Error preparing Meta CAPI Purchase event:",
              capiErr,
            );
          }

          res.json({ success: true, orderId: id });
        } catch (innerErr) {
          await connection.rollback();
          throw innerErr;
        } finally {
          connection.release();
        }
      } else {
        const newOrder = {
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
        };
        dbState.orders.unshift(newOrder);

        // Trigger Meta Conversions API (CAPI) Purchase Event asynchronously for local memory fallback mode too
        try {
          const cookieHeader = req.headers.cookie;
          let fbc: string | undefined;
          let fbp: string | undefined;
          if (cookieHeader) {
            const cookies = cookieHeader.split(";").reduce(
              (acc, cookie) => {
                const [key, val] = cookie.split("=").map((c) => c.trim());
                if (key && val) acc[key] = val;
                return acc;
              },
              {} as Record<string, string>,
            );
            fbc = cookies["_fbc"];
            fbp = cookies["_fbp"];
          }

          const ip = req.ip || req.headers["x-forwarded-for"] || "";
          const ipStr = Array.isArray(ip) ? ip[0] : ip;
          const userAgent = req.headers["user-agent"] || "";

          sendMetaCAPIEvent({
            eventName: "Purchase",
            eventSourceUrl:
              req.headers.referer ||
              `${process.env.APP_URL || "https://linalenses.com"}/checkout`,
            clientIpAddress: ipStr,
            clientUserAgent: userAgent,
            fbc,
            fbp,
            customerData: {
              customerName,
              phone,
              state: governorate,
              city: governorate,
            },
            customData: {
              value: total,
              currency: "EGP",
              contentType: "product",
              contents: items.map((item: { name: string; quantity: number; price: number }) => ({
                id: item.name,
                quantity: item.quantity,
                item_price: item.price,
              })),
              contentIds: items.map((item: { name: string }) => item.name),
            },
          }).catch((err) =>
            console.error(
              "⚠️ Failed to send Purchase event to Meta CAPI (local mode):",
              err,
            ),
          );
        } catch (capiErr) {
          console.error(
            "⚠️ Error preparing Meta CAPI Purchase event (local mode):",
            capiErr,
          );
        }

        res.json({ success: true, orderId: id });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.post("/api/track", async (req, res) => {
    try {
      const { eventName, eventSourceUrl, customerData, customData } = req.body;
      if (!eventName) {
        return res.status(400).json({ error: "اسم الحدث مطلوب" });
      }

      const cookieHeader = req.headers.cookie;
      let fbc: string | undefined;
      let fbp: string | undefined;
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce(
          (acc, cookie) => {
            const [key, val] = cookie.split("=").map((c) => c.trim());
            if (key && val) acc[key] = val;
            return acc;
          },
          {} as Record<string, string>,
        );
        fbc = cookies["_fbc"];
        fbp = cookies["_fbp"];
      }

      const ip = req.ip || req.headers["x-forwarded-for"] || "";
      const ipStr = Array.isArray(ip) ? ip[0] : ip;
      const userAgent = req.headers["user-agent"] || "";

      // Fire asynchronously to Meta Conversions API
      sendMetaCAPIEvent({
        eventName,
        eventSourceUrl:
          eventSourceUrl || req.headers.referer || "https://linalenses.com",
        clientIpAddress: ipStr,
        clientUserAgent: userAgent,
        fbc,
        fbp,
        customerData,
        customData,
      }).catch((err) =>
        console.error(
          `⚠️ Failed to send event ${eventName} to Meta CAPI:`,
          err,
        ),
      );

      res.json({ success: true });
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.put("/api/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (typeof id !== "string" || !id.trim() || id.length > 50) {
        throw new ValidationError("معرّف الطلب غير صالح.");
      }
      if (
        typeof status !== "string" ||
        !["pending", "preparing", "shipped", "completed", "cancelled"].includes(
          status,
        )
      ) {
        throw new ValidationError("حالة الطلب غير صالحة.");
      }
      const cleanId = id.trim();
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query("UPDATE orders SET status = ? WHERE id = ?", [
          status,
          cleanId,
        ]);
        res.json({ success: true });
      } else {
        const idx = dbState.orders.findIndex((o) => o.id === cleanId);
        if (idx > -1) {
          dbState.orders[idx].status = status;
        }
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  app.delete("/api/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string" || !id.trim() || id.length > 50) {
        throw new ValidationError("معرّف الطلب غير صالح.");
      }
      const cleanId = id.trim();
      if (dbState.useMySQL && dbState.pool) {
        await dbState.pool.query("DELETE FROM orders WHERE id = ?", [cleanId]);
        res.json({ success: true });
      } else {
        const idx = dbState.orders.findIndex((o) => o.id === cleanId);
        if (idx > -1) {
          dbState.orders.splice(idx, 1);
        }
        res.json({ success: true });
      }
    } catch (_err: unknown) {
      handleApiError(res, _err);
    }
  });

  // --- VITE DEV / PRODUCTION MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        maxAge: "1d",
        etag: true,
        cacheControl: true,
        setHeaders: (res, filePath) => {
          // Vite production assets have hashed names and are immutable
          if (filePath.includes("/assets/") || filePath.includes("\\assets\\")) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
          } else {
            res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day default for other files
          }
        },
      })
    );
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${PORT} is already in use. Server may already be running.`);
      process.exit(0);
    } else {
      console.error("❌ Server error:", err);
      process.exit(1);
    }
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
