import mongoose from 'mongoose';

const { Schema } = mongoose;

/* ---------------- محصول ---------------- */
const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true },
    category: {
      type: String,
      enum: ['sport', 'naked', 'adventure', 'scooter', 'classic'],
      required: true,
      index: true,
    },
    engine: { type: String, default: '' },
    power: { type: String, default: '' },
    torque: { type: String, default: '' },
    weight: { type: String, default: '' },
    topSpeed: { type: String, default: '' },
    fuelTank: { type: String, default: '' },
    warranty: { type: String, default: 'گارانتی اصالت و سلامت کالا' },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    stock: { type: Number, default: 0 },
    colors: [{ type: String }],
    images: [{ type: String }],
    shortDesc: { type: String, default: '' },
    description: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    ratingAvg: { type: Number, default: 4.5 },
    ratingCount: { type: Number, default: 12 },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ---------------- کاربر سایت ---------------- */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    phone: { type: String, default: '', index: true },
    email: { type: String, default: '', index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    banned: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

/* ---------------- سفارش ---------------- */
const OrderSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
      city: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    items: [
      {
        productId: { type: String },
        slug: String,
        title: String,
        image: String,
        price: Number,
        qty: Number,
      },
    ],
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

/* ---------------- کامنت محصول ---------------- */
const CommentSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productTitle: { type: String, default: '' },
    name: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

/* ---------------- تیکت پشتیبانی ---------------- */
const TicketSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    orderCode: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'answered', 'closed'],
      default: 'open',
      index: true,
    },
    replies: [
      {
        author: { type: String, enum: ['user', 'admin'], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
