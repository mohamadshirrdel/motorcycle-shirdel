import ProductForm from '@/components/admin/ProductForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <Link href="/admin/products" className="hover:text-strong">محصولات</Link>
        <ChevronLeft size={12} />
        <span className="text-soft">محصول جدید</span>
      </nav>
      <h1 className="mt-3 text-2xl font-black text-strong">افزودن محصول جدید</h1>
      <p className="mt-1 text-xs text-muted">پس از ثبت، محصول بلافاصله در سایت قابل مشاهده است.</p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
