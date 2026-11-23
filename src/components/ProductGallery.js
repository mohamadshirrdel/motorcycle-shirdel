'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Thumbs, A11y, Keyboard, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

export default function ProductGallery({ images, title }) {
  const list = images?.length ? images : ['/images/hero.jpg'];
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // عکس تکی → مثل قبل، بدون اسلایدر
  if (list.length <= 1) {
    return (
      <div className="card relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={list[0]} alt={title} className="max-h-full w-full object-contain p-6" />
      </div>
    );
  }

  return (
    <div dir="ltr" className="shirdel-gallery">
      {/* گالری اصلی — پخش خودکار، حلقه‌ای، نقطه‌های ناوبری */}
      <Swiper
        modules={[Autoplay, Navigation, Pagination, Thumbs, A11y, Keyboard]}
        className="card aspect-[4/3] !overflow-hidden bg-stage"
        loop
        keyboard={{ enabled: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        navigation
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        a11y={{ prevSlideMessage: 'تصویر قبلی', nextSlideMessage: 'تصویر بعدی' }}
      >
        {list.map((src, i) => (
          <SwiperSlide key={`${src}-${i}`} className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} — تصویر ${i + 1}`} className="max-h-full w-full object-contain p-6" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ریزعکس‌ها */}
      <Swiper
        modules={[A11y, Keyboard, FreeMode]}
        onSwiper={setThumbsSwiper}
        slidesPerView={Math.min(4, list.length)}
        spaceBetween={8}
        watchSlidesProgress
        freeMode
        a11y={{ enabled: true }}
        className="mt-3 !px-0.5"
      >
        {list.map((src, i) => (
          <SwiperSlide
            key={`thumb-${i}`}
            className="cursor-pointer overflow-hidden rounded-xl border border-line bg-stage transition swiper-slide-thumb"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} — بندانگشتی ${i + 1}`} className="h-20 w-full object-contain p-1.5 sm:h-24" />
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .shirdel-gallery .swiper-pagination-bullet {
          background: rgb(var(--muted));
          opacity: 0.7;
        }
        .shirdel-gallery .swiper-pagination-bullet-active {
          background: #e10600;
          opacity: 1;
        }
        .shirdel-gallery .swiper-button-prev,
        .shirdel-gallery .swiper-button-next {
          color: #fff;
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(2px);
        }
        .shirdel-gallery .swiper-button-prev::after,
        .shirdel-gallery .swiper-button-next::after {
          font-size: 15px;
          font-weight: 900;
        }
        .shirdel-gallery .swiper-button-prev:hover,
        .shirdel-gallery .swiper-button-next:hover {
          background: #e10600;
        }
        .shirdel-gallery .swiper-slide-thumb-active,
        .shirdel-gallery .swiper-slide-thumb.swiper-slide-thumb-active {
          border-color: #e10600;
          box-shadow: 0 0 0 2px rgb(225 6 0 / 0.4);
        }
      `}</style>
    </div>
  );
}
