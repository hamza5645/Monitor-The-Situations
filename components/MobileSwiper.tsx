"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { useSituation } from "@/context/SituationContext";
import { getPanelById, type PanelConfig } from "@/config/panelRegistry";

export default function MobileSwiper() {
  const { activeLayout } = useSituation();

  // Get visible panels from layout, with fallback to default
  const visiblePanelIds = activeLayout?.visiblePanels ||
    activeLayout?.order ||
    ["twitter", "flight", "stocks", "news"];

  const panels = visiblePanelIds
    .map((id) => getPanelById(id))
    .filter((p): p is PanelConfig => p !== undefined);

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
        {panels.map((panel) => {
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
