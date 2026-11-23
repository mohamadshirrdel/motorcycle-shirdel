import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }) {
  // بررسی سمت سرور با دیتابیس (نه فقط کوکی) — تنزل/مسدودی فوری اعمال می‌شود
  const { error, session } = await requireAdmin();
  if (error) redirect('/admin/login');
  return <AdminShell name={session.name}>{children}</AdminShell>;
}
