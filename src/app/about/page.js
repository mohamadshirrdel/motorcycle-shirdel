import { Flag, Building2, Trophy, Users } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "درباره ما" };

const MILESTONES = [
  [
    "۱۳۸۴",
    "تأسیس موتورسیکلت شیردل در تربت جام (خراسان رضوی) به‌عنوان نمایندگی رسمی یاماها",
  ],
  ["۱۳۹۰", "راه‌اندازی کارگاه تخصصی سرویس و واردات قطعات اورجینال"],
  ["۱۳۹۵", "افتتاح پیست تست سواری اختصاصی — ۶۰۰ متر در تربت جام"],
  ["۱۴۰۰", "دریافت نمایندگی رسمی کاوازاکی، دوکاتی، بی‌ام‌و و کی‌تی‌ام"],
  ["۱۴۰۴", "بیش از ۱۲۰۰ تحویل موفق و ۲۰ سال همراهی با راکبان ایرانی"],
];

export default function AboutPage() {
  return (
    <div className="container-x pb-16 pt-28 lg:pt-32">
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">
        درباره ما
      </p>
      <h1 className="mt-2 max-w-2xl text-3xl font-black leading-snug text-strong sm:text-4xl">
        ۲۰ سال است که
        <br />
        با «صدای موتور» زندگی می‌کنیم.
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-6 text-sm leading-8 text-soft">
          <p>
            موتورسیکلت شیردل از یک تعمیرگاه کوچک در ۱۳۸۴ شروع شد و امروز به یکی
            از بزرگ‌ترین شوروم‌های تخصصی موتورسیکلت منطقه تبدیل شده است: ۱۸۰۰
            متر مربع فضای نمایش، ۶ پیست تست، کارگاه سرویس دوره‌ای با تکنسین‌های
            مجاز و انبار قطعات اورجینال.
          </p>
          <p>
            ما فقط موتور نمی‌فروشیم؛ «تجربه سواری» می‌فروشیم. به هر خرید، یک‌سال
            سرویس دوره‌ای رایگان، تست سواری پیش از خرید و بیمه بدنه سال اول هدیه
            می‌دهیم — چون معتقدیم رابطه ما با شما بعد از تحویل کلید، تازه شروع
            می‌شود.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              [Building2, "۱٬۸۰۰+ متر شوروم تخصصی"],
              [Users, "۳۵ نفر تیم فروش و فنی"],
              [Trophy, "نماینده ۷ برند جهانی"],
              [Flag, "پیست تست سواری اختصاصی"],
            ].map(([Icon, t]) => (
              <div key={t} className="card flex items-center gap-3 p-4">
                <Icon size={22} className="shrink-0 text-accent" />
                <span className="text-xs font-bold leading-6 text-body">
                  {t}
                </span>
              </div>
            ))}
          </div>
          <Link href="/bikes" className="btn-primary">
            دیدن کاتالوگ محصولات
          </Link>
        </div>

        {/* تایم‌لاین */}
        <ol className="relative space-y-0 border-r border-line pr-6">
          {MILESTONES.map(([year, text]) => (
            <li key={year} className="relative pb-7 last:pb-0">
              <span className="absolute -right-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-accent bg-ink" />
              <p className="text-lg font-black text-gold">{year}</p>
              <p className="mt-1 text-sm leading-7 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
