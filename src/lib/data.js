import { connectDB } from '@/lib/mongodb';
import { Product, Comment } from '@/lib/models';

export async function getFeaturedProducts() {
  await connectDB();
  return Product.find({ featured: true }).sort({ createdAt: -1 }).limit(8).lean();
}

export async function getLatestProducts(limit = 4) {
  await connectDB();
  return Product.find({}).sort({ createdAt: -1 }).limit(limit).lean();
}

export async function queryProducts({ q, brand, category, sort, maxPrice } = {}) {
  await connectDB();
  const filter = {};
  if (brand) filter.brand = brand;
  if (category) filter.category = category;
  if (maxPrice && !isNaN(Number(maxPrice))) {
    filter.price = { $lte: Number(maxPrice) };
  }
  if (q) {
    const rx = new RegExp(String(q).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { brand: rx }, { engine: rx }, { shortDesc: rx }];
  }
  let sortSpec = { createdAt: -1 };
  if (sort === 'price-asc') sortSpec = { price: 1 };
  else if (sort === 'price-desc') sortSpec = { price: -1 };
  else if (sort === 'rating') sortSpec = { ratingAvg: -1 };
  else if (sort === 'sold') sortSpec = { sold: -1 };
  return Product.find(filter).sort(sortSpec).lean();
}

export async function getProductBySlug(slug) {
  await connectDB();
  return Product.findOne({ slug }).lean();
}

export async function getRelatedProducts(product, limit = 4) {
  await connectDB();
  return Product.find({ category: product.category, _id: { $ne: product._id } })
    .sort({ sold: -1 })
    .limit(limit)
    .lean();
}

export async function getApprovedComments(productId) {
  await connectDB();
  return Comment.find({ product: productId, status: 'approved' })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getAllBrandsInUse() {
  await connectDB();
  return Product.distinct('brand');
}

// تبدیل عمیق شیء mongoose به JSON ساده برای Client Components —
// ObjectIdها (از جمله فیلدهای تودرتو مثل comment.product) و Dateها را رشته می‌کند
export function serialize(doc) {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}
