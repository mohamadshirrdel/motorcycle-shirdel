// Seed دیتابیس: ادمین + محصولات + نمونه کامنت/سفارش/تیکت
// اجرا: npm run seed
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// خواندن .env.local به شکل ساده
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27018/motorcycle_shirdel";

const { Schema } = mongoose;
const ProductSchema = new Schema({}, { strict: false, timestamps: true });
const OrderSchema = new Schema({}, { strict: false, timestamps: true });
const CommentSchema = new Schema({}, { strict: false, timestamps: true });
const TicketSchema = new Schema({}, { strict: false, timestamps: true });
const UserSchema = new Schema({}, { strict: false, timestamps: true });

const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);
const Comment = mongoose.model("Comment", CommentSchema);
const Ticket = mongoose.model("Ticket", TicketSchema);
const User = mongoose.model("User", UserSchema);

const B = (n) => n; // قیمت‌ها به تومان

const products = [
  {
    title: "Yamaha YZF-R1 2024 — فینال ادیشن",
    slug: "yamaha-yzf-r1-2024",
    brand: "Yamaha",
    category: "sport",
    engine: "۹۹۸ سی‌سی CP4",
    power: "۲۰۰ اسب بخار @ ۱۳٬۵۰۰",
    torque: "۱۱۳ نیوتن‌متر",
    weight: "۱۹۹ کیلوگرم",
    topSpeed: "۲۹۹ km/h",
    fuelTank: "۱۷ لیتر",
    price: B(4850000000),
    discountPrice: null,
    stock: 3,
    colors: ["قرمز ریسینگ", "مشکی تیتانیوم"],
    images: [
      "/images/bikes/yamaha-r1.webp",
      "/images/bikes/yamaha-r1-alt.webp",
    ],
    shortDesc:
      "هیولای کراس‌پلین با شتاب ۰ تا ۱۰۰ در ۳.۲ ثانیه؛ همان موتوری که در موتو‌جی‌پی می‌بینید.",
    description:
      "YZF-R1 2024 با موتور کراس‌پلین CP4، شاسی دلتاباکس و سیستم کنترل کشش چندحالته، مرز بین جاده و پیست را جابه‌جا کرده است.\n\nاین دستگاه با کارت گارانتی رسمی یاماها موتورسیکلت شیردل، ۱۷۰۰۰ کیلومتر سرویس رایگان دوره‌ای و بیمه بدنه سال اول تحویل شما می‌شود.",
    featured: true,
    ratingAvg: 4.9,
    ratingCount: 34,
    sold: 41,
  },
  {
    title: "Kawasaki Ninja ZX-10R 2026",
    slug: "kawasaki-ninja-zx-10r",
    brand: "Kawasaki",
    category: "sport",
    engine: "۹۹۸ سی‌سی چهار سیلندر",
    power: "۲۰۳ اسب بخار @ ۱۳٬۲۰۰",
    torque: "۱۱۴ نیوتن‌متر",
    weight: "۲۰۷ کیلوگرم",
    topSpeed: "۲۹۹ km/h",
    fuelTank: "۱۷ لیتر",
    price: B(5950000000),
    discountPrice: null,
    stock: 2,
    colors: ["سبز لایم کاوازاکی", "مشکی/سفید"],
    images: [
      "/images/bikes/kawasaki-zx10r.jpg",
      "/images/bikes/kawasaki-zx10r-alt.png",
    ],
    shortDesc:
      "سمبل سوپربایک؛ قهرمان ۷ دوره سوپربایک جهانی با باله‌های آیرودینامیک.",
    description:
      "ZX-10R با باله‌های Winglet نسل جدید، واحد اندازه‌گیری اینرسی Bosch IMU و تعلیق Showa BFF، دقیق‌ترین فرمان‌پذیری را در کلاس خود ارائه می‌دهد.\n\nشامل یک‌سال سرویس دوره‌ای رایگان + تست سواری ۲ کیلومتری در پیست شیردل پیش از تحویل.",
    featured: true,
    ratingAvg: 4.8,
    ratingCount: 29,
    sold: 33,
  },
  {
    title: "Ducati Panigale V4 S 2025",
    slug: "ducati-panigale-v4s-2025",
    brand: "Ducati",
    category: "sport",
    engine: "۱۱۰۳ سی‌سی V4 Desmosedici Stradale",
    power: "۲۱۶ اسب بخار @ ۱۳٬۵۰۰",
    torque: "۱۲۴ نیوتن‌متر",
    weight: "۱۷۵ کیلوگرم",
    topSpeed: "۳۰۳ km/h",
    fuelTank: "۱۷ لیتر",
    price: B(9400000000),
    discountPrice: B(8900000000),
    stock: 2,
    colors: ["قرمز دوکاتی"],
    images: [
      "/images/bikes/ducati-panigale-v4s.jpg",
      "/images/bikes/ducati-panigale-v4s-alt.jpg",
    ],
    shortDesc: "موتور V4 دوسوپاپ مسابقه‌ای؛ سلطان پیست، غرور هر گاراژ.",
    description:
      "Panigale V4 S با شاسی Front Frame آلومینیومی، تعلیق Öhlins الکترونیک NIX و TTX و سیستم Desmosedici Stradale، نزدیک‌ترین تجربه موتو‌جی‌پی به خیابان است.\n\nتحویل همراه با گارانتی رسمی دوکاتی + پکیج سرویس ۴ مرحله‌ای رایگان.",
    featured: true,
    ratingAvg: 5.0,
    ratingCount: 18,
    sold: 17,
  },
  {
    title: "BMW S 1000 RR 2025",
    slug: "bmw-s-1000-rr-2025",
    brand: "BMW",
    category: "sport",
    engine: "۹۹۹ سی‌سی چهار سیلندر ShiftCam",
    power: "۲۱۰ اسب بخار @ ۱۳٬۷۵۰",
    torque: "۱۱۳ نیوتن‌متر",
    weight: "۱۹۷ کیلوگرم",
    topSpeed: "۲۹۹ km/h",
    fuelTank: "۱۶.۵ لیتر",
    price: B(7700000000),
    discountPrice: null,
    stock: 4,
    colors: ["سفید/آبی M Motorsport", "مشکی تریم"],
    images: [
      "/images/bikes/bmw-s1000rr.jpg",
      "/images/bikes/bmw-s1000rr-alt.jpg",
    ],
    shortDesc: "ترکیب مهندسی آلمان و تکنولوژی ShiftCam؛ برای پیست و خیابان.",
    description:
      "S 1000 RR با زمان‌بندی متغیر سوپاپ ShiftCam، داشبورد ۶.۵ اینچی TFT و حالت‌های رانندگی Rain تا Race Pro، هوشمندترین سوپربایک بازار است.\n\nبا بیمه بدنه سال اول و ۲ سال سرویس دوره‌ای رایگان تحویل می‌شود.",
    featured: false,
    ratingAvg: 4.7,
    ratingCount: 22,
    sold: 28,
  },
  {
    title: "KTM 390 Duke 2024",
    slug: "ktm-390-duke-2024",
    brand: "KTM",
    category: "naked",
    engine: "۳۹۹ سی‌سی تک سیلندر",
    power: "۴۵ اسب بخار @ ۸٬۵۰۰",
    torque: "۳۹ نیوتن‌متر",
    weight: "۱۶۵ کیلوگرم",
    topSpeed: "۱۵۰ km/h",
    fuelTank: "۱۳.۴ لیتر",
    price: B(890000000),
    discountPrice: B(820000000),
    stock: 12,
    colors: ["نارنجی کی‌تی‌ام", "مشکی"],
    images: [
      "/images/bikes/ktm-390-duke.webp",
      "/images/bikes/ktm-390-duke-alt.jpg",
    ],
    shortDesc: "سلطان نیکدهای سبک؛ چابک، پرجنب‌وجوش و عاشق شهر.",
    description:
      "390 Duke با نمایشگر TFT، Quick Shifter پلاس و شاسی Bootits-frame، بهترین نسبت توان به وزن کلاس خود را دارد.\n\nمحبوب‌ترین مدل برای تازه‌سوارها و رفت‌وآمد روزمره — با شرایط اقساط ویژه.",
    featured: true,
    ratingAvg: 4.6,
    ratingCount: 51,
    sold: 128,
  },
  {
    title: "Kawasaki Z900 2026",
    slug: "kawasaki-z900-2026",
    brand: "Kawasaki",
    category: "naked",
    engine: "۹۴۸ سی‌سی چهار سیلندر",
    power: "۱۲۵ اسب بخار @ ۹٬۵۰۰",
    torque: "۹۸.۶ نیوتن‌متر",
    weight: "۲۱۲ کیلوگرم",
    topSpeed: "۲۵۵ km/h",
    fuelTank: "۱۷ لیتر",
    price: B(1650000000),
    discountPrice: null,
    stock: 7,
    colors: ["مشکی متی", "سبز متالیک"],
    images: [
      "/images/bikes/kawasaki-z900.jpg",
      "/images/bikes/kawasaki-z900-alt.jpg",
    ],
    shortDesc: "قدرت چهار سیلندر در فرم نیکد؛ وحشی اما قابل‌کنترل.",
    description:
      "Z900 با موتور ۹۴۸ سی‌سی، سیستم Traction Control سه‌حالته و حالت‌های Power/Rain، انتخاب حرفه‌ای‌ها برای استفاده روزمره است.\n\nضمانت اصالت موتورسیکلت شیردل + سرویس اول و دوم رایگان.",
    featured: false,
    ratingAvg: 4.7,
    ratingCount: 38,
    sold: 64,
  },
  {
    title: "Honda CRF1100L Africa Twin 2024",
    slug: "honda-africa-twin-2024",
    brand: "Honda",
    category: "adventure",
    engine: "۱۰۸۴ سی‌سی Parallel-Twin",
    power: "۱۰۲ اسب بخار @ ۷٬۵۰۰",
    torque: "۱۰۵ نیوتن‌متر",
    weight: "۲۳۱ کیلوگرم",
    topSpeed: "۲۱۰ km/h",
    fuelTank: "۱۸.۸ لیتر",
    price: B(2450000000),
    discountPrice: null,
    stock: 5,
    colors: ["سفید/آبی Adventure Sports", "مشکی متی"],
    images: [
      "/images/bikes/honda-africa-twin.jpg",
      "/images/bikes/honda-africa-twin-alt.webp",
    ],
    shortDesc: "پادشاه ادونچر؛ از کوچه‌های تربت جام تا کویر مرکزی.",
    description:
      "Africa Twin با گیربکس DCT اختیاری، سیستم Showa EERA و سلکتور G-switch برای آفرود، همان موتوری است که از شما یک ماجراجو می‌سازد.\n\nشامل ۱۲ ماه سرویس رایگان و کارگاه آفرود تخصصی شیردل.",
    featured: true,
    ratingAvg: 4.9,
    ratingCount: 41,
    sold: 37,
  },
  {
    title: "BMW R nineT 100 Years — ادیشن صدساله",
    slug: "bmw-r-ninet-100-years",
    brand: "BMW",
    category: "classic",
    engine: "۱۱۷۰ سی‌سی باکسر دو سیلندر",
    power: "۱۰۹ اسب بخار @ ۷٬۲۵۰",
    torque: "۱۱۶ نیوتن‌متر",
    weight: "۲۲۱ کیلوگرم",
    topSpeed: "۲۰۰ km/h",
    fuelTank: "۱۷ لیتر",
    price: B(6200000000),
    discountPrice: null,
    stock: 2,
    colors: ["سفید/طلایی Heritage"],
    images: [
      "/images/bikes/bmw-rninet.jpg",
      "/images/bikes/bmw-rninet-alt.jpg",
    ],
    shortDesc:
      "ادای احترام به ۱۰۰ سال موتورسازی ب‌ام‌و؛ نامرئی‌ترین کلاسیک بازار.",
    description:
      "R nineT 100 Years با تانک دست‌ساز، اگزوز Akrapovič و نشان Heritage، کلکسیونی برای رویای هر راکبان است — شماره‌گذاری شده و محدود.\n\nتحویل با کارت اصالت شماره‌دار BMW و بسته نگهداری کلکسیونی.",
    featured: false,
    ratingAvg: 4.9,
    ratingCount: 12,
    sold: 8,
  },
  {
    title: "Vespa Primavera 150 2026",
    slug: "vespa-primavera-150-2026",
    brand: "Vespa",
    category: "scooter",
    engine: "۱۵۵ سی‌سی i-get تک سیلندر",
    power: "۱۲.۷ اسب بخار",
    torque: "۱۲.۸ نیوتن‌متر",
    weight: "۱۳۰ کیلوگرم",
    topSpeed: "۹۵ km/h",
    fuelTank: "۸ لیتر",
    price: B(780000000),
    discountPrice: B(719000000),
    stock: 15,
    colors: ["آبی برقی", "سفید", "مشکی"],
    images: [
      "/images/bikes/vespa-primavera.png",
      "/images/bikes/vespa-primavera-alt.jpg",
    ],
    shortDesc: "زیبایی ایتالیایی برای رفت‌وآمد روزمره؛ با همان امضای ۱۹۴۶.",
    description:
      "Primavera 150 با بدنه فولادی یکپارچه، چراغ Full-LED و جاذبه همیشگی طراحی Vespa، انتخاب اول شیک‌پوشان شهر است.\n\nبا پلاک ملی، بیمه و سرویس اول رایگان تحویل می‌شود.",
    featured: false,
    ratingAvg: 4.5,
    ratingCount: 47,
    sold: 150,
  },
];

