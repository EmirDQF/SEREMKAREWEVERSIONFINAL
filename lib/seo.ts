import type { Metadata } from "next";
import { LOCATIONS_PATH } from "@/data/navigation";
import { site } from "@/data/site";
import type { ClinicLocation } from "@/types/medical";

interface PageSeo {
  title: string;
  description: string;
  path?: string;
}

/** Metadata consistente por página (canonical, Open Graph y Twitter). */
export function buildMetadata({ title, description, path = "/" }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: "es_PE",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** «Densitometría ósea en el Callao»: como lo busca el paciente en Google. */
export function locationPageTitle(location: ClinicLocation): string {
  return `Densitometría ósea en ${location.placeName ?? location.name}`;
}

/** Metadata propia de cada sede: título, descripción, canonical y Open Graph únicos. */
export function locationMetadata(location: ClinicLocation): Metadata {
  const title = `${locationPageTitle(location)} | ${site.name}`;
  return {
    ...buildMetadata({ title, description: location.intro, path: `${LOCATIONS_PATH}/${location.id}` }),
    title: { absolute: title },
  };
}

export const DEFAULT_DESCRIPTION =
  "Reumatólogos certificados en Lima Norte y Callao. Diagnóstico oportuno de artrosis, artritis reumatoide, gota, lupus y osteoporosis, infiltraciones ecoguiadas y teleconsulta. Agenda por WhatsApp.";
