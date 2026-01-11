"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import TwitterPanel from "./panels/TwitterPanel";
import FlightPanel from "./panels/FlightPanel";
import StocksPanel from "./panels/StocksPanel";
import NewsPanel from "./panels/NewsPanel";

const MOBILE_PANELS = [
  { id: "twitter", component: TwitterPanel },
  { id: "flight", component: FlightPanel },
  { id: "stocks", component: StocksPanel },
  { id: "news", component: NewsPanel },
];

export default function MobileSwiper() {
  return (
    <div className="w-full h-full">
      <Swiper
        modules={[Pagination]}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        spaceBetween={0}
        slidesPerView={1}
        className="h-full"
      >
        {MOBILE_PANELS.map((panel) => {
          const Component = panel.component;
          return (
            <SwiperSlide key={panel.id} className="h-full">
              <div className="h-full p-2">
                <Component />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