async function run() {
  console.log("اتصال به MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log("پاک‌سازی کالکشن‌ها…");
  await Promise.all([
    Product.deleteMany({}),
    Order.deleteMany({}),
    Comment.deleteMany({}),
    Ticket.deleteMany({}),
    User.deleteMany({}),
  ]);
  // کالکشن قدیمی admins (اگر از نسخه‌های قبلی مانده) کاملاً حذف می‌شود
  await mongoose.connection
    .collection("admins")
    .drop()
    .catch(() => {});

  const adminUser = (process.env.ADMIN_USERNAME || "mohammad").toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || "mmd073191";
  const adminPhone = process.env.ADMIN_PHONE || "09100073191";
  const demoAdmin = await User.create({
    name: "mohammad",
    username: adminUser,
    phone: adminPhone,
    email: "",
    passwordHash: await bcrypt.hash(adminPass, 10),
    role: "admin",
    banned: false,
  });
  console.log(
    `ادمین ساخته شد → username: ${adminUser} / رمز: ${adminPass} / موبایل: ${adminPhone}`,
  );

  // کاربر نمونه برای تست ورود
  const demoUser = await User.create({
    name: "آریا محمدی",
    username: "aria",
    phone: "09123456789",
    email: "aria@example.com",
    passwordHash: await bcrypt.hash("Shirdel@123", 10),
    role: "user",
    banned: false,
  });
  console.log(
    "کاربر نمونه → aria@example.com یا 09123456789 / رمز: Shirdel@123",
  );

  await Product.insertMany(products);
  console.log(`${products.length} محصول ثبت شد.`);

  const inserted = await Product.find({}).lean();
  const bySlug = Object.fromEntries(inserted.map((p) => [p.slug, p]));

  // کامنت‌های نمونه
  await Comment.insertMany([
    {
      product: bySlug["ktm-390-duke-2024"]._id,
      productTitle: bySlug["ktm-390-duke-2024"].title,
      name: "آریا محمدی",
      text: "سه ماهه دارم سواری می‌کنم؛ شتاب اولیه محشره و مصرفش تو شهر حدود ۴ لیتره. تیم شیردل خیلی حرفه‌ای تحویل دادند.",
      rating: 5,
      status: "approved",
    },
    {
      product: bySlug["honda-africa-twin-2024"]._id,
      productTitle: bySlug["honda-africa-twin-2024"].title,
      name: "سارا قاسمی",
      text: "برای سفرهای طولانی عالیه؛ نشستم و باهاش رفتم تبریز. سیستم DCT واقعاً راحتیه.",
      rating: 5,
      status: "approved",
    },
    {
      product: bySlug["yamaha-yzf-r1-2024"]._id,
      productTitle: bySlug["yamaha-yzf-r1-2024"].title,
      name: "کیوان رضایی",
      text: "رویا بودم، امروز تحویل گرفتم. تست سواریش قبل از خرید بهترین بخش ماجرا بود!",
      rating: 5,
      status: "approved",
    },
    {
      product: bySlug["kawasaki-z900-2026"]._id,
      productTitle: bySlug["kawasaki-z900-2026"].title,
      name: "مهرداد رستمی",
      text: "قدرت Z900 تحت هر شرایطیه؛ فقط حواستون به ترمز جلو در بارندگی باشه.",
      rating: 4,
      status: "pending",
    },
    {
      product: bySlug["ducati-panigale-v4s-2025"]._id,
      productTitle: bySlug["ducati-panigale-v4s-2025"].title,
      name: "بهنام شریفی",
      text: "قیمتش بالاست ولی این صدا و این هندلینگ ارزش هر ریالش رو داره.",
      rating: 5,
      status: "pending",
    },
  ]);
  console.log("کامنت‌های نمونه ثبت شد.");

  // سفارش و تیکت نمونه
  const demoProduct = bySlug["ktm-390-duke-2024"];
  const unit = demoProduct.discountPrice || demoProduct.price;
  await Order.create({
    code: "SD-DEMO1",
    user: demoUser._id,
    customer: {
      name: "آریا محمدی",
      phone: "09123456789",
      email: "aria@example.com",
      city: "تربت جام",
      address: "تربت جام، خیابان امام خمینی، کوچه بهار، پلاک ۱۲",
    },
    items: [
      {
        productId: String(demoProduct._id),
        slug: demoProduct.slug,
        title: demoProduct.title,
        image: demoProduct.images[0],
        price: unit,
        qty: 1,
      },
    ],
    total: unit,
    paymentMethod: "online",
    status: "shipped",
    note: "تحویل بعد از ساعت ۱۷ لطفاً",
  });
  await Ticket.create({
    code: "T-DEMO1",
    name: "آریا محمدی",
    email: "aria@example.com",
    subject: "هماهنگی سرویس اولیه ۵۰۰ کیلومتر",
    orderCode: "SD-DEMO1",
    message:
      "سلام؛ برای سرویس دوره اول کی می‌تونم بیارم شوروم؟ وقت آنلاین می‌خوام.",
    status: "answered",
    replies: [
      {
        author: "admin",
        text: "سلام جناب محمدی عزیز؛ روز سه‌شنبه ۲ آذر ساعت ۱۰ صبح برای شما رزرو شد. با همین ایمیل تأییدیه ارسال می‌شود.",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        author: "user",
        text: "ممنون، سه‌شنبه تشریف میارم.",
        createdAt: new Date(Date.now() - 80000000),
      },
    ],
  });
  console.log(
    "سفارش و تیکت نمونه ثبت شد. (کد رهگیری: SD-DEMO1 با موبایل 09123456789 — تیکت: T-DEMO1)",
  );

  // ——— دادهٔ حجیم برای دمو (تا صفحه‌بندی پنل مدیریت دیده شود) ———
  let seedN = 42;
  const rand = () => {
    seedN = (seedN * 1103515245 + 12345) & 0x7fffffff;
    return seedN / 0x7fffffff;
  };
  const firstNames = [
    "علی",
    "رضا",
    "مهدی",
    "حسین",
    "جواد",
    "امیر",
    "سینا",
    "نیما",
    "پارسا",
    "آرش",
    "بهنام",
    "کاوه",
    "رامین",
    "سهیل",
    "پویا",
  ];
  const lastNames = [
    "احمدی",
    "کریمی",
    "یوسفی",
    "نادری",
    "موسوی",
    "جعفری",
    "صادقی",
    "شریفی",
    "رستمی",
    "قاسمی",
    "تهرانی",
    "اکبری",
    "رنجبر",
    "فرهادی",
    "مرادی",
  ];
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  // خریداران دمو
  const buyerHash = await bcrypt.hash("Shirdel@123", 10);
  const buyers = [];
  for (let i = 0; i < 15; i++) {
    buyers.push({
      name: `${firstNames[i]} ${lastNames[i]}`,
      username: `buyer${String(i + 1).padStart(2, "0")}`,
      phone: `0912${String(1234567 + i * 7919)
        .slice(-7)
        .padStart(7, "0")}`,
      email: `buyer${String(i + 1).padStart(2, "0")}@example.com`,
      passwordHash: buyerHash,
      role: "user",
      banned: i === 13, // یکی دو تا مسدود برای دمو
    });
  }
  await User.insertMany(buyers);
  console.log(
    `${buyers.length} خریدار دمو ساخته شد (buyer01..buyer15 / رمز: Shirdel@123).`,
  );

  // سفارش‌های دمو با وضعیت‌های چرخشی
  const slugs = [
    "ktm-390-duke-2024",
    "honda-africa-twin-2024",
    "yamaha-yzf-r1-2024",
    "kawasaki-z900-2026",
    "ducati-panigale-v4s-2025",
    "bmw-s-1000-rr-2025",
  ];
  const orderStatuses = [
    "pending",
    "delivered",
    "shipped",
    "paid",
    "delivered",
    "processing",
    "delivered",
    "pending",
    "delivered",
    "shipped",
    "delivered",
    "cancelled",
    "delivered",
  ];
  const demoOrders = [];
  for (let i = 0; i < 13; i++) {
    const slug = slugs[i % slugs.length];
    const prod = bySlug[slug];
    const qty = (i % 2) + 1;
    const unit = prod.discountPrice || prod.price;
    const buyer = buyers[i % buyers.length];
    demoOrders.push({
      code: `SD-DEMO${String(i + 2).padStart(2, "0")}`,
      user: null,
      customer: {
        name: buyer.name,
        phone: buyer.phone,
        email: buyer.email,
        city: "تربت جام",
        address: "تربت جام، خیابان امام خمینی، کوچهٔ نمونه، پلاک " + (i + 2),
      },
      items: [
        {
          productId: String(prod._id),
          slug: prod.slug,
          title: prod.title,
          image: prod.images?.[0] || "",
          price: unit,
          qty,
        },
      ],
      total: unit * qty,
      paymentMethod: i % 3 === 0 ? "cod" : "online",
      status: orderStatuses[i],
      note: "",
      createdAt: new Date(Date.now() - (i + 1) * 37e6 * 13),
      updatedAt: new Date(Date.now() - (i + 1) * 37e6 * 13),
    });
  }
  await Order.insertMany(demoOrders);
  console.log(`${demoOrders.length} سفارش دمو ساخته شد.`);

  // کامنت‌های دمو با وضعیت‌های چرخشی
  const demoTexts = [
    "عالی بود، ممنون از تیم شیردل.",
    "واقعاً ارزش خرید داشت.",
    "تحویل فوری و برخورد عالی.",
    "کیفیت ساختش معرکه‌ست.",
    "برای سواری روزمره فوق‌العاده‌ست.",
    "قیمتش منصفانه بود نسبت به بازار.",
  ];
  const commentStatuses = [
    "approved",
    "approved",
    "approved",
    "pending",
    "approved",
    "pending",
    "rejected",
    "approved",
    "approved",
    "pending",
    "approved",
    "approved",
    "rejected",
    "approved",
    "pending",
    "approved",
    "approved",
    "approved",
  ];
  const demoComments = [];
  for (let i = 0; i < 18; i++) {
    const slug = slugs[i % slugs.length];
    const prod = bySlug[slug];
    demoComments.push({
      product: prod._id,
      productTitle: prod.title,
      name: `${firstNames[(i + 3) % 15]} ${lastNames[(i + 7) % 15]}`,
      text: pick(demoTexts),
      rating: 3 + (i % 3),
      status: commentStatuses[i],
      createdAt: new Date(Date.now() - (i + 1) * 19e6 * 11),
    });
  }
  await Comment.insertMany(demoComments);
  console.log(`${demoComments.length} کامنت دمو ساخته شد.`);

  // تیکت‌های دمو با وضعیت‌های چرخشی
  const ticketSubjects = [
    "گارانتی موتور",
    "نوبت سرویس دوره‌ای",
    "مشکل در سند رسمی",
    "پیگیری نصب پلاک",
    "تعویض قطعه",
    "سوال درباره اقساط",
  ];
  const ticketStatuses = [
    "open",
    "answered",
    "closed",
    "open",
    "answered",
    "closed",
    "open",
    "answered",
    "closed",
    "open",
    "answered",
  ];
  const demoTickets = [];
  for (let i = 0; i < 11; i++) {
    const buyer = buyers[(i + 5) % buyers.length];
    demoTickets.push({
      code: `T-DEMO${String(i + 2).padStart(2, "0")}`,
      name: buyer.name,
      email: buyer.email,
      subject: ticketSubjects[i % ticketSubjects.length],
      orderCode: i % 4 === 0 ? "SD-DEMO1" : "",
      message:
        "سلام؛ می‌خواستم دربارهٔ این موضوع راهنماییم کنید. ممنون می‌شم زودتر جواب بدید.",
      status: ticketStatuses[i],
      replies:
        ticketStatuses[i] === "open"
          ? []
          : [
              {
                author: "admin",
                text: "سلام؛ پیام شما دریافت شد، تیم پشتیبانی همان روز پیگیری می‌کند.",
                createdAt: new Date(Date.now() - (i + 1) * 29e6 * 7),
              },
            ],
      createdAt: new Date(Date.now() - (i + 1) * 29e6 * 13),
      updatedAt: new Date(Date.now() - (i + 1) * 29e6 * 7),
    });
  }
  await Ticket.insertMany(demoTickets);
  console.log(`${demoTickets.length} تیکت دمو ساخته شد.`);

  await mongoose.disconnect();
  console.log("✅ Seed کامل شد.");
  process.exit(0);
}

run().catch((e) => {
  console.error("Seed ناموفق:", e);
  process.exit(1);
});
