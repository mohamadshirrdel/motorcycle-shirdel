/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // تصاویر محلی هستند؛ در صورت استفاده از لینک خارجی، دامنه‌ها را اینجا آزاد کنید
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = nextConfig;
