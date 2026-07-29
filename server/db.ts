import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { hashPassword } from "./security";
import {
  Category,
  Slide,
  Product,
  ShippingRate,
  ContactInfo,
  NotificationItem,
  Order,
} from "../src/types";

export interface DBState {
  pool: mysql.Pool | null;
  useMySQL: boolean;
  dbError: string | null;
  categories: Category[];
  slides: Slide[];
  products: Product[];
  shippingRates: ShippingRate[];
  contactInfo: ContactInfo;
  notifications: NotificationItem[];
  orders: Order[];
}

export const dbState: DBState = {
  pool: null,
  useMySQL: false,
  dbError: null,

  categories: [
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
  ],

  slides: [
    {
      id: 1,
      title1: "رؤيةٌ نقية،",
      title2: "راحةٌ فائقة.",
      subtitle:
        "عدسات لاصقة طبية وتجميلية معقمة، تجمع بين الجودة العالية والألوان الطبيعية في العالم العربي.",
      buttonText: "اكتشف قصة لينا",
      image: "/uploads/1.png",
    },
    {
      id: 2,
      title1: "ألوانٌ طبيعية،",
      title2: "إطلالةٌ ساحرة.",
      subtitle:
        "مجموعة عدساتنا الملونة المستوحاة من تفاصيل الطبيعة لتعزيز جاذبية عينيك براحة مثالية وترطيب يدوم طوال اليوم.",
      buttonText: "تصفح الألوان الفاخرة",
      image: "/uploads/2.png",
    },
    {
      id: 3,
      title1: "ترطيبٌ فائق،",
      title2: "حمايةٌ تامة.",
      subtitle:
        "عدسات شفافة ومحاليل رعاية معززة بحمض الهيالورونيك الحيوي لترطيب مستمر وحماية قصوى للعيون الحساسة.",
      buttonText: "تسوق عدسات هايدرو",
      image: "/uploads/3.png",
    },
  ],

  products: [],

  shippingRates: [
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
  ],

  contactInfo: {
    whatsapp: "201204356416",
    phone: "01204356416",
    email: "info@lina-lenses.com",
    instagram: "https://www.instagram.com/lina_contact_lenses?igsh=aGx0Zms3eDA2dTA2",
    facebook: "https://www.facebook.com/share/19QcqQDZp3/",
    globalSite: "https://lina-lenses.com",
  },

  notifications: [],
  orders: [],
};

export async function initializeDatabase() {
  let mysqlHost = process.env.MYSQL_HOST;
  let mysqlUser = process.env.MYSQL_USER;
  let mysqlPassword = process.env.MYSQL_PASSWORD;
  let mysqlDatabase = process.env.MYSQL_DATABASE;
  let mysqlPort = process.env.MYSQL_PORT
    ? parseInt(process.env.MYSQL_PORT)
    : 3306;

  // Try loading from database_config.json if it exists
  const configPath = path.join(process.cwd(), "database_config.json");
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (config.host) mysqlHost = config.host;
      if (config.user) mysqlUser = config.user;
      if (config.password !== undefined) mysqlPassword = config.password;
      if (config.database) mysqlDatabase = config.database;
      if (config.port) mysqlPort = parseInt(config.port) || 3306;
      console.log("ℹ️ Loaded database configuration from database_config.json");
    } catch (e) {
      console.error("⚠️ Failed to parse database_config.json:", e);
    }
  }

  if (mysqlHost && mysqlUser && mysqlDatabase) {
    try {
      dbState.pool = mysql.createPool({
        host: mysqlHost,
        user: mysqlUser,
        password: mysqlPassword,
        database: mysqlDatabase,
        port: mysqlPort,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 5000,
      });

      // Test Connection
      const conn = await dbState.pool.getConnection();
      console.log(
        "✅ MySQL Database connected successfully to Hostinger:",
        mysqlDatabase,
      );
      conn.release();
      dbState.useMySQL = true;
      dbState.dbError = null;

      // Create Schema and Seed Initial Catalog
      await createDatabaseSchema(dbState.pool);
    } catch (_err: unknown) {
      // Automatic fallback if localhost fails (try 127.0.0.1 or vice-versa)
      const altHost = mysqlHost === "localhost" ? "127.0.0.1" : (mysqlHost === "127.0.0.1" ? "localhost" : null);
      if (altHost) {
        try {
          console.warn(`⚠️ MySQL connection to ${mysqlHost} failed. Trying fallback host: ${altHost}...`);
          dbState.pool = mysql.createPool({
            host: altHost,
            user: mysqlUser,
            password: mysqlPassword,
            database: mysqlDatabase,
            port: mysqlPort,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 5000,
          });
          const conn = await dbState.pool.getConnection();
          console.log(`✅ MySQL Database connected successfully via fallback host (${altHost}):`, mysqlDatabase);
          conn.release();
          dbState.useMySQL = true;
          dbState.dbError = null;
          await createDatabaseSchema(dbState.pool);
          return;
        } catch {
          // Both main and fallback failed
        }
      }

      dbState.dbError = _err instanceof Error ? _err.message : String(_err);
      console.error("❌ Failed to connect to Hostinger MySQL Database:", dbState.dbError);
      console.warn(
        "⚠️ App will run in memory-safe fallback mode using mock states.",
      );
      dbState.useMySQL = false;
    }
  } else {
    console.warn(
      "⚠️ MySQL credentials not configured in environment variables or database_config.json. Running in local fallback mode.",
    );
    dbState.useMySQL = false;
  }
}

