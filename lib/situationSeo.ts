import type { Metadata } from "next";
import type { SituationConfig } from "@/types/situation";

export const SITE_URL = "https://monitorthesituations.com";

export function getSituationUrl(id: string): string {
  return `${SITE_URL}/s/${id}`;
}

export function getSituationOgImageUrl(id: string): string {
  return `${getSituationUrl(id)}/opengraph-image`;
}

export function getSituationShareTitle(situation: SituationConfig): string {
  return `Monitor the Situation: ${situation.name}`;
}

export function getSituationShareDescription(
  situation: SituationConfig
): string {
  return `Live view of flights, news, markets, earthquakes, alerts, and open-source intelligence feeds for ${situation.name}.`;
}

export function getSituationMetadata(situation: SituationConfig): Metadata {
  const title = getSituationShareTitle(situation);
  const description = getSituationShareDescription(situation);
  const url = getSituationUrl(situation.id);
  const image = getSituationOgImageUrl(situation.id);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: "Monitor the Situations",
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
