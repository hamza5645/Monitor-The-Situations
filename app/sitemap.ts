import type { MetadataRoute } from "next";
import { PRESET_SITUATIONS } from "@/data/presetSituations";
import { getSituationUrl, SITE_URL } from "@/lib/situationSeo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...PRESET_SITUATIONS.map((situation) => ({
      url: getSituationUrl(situation.id),
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: situation.id === "default" ? 0.9 : 0.95,
    })),
  ];
}
