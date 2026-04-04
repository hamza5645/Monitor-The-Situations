"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { useSituation } from "@/context/SituationContext";
import {
  getPanelById,
  getCustomFeedId,
  isCustomFeedPanelId,
} from "@/config/panelRegistry";
import SingleFeedPanel from "./panels/SingleFeedPanel";

export default function MobileSwiper() {
  const { activeLayout } = useSituation();

  // Get visible panels from layout, with fallback to default
  const visiblePanelIds = activeLayout?.visiblePanels ||
    activeLayout?.order ||
    ["twitter", "flight", "stocks", "news"];

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
        {visiblePanelIds.map((panelId) => {
          if (isCustomFeedPanelId(panelId)) {
            return (
              <SwiperSlide key={panelId} className="h-full">
                <div className="h-full p-2">
                  <SingleFeedPanel feedId={getCustomFeedId(panelId)} />
                </div>
              </SwiperSlide>
            );
          }

          const panel = getPanelById(panelId);
          if (!panel) return null;

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
