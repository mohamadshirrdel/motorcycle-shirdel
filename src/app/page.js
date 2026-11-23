import Link from "next/link";
import Image from "next/image";
import {
  Bike,
  ChevronLeft,
  ShieldCheck,
  Wrench,
  Percent,
  Flag,
  Phone,
  ArrowLeft,
  Star,
  Flame,
} from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import { Product, Comment } from "@/lib/models";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, formatNumber } from "@/lib/format";
import { serialize } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured = [];
  let latestComments = [];
  try {
    await connectDB();
    featured = (
      await Product.find({ featured: true }).sort({ sold: -1 }).limit(8).lean()
    ).map(serialize);
    latestComments = await Comment.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
  } catch (e) {
    console.error("DB error on home:", e.message);
  }

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="سوپربایک در شوروم موتورسیکلت شیردل"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="absolute inset-0 bg-top-fade" />

        <div className="container-x relative flex min-h-[92vh] flex-col justify-center pt-28">
          <div className="max-w-2xl animate-fadeUp">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-[11px] font-bold text-accentSoft">
              <span className="h-2 w-2 animate-pulseDot rounded-full bg-accent" />{" "}
              نماینده رسمی یاماها • کاوازاکی • دوکاتی • بی‌ام‌و
            </span>
            <h1 className="hero-light-text mt-6 text-5xl font-black leading-[1.15] sm:text-6xl xl:text-7xl">
              قدرت را
              <br />
              <span className="bg-gradient-to-l from-accentSoft via-accent to-gold bg-clip-text text-transparent">
                لمس کن.
              </span>
            </h1>
            <p className="hero-light-soft mt-6 max-w-lg text-base leading-8">
              از سوپربایک‌های مسابقه‌ای تا اسکوترهای شهری؛ با ضمانت اصالت، سند
              رسمی، خرید نقدی و اقساطی و تست سواری حضوری در پیست اختصاصی
              موتورسیکلت شیردل.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/bikes" className="btn-primary text-base">
                مشاهده محصولات <ChevronLeft size={18} />
              </Link>
              <a href="tel:05152281234" className="btn-ghost text-base">
                <Phone size={18} /> مشاوره تلفنی
              </a>
            </div>

            {/* آمار */}
            <dl className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-x-reverse divide-line">
              {[
                ["۱٬۸۰۰+", "متر شوروم و پیست"],
                ["۱۲۰۰+", "تحویل در ۲۰ سال"],
                ["۹۸٪", "رضایت مشتریان"],
              ].map(([n, t]) => (
                <div key={t} className="px-4 first:pr-0">
                  <dt className="hero-light-text text-2xl font-black sm:text-3xl">
                    {n}
                  </dt>
                  <dd className="hero-light-soft mt-1 text-[11px] leading-4 opacity-80">
                    {t}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ============ برندها (مارکی) ============ */}
      <div className="overflow-hidden border-y border-line bg-panel/60 py-3">
        <div className="flex w-max animate-marquee gap-14 whitespace-nowrap text-lg font-black uppercase tracking-[0.3em] text-muted">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex gap-14">
              {[
                "Yamaha",
                "Kawasaki",
                "Ducati",
                "BMW Motorrad",
                "KTM",
                "Honda",
                "Vespa",
              ].map((b) => (
                <span key={b} className="transition hover:text-strong">
                  {b}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ============ دسته‌بندی‌ها ============ */}
      <section className="container-x py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">
              دسته‌بندی‌ها
            </p>
            <h2 className="mt-2 text-2xl font-black text-strong sm:text-3xl">
              برای هر سبک رانندگی
            </h2>
          </div>
          <Link
            href="/bikes"
            className="flex items-center gap-1 text-sm font-bold text-muted transition hover:text-strong"
          >
            همه محصولات <ArrowLeft size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.key}
              href={`/bikes?category=${c.key}`}
              className="card group flex flex-col items-center gap-3 p-6 text-center transition hover:border-accent/50"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel2 text-accent transition group-hover:scale-110 group-hover:bg-accent group-hover:text-strong">
                <Bike size={26} />
              </span>
              <span className="text-sm font-black text-strong">{c.label}</span>
              <span className="text-[10px] text-muted">
                {
                  [
                    "سوپربایک و ریس",
                    "نیکد شهری",
                    "ماجراجویی و تور",
                    "رفت‌وآمد شهری",
                    "نئوکلاسیک",
                  ][i]
                }
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ محصولات ویژه ============ */}
      <section className="border-t border-line bg-panel/30 py-14">
        <div className="container-x">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-accent">
                <Flame size={14} /> پرفروش‌ترین‌ها
              </p>
              <h2 className="mt-2 text-2xl font-black text-strong sm:text-3xl">
                موتورهای پرطرفدار
              </h2>
            </div>
            <Link
              href="/bikes?sort=sold"
              className="flex items-center gap-1 text-sm font-bold text-muted transition hover:text-strong"
            >
              مشاهده همه <ArrowLeft size={16} />
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="rounded-2xl border border-line bg-panel p-8 text-center text-muted">
              محصولی برای نمایش نیست. پایگاه‌داده را Seed کنید:{" "}
              <code className="text-gold">npm run seed</code>
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ چرا موتورسیکلت شیردل ============ */}
      <section className="container-x py-14">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "ضمانت اصالت",
              text: "سند رسمی، کارت گارانتی شرکتی و تأییدیه اصالت برای تمام مدل‌ها",
            },
            {
              icon: Flag,
              title: "تست سواری رایگان",
              text: "قبل از خرید، مدل رویایی‌ات را در پیست اختصاصی می‌راند",
            },
            {
              icon: Percent,
              title: "خرید اقساطی",
              text: "تا ۳۶ ماه با چک صیادی و بدون ضامن، ویژه مشتریان شیردل",
            },
            {
              icon: Wrench,
              title: "سرویس دوره‌ای",
              text: "۶ سرویس رایگان + یدک‌اصلی و کارگاه تخصصی با تکنسین‌های مجاز",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="card group p-6 transition hover:border-accent/40"
            >
              <Icon
                size={28}
                className="text-accent transition group-hover:scale-110"
              />
              <h3 className="mt-4 font-black text-strong">{title}</h3>
              <p className="mt-1.5 text-xs leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ نظرات مشتریان ============ */}
      {latestComments.length > 0 && (
        <section className="border-t border-line bg-panel/30 py-14">
          <div className="container-x">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">
              صدای مشتری
            </p>
            <h2 className="mt-2 text-2xl font-black text-strong">
              از زبان مشتریان شیردل
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {latestComments.map((c) => (
                <figure key={String(c._id)} className="card p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: c.rating || 5 }).map((_, i) => (
                      <Star key={i} size={13} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-sm leading-7 text-soft">
                    «{c.text}»
                  </blockquote>
                  <figcaption className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-bold text-strong">{c.name}</span>
                    <span className="text-muted">{c.productTitle}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA اقساط ============ */}
      <section className="container-x pb-16 pt-4">
        <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-l from-accent/20 via-panel to-panel p-8 sm:p-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-black text-strong sm:text-3xl">
                با اقساط ویژه ۱۴۰۵
                <br />
                مستقیم سوار شو.
              </h3>
              <p className="mt-2 max-w-md text-sm leading-7 text-soft">
                پیش‌پرداخت دلخواه، تحویل فوری و سند قطعی به نام شما — فقط تا
                پایان آذر ۱۴۰۵ و سقف ۵۰ دستگاه.
              </p>
            </div>
            <a
              href="tel:05152281234"
              className="btn-primary shrink-0 text-base"
            >
              <Phone size={18} /> ۰۵۱-۵۲۲۸۱۲۳۴
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