export async function createDatabaseSchema(dbPool: mysql.Pool) {
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS slides (
      id INT PRIMARY KEY,
      title1 VARCHAR(255) NOT NULL,
      title2 VARCHAR(255) NOT NULL,
      subtitle TEXT NOT NULL,
      buttonText VARCHAR(100) NOT NULL,
      image VARCHAR(500) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      oldPrice DECIMAL(10,2) NULL,
      badgeText VARCHAR(100) NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      image VARCHAR(500) NOT NULL,
      waterContent VARCHAR(50),
      diameter VARCHAR(50),
      duration VARCHAR(100),
      isNew BOOLEAN DEFAULT FALSE
    )`,
    `CREATE TABLE IF NOT EXISTS shipping_rates (
      governorate VARCHAR(100) PRIMARY KEY,
      price DECIMAL(10,2) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS contact_info (
      id INT PRIMARY KEY DEFAULT 1,
      whatsapp VARCHAR(50) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL,
      instagram VARCHAR(255) NOT NULL,
      facebook VARCHAR(255) NOT NULL DEFAULT '',
      globalSite VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text TEXT NOT NULL,
      time VARCHAR(100) NOT NULL,
      unread BOOLEAN DEFAULT TRUE
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      date VARCHAR(50) NOT NULL,
      customerName VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      governorate VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      paymentMethod VARCHAR(100) NOT NULL,
      shippingFee DECIMAL(10,2) DEFAULT 0,
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending'
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      power VARCHAR(50) NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin'
    )`,
  ];

  for (const query of tableQueries) {
    await dbPool.query(query);
  }

  // Safely create indexes to optimize query performance
  const indexQueries = [
    "ALTER TABLE products ADD INDEX idx_products_category (category)",
    "ALTER TABLE orders ADD INDEX idx_orders_status (status)",
    "ALTER TABLE orders ADD INDEX idx_orders_date (date)",
    "ALTER TABLE orders ADD COLUMN shippingFee DECIMAL(10,2) DEFAULT 0",
    "ALTER TABLE products ADD COLUMN isNew BOOLEAN DEFAULT FALSE",
    "ALTER TABLE order_items ADD COLUMN power VARCHAR(50) NULL",
    "ALTER TABLE products ADD COLUMN oldPrice DECIMAL(10,2) NULL",
    "ALTER TABLE products ADD COLUMN badgeText VARCHAR(100) NULL",
  ];
  for (const q of indexQueries) {
    try {
      await dbPool.query(q);
    } catch {
      // Index might already exist, ignore error safely
    }
  }

  // Safely add facebook column if it doesn't exist
  try {
    await dbPool.query(
      "ALTER TABLE contact_info ADD COLUMN facebook VARCHAR(255) NOT NULL DEFAULT ''",
    );
  } catch {
    // Column might already exist, ignore error safely
  }

  // Seed Categories
  const [categoriesCount] = await dbPool.query(
    "SELECT COUNT(*) as count FROM categories",
  );
  if ((categoriesCount as any)[0].count === 0) {
    console.log("🌱 Seeding categories into Hostinger MySQL...");
    for (const cat of dbState.categories) {
      await dbPool.query(
        "INSERT INTO categories (id, name, description, type) VALUES (?, ?, ?, ?)",
        [cat.id, cat.name, cat.description, cat.type],
      );
    }
  }

  // Seed Slides
  const [slidesCount] = await dbPool.query(
    "SELECT COUNT(*) as count FROM slides",
  );
  if ((slidesCount as any)[0].count === 0) {
    console.log("🌱 Seeding slides into Hostinger MySQL...");
    for (const slide of dbState.slides) {
      await dbPool.query(
        "INSERT INTO slides (id, title1, title2, subtitle, buttonText, image) VALUES (?, ?, ?, ?, ?, ?)",
        [
          slide.id,
          slide.title1,
          slide.title2,
          slide.subtitle,
          slide.buttonText,
          slide.image,
        ],
      );
    }
  } else {
    // Force update slide images if they contain old paths
    try {
      await dbPool.query("UPDATE slides SET image = '/uploads/1.png' WHERE id = 1");
      await dbPool.query("UPDATE slides SET image = '/uploads/2.png' WHERE id = 2");
      await dbPool.query("UPDATE slides SET image = '/uploads/3.png' WHERE id = 3");
    } catch (e) {
      console.error("⚠️ Failed to update slide images in DB:", e);
    }
  }

  // Remove mock products if they exist
  try {
    await dbPool.query(
      "DELETE FROM products WHERE id IN (101, 102, 103, 104, 105, 106)"
    );
  } catch (e) {
    console.error("⚠️ Failed to delete mock products from MySQL:", e);
  }

  // Seed Shipping Rates
  const [ratesCount] = await dbPool.query(
    "SELECT COUNT(*) as count FROM shipping_rates",
  );
  if ((ratesCount as any)[0].count === 0) {
    console.log("🌱 Seeding shipping rates into Hostinger MySQL...");
    for (const rate of dbState.shippingRates) {
      await dbPool.query(
        "INSERT INTO shipping_rates (governorate, price) VALUES (?, ?)",
        [rate.governorate, rate.price],
      );
    }
  }

  // Seed Contact Info
  const [contactCount] = await dbPool.query(
    "SELECT COUNT(*) as count FROM contact_info",
  );
  if ((contactCount as any)[0].count === 0) {
    console.log("🌱 Seeding contact info into Hostinger MySQL...");
    await dbPool.query(
      "INSERT INTO contact_info (id, whatsapp, phone, email, instagram, facebook, globalSite) VALUES (1, ?, ?, ?, ?, ?, ?)",
      [
        dbState.contactInfo.whatsapp,
        dbState.contactInfo.phone,
        dbState.contactInfo.email,
        dbState.contactInfo.instagram,
        dbState.contactInfo.facebook,
        dbState.contactInfo.globalSite,
      ],
    );
  } else {
    await dbPool.query(
      "UPDATE contact_info SET whatsapp=?, phone=?, instagram=?, facebook=? WHERE id=1",
      [
        dbState.contactInfo.whatsapp,
        dbState.contactInfo.phone,
        dbState.contactInfo.instagram,
        dbState.contactInfo.facebook,
      ],
    );
  }

  // Seed Notifications
  const [notifsCount] = await dbPool.query(
    "SELECT COUNT(*) as count FROM notifications",
  );
  if ((notifsCount as any)[0].count === 0) {
    console.log("🌱 Seeding notifications into Hostinger MySQL...");
    for (const notif of dbState.notifications) {
      await dbPool.query(
        "INSERT INTO notifications (id, text, time, unread) VALUES (?, ?, ?, ?)",
        [notif.id, notif.text, notif.time, notif.unread ? 1 : 0],
      );
    }
  }

  // Seed Orders
  const [ordersCount] = await dbPool.query(
    "SELECT COUNT(*) as count FROM orders",
  );
  if ((ordersCount as any)[0].count === 0) {
    console.log("🌱 Seeding initial orders into Hostinger MySQL...");
    for (const order of dbState.orders) {
      await dbPool.query(
        "INSERT INTO orders (id, date, customerName, phone, governorate, address, paymentMethod, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          order.id,
          order.date,
          order.customerName,
          order.phone,
          order.governorate,
          order.address,
          order.paymentMethod,
          order.total,
          order.status,
        ],
      );
      for (const item of order.items) {
        await dbPool.query(
          "INSERT INTO order_items (orderId, name, price, quantity, power) VALUES (?, ?, ?, ?, ?)",
          [order.id, item.name, item.price, item.quantity, item.power],
        );
      }
    }
  }

  // Seed default admin user
  const [usersCount] = await dbPool.query(
    "SELECT COUNT(*) as count FROM users",
  );
  const targetEmail = "sohaib200596@gmail.com";
  const targetHashedPassword = hashPassword("sohaib200596");

  if ((usersCount as any)[0].count === 0) {
    console.log(
      `🌱 Seeding default admin user (${targetEmail}) into Hostinger MySQL...`,
    );
    await dbPool.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [targetEmail, targetHashedPassword, "admin"],
    );
  } else {
    // Migrate existing "admin" username if it exists to the new secure username and password
    const [existingAdmin] = await dbPool.query(
      "SELECT * FROM users WHERE username = 'admin'",
    );
    if ((existingAdmin as any[]).length > 0) {
      console.log(`🔄 Migrating legacy 'admin' user to '${targetEmail}'...`);
      await dbPool.query(
        "UPDATE users SET username = ?, password = ? WHERE username = 'admin'",
        [targetEmail, targetHashedPassword],
      );
    }
  }
}
