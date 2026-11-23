import ContactForm from "@/components/ContactForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata = { title: "تماس با ما" };

export default function ContactPage() {
  return (
    <div className="container-x pb-16 pt-28 lg:pt-32">
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent">
        تماس با ما
      </p>
      <h1 className="mt-2 text-3xl font-black text-strong sm:text-4xl">
        سر بزنید به شوروم شیردل
      </h1>
      <p className="mt-2 max-w-lg text-sm leading-7 text-muted">
        قهوه‌تان با ما؛ تست سواری هم رایگان است. برای بازدید از شوروم نیازی به
        وقت قبلی ندارید.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {[
            [
              MapPin,
              "آدرس",
              "خراسان رضوی، تربت جام، خیابان امام خمینی، روبه‌روی بازارچهٔ امام، پلاک ۱۲۰۰",
            ],
            [Phone, "تلفن", "۰۵۱-۵۲۲۸۱۲۳۴ — ۰۹۱۲۳۴۵۶۷۸۹"],
            [Mail, "ایمیل", "info@shirdelmotor.ir"],
            [Clock, "ساعت کاری", "شنبه تا پنجشنبه ۹ تا ۲۰ — جمعه‌ها ۱۰ تا ۱۷"],
          ].map(([Icon, title, text]) => (
            <div key={title} className="card flex items-start gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Icon size={20} />
              </span>
              <span>
                <span className="block text-xs font-black text-muted">
                  {title}
                </span>
                <span className="mt-1 block text-sm leading-7 text-strong">
                  {text}
                </span>
              </span>
            </div>
          ))}

          {/* نقشه ساده */}
          <div className="card flex h-44 items-center justify-center overflow-hidden bg-panel2">
            <svg
              viewBox="0 0 400 160"
              className="h-full w-full opacity-80"
              role="img"
              aria-label="نقشه تقریبی شوروم"
            >
              <rect width="400" height="160" fill="#17171f" />
              <path
                d="M0 110 H400 M60 0 V160 M180 0 V160 M310 0 V160"
                stroke="#26262f"
                strokeWidth="10"
              />
              <path
                d="M0 110 H400 M60 0 V160 M180 0 V160 M310 0 V160"
                stroke="#3a3a46"
                strokeWidth="2"
              />
              <circle cx="310" cy="110" r="26" fill="#e10600" opacity="0.25" />
              <circle cx="310" cy="110" r="9" fill="#e10600" />
              <text
                x="330"
                y="95"
                fill="#f4f4f5"
                fontSize="13"
                fontWeight="bold"
              >
                موتورسیکلت شیردل
              </text>
            </svg>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
