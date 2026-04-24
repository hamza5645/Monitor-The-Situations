import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SituationDashboardApp from "@/components/SituationDashboardApp";
import { getPresetById, PRESET_SITUATIONS } from "@/data/presetSituations";
import { getSituationMetadata } from "@/lib/situationSeo";

interface SituationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export function generateStaticParams() {
  return PRESET_SITUATIONS.map((situation) => ({
    id: situation.id,
  }));
}

export async function generateMetadata({
  params,
}: SituationPageProps): Promise<Metadata> {
  const { id } = await params;
  const situation = getPresetById(id);

  if (!situation) {
    return {};
  }

  return getSituationMetadata(situation);
}

export default async function SituationPage({ params }: SituationPageProps) {
  const { id } = await params;
  const situation = getPresetById(id);

  if (!situation) {
    notFound();
  }

  return <SituationDashboardApp initialSituationId={situation.id} />;
}
