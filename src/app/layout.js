import "./globals.css";
import { Vazirmatn } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata = {
  title: {
    default: "موتورسیکلت شیردل | فروشگاه تخصصی موتورسیکلت",
    template: "%s | موتورسیکلت شیردل",
  },
  description:
    "موتورسیکلت شیردل؛ فروشگاه تخصصی موتورسیکلت در تربت جام (خراسان رضوی) — نماینده رسمی برندهای مطرح دنیا: یاماها، کاوازاکی، دوکاتی، بی‌ام‌و، کی‌تی‌ام. فروش نقدی و اقساطی، تست سواری، گارانتی اصالت و سرویس دوره‌ای.",
};

const themeInit = `try{var t=localStorage.getItem('shirdel-theme');if(!t){t='dark'}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazir.variable}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <CartProvider>
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
