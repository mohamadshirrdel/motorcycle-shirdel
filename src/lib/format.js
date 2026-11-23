// امن برای استفاده در کلاینت و سرور

export function formatPrice(n) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('fa-IR') + ' تومان';
}

export function formatNumber(n) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('fa-IR');
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function effectivePrice(p) {
  return p?.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price
    ? p.discountPrice
    : p?.price ?? 0;
}

export function discountPercent(p) {
  if (!p?.discountPrice || p.discountPrice >= p.price) return 0;
  return Math.round((1 - p.discountPrice / p.price) * 100);
}

export const ORDER_STATUS = {
  pending: { label: 'در انتظار پرداخت', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  paid: { label: 'پرداخت شده', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  processing: { label: 'در حال آماده‌سازی', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  shipped: { label: 'ارسال شد', cls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  delivered: { label: 'تحویل داده شد', cls: 'bg-green-500/10 text-green-400 border-green-500/30' },
  cancelled: { label: 'لغو شده', cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

export const TICKET_STATUS = {
  open: { label: 'باز', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  answered: { label: 'پاسخ داده شده', cls: 'bg-green-500/10 text-green-400 border-green-500/30' },
  closed: { label: 'بسته شده', cls: 'bg-zinc-500/10 text-soft border-zinc-500/30' },
};

export const CATEGORIES = [
  { key: 'sport', label: 'اسپرت' },
  { key: 'naked', label: 'نیکد' },
  { key: 'adventure', label: 'ادونچر' },
  { key: 'scooter', label: 'اسکوتر' },
  { key: 'classic', label: 'کلاسیک' },
];

export const BRANDS = ['Yamaha', 'Kawasaki', 'Ducati', 'BMW', 'KTM', 'Honda', 'Vespa'];

export function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || key;
}
