"use client";

import Link from "next/link";
import { Bike, Phone, Mail, MapPin, Send, Clock } from "lucide-react";

// آیکن اینستاگرام به‌صورت SVG داخلی (آیکن‌های برند از lucide-react حذف شده‌اند)
const InstagramIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname === "/login") return null;

  return (
    <footer className="border-t border-line bg-panel">
      {/* نوار اعتماد */}
      <div className="border-b border-line">
        <div className="container-x grid grid-cols-2 gap-4 py-6 text-center text-[11px] text-muted md:grid-cols-4">
          {[
            ["گارانتی اصالت کالا", "ضمانت‌نامه رسمی موتورسیکلت شیردل"],
            ["ارسال و نصب رایگان", "تحویل در محل در سراسر خراسان رضوی"],
            ["خرید اقساطی", "تا ۳۶ ماه با چک صیادی"],
            ["تست سواری حضوری", "تجربه پیش از خرید"],
          ].map(([t, s]) => (
            <div key={t}>
              <p className="text-xs font-black text-strong">{t}</p>
              <p className="mt-0.5">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container-x grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accentSoft via-accent to-[#8f0300] font-vazir text-xl font-black text-white">
              ش
            </span>
            <span className="text-lg font-black text-strong">
              موتورسیکلت <span className="text-accent">شیردل</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-7 text-muted">
            از سال ۱۳۸۴ نماینده رسمی یاماها، کاوازاکی، دوکاتی، بی‌ام‌و موتورراد
            و کی‌تی‌ام در ایران؛ با ۱۸۰۰ متر مربع شوروم تخصصی، پیست تست و کارگاه
            سرویس دوره‌ای.
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href="#"
              aria-label="اینستاگرام"
              className="rounded-lg border border-line p-2 text-muted transition hover:border-accent hover:text-strong"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              href="#"
              aria-label="تلگرام"
              className="rounded-lg border border-line p-2 text-muted transition hover:border-accent hover:text-strong"
            >
              <Send size={16} />
            </a>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-strong">
            دسترسی سریع
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link className="hover:text-strong" href="/bikes">
                همه محصولات
              </Link>
            </li>
            <li>
              <Link className="hover:text-strong" href="/track">
                پیگیری سفارش
              </Link>
            </li>
            <li>
              <Link className="hover:text-strong" href="/tickets">
                ثبت تیکت پشتیبانی
              </Link>
            </li>
            <li>
              <Link className="hover:text-strong" href="/about">
                درباره موتورسیکلت شیردل
              </Link>
            </li>
            <li>
              <Link className="hover:text-strong" href="/contact">
                تماس و آدرس شوروم
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-strong">
            دسته‌بندی‌ها
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link className="hover:text-strong" href="/bikes?category=sport">
                اسپرت و سوپربایک
              </Link>
            </li>
            <li>
              <Link className="hover:text-strong" href="/bikes?category=naked">
                نیکد / خیابانی
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-strong"
                href="/bikes?category=adventure"
              >
                ادونچر و تورینگ
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-strong"
                href="/bikes?category=scooter"
              >
                اسکوتر شهری
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-strong"
                href="/bikes?category=classic"
              >
                کلاسیک و نئوکلاسیک
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-strong">
            اطلاعات تماس
          </p>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />{" "}
              خراسان رضوی، تربت جام، خیابان امام خمینی، روبه‌روی بازارچهٔ امام،
              پلاک ۱۲۰۰
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-accent" /> ۰۵۱-۵۲۲۸۱۲۳۴
              — ۰۹۱۲۳۴۵۶۷۸۹
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-accent" />{" "}
              info@shirdelmotor.ir
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0 text-accent" /> شنبه
              تا پنجشنبه ۹ تا ۲۰ — جمعه‌ها ۱۰ تا ۱۷
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-4 text-[11px] text-muted sm:flex-row">
          <p>© ۱۴۰۵ موتورسیکلت شیردل — تمام حقوق محفوظ است.</p>
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-line px-2 py-1">
              ای‌نماد
            </span>
            <span className="rounded-md border border-line px-2 py-1">
              ساماندهی
            </span>
            <span className="rounded-md border border-line px-2 py-1">
              درگاه امن زرین‌پال
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
