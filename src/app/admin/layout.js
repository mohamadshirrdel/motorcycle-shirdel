import Link from 'next/link';

export const metadata = { title: 'مدیریت' };

// لایه‌ی بیرونی ادمین — گارد احراز هویت در (panel)/layout.js است؛ login عمومی است.
export default function AdminRootLayout({ children }) {
  return <div className="min-h-screen bg-ink">{children}</div>;
}
