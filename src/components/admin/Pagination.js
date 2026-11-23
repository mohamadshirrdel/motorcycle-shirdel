'use client';

import ReactResponsivePagination from 'react-responsive-pagination';
import 'react-responsive-pagination/themes/classic.css';

// صفحه‌بندی واکنش‌گرا برای همهٔ فهرست‌های پنل مدیریت (کیبورد/موبایل‌دوست)
export default function Pagination({ total, page, perPage = 10, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);

  if (!total || totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[11px] font-bold text-muted">
        نمایش <span dir="ltr">{start.toLocaleString('fa-IR')}–{end.toLocaleString('fa-IR')}</span> از <span dir="ltr">{total.toLocaleString('fa-IR')}</span>
      </p>
      <ReactResponsivePagination
        current={page}
        total={totalPages}
        onPageChange={onPageChange}
        maxWidth={520}
      />
    </div>
  );
}
