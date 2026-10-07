import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, Hospital, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { buttonVariants } from "@/components/ui/button";
import { LOCATIONS_PATH } from "@/data/navigation";
import { site } from "@/data/site";
import { formatLocationAddress } from "@/lib/locations";
import { locationWhatsApp, withLocation } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import type { ClinicLocation } from "@/types/medical";

interface LocationCardProps {
  location: ClinicLocation;
  /** Nivel del título según la jerarquía de la página. */
  as?: "h2" | "h3";
  /** Enlace a la página propia de la sede (/sedes/[slug]). */
  showDetailLink?: boolean;
  className?: string;
}

/** Tarjeta de sede: referencia destacada, dirección, horario, WhatsApp de la sede y cómo llegar. */
export function LocationCard({ location, as: Heading = "h3", showDetailLink = true, className }: LocationCardProps) {
  return (
    <article className={cn("flex h-full flex-col rounded-[1.75rem] border border-line bg-card-solid p-6 shadow-soft", className)}>
      <Heading className="font-display text-xl font-bold text-heading">Sede {location.name}</Heading>
      {location.reference ? (
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-teal-tint px-3 py-2 font-semibold text-heading">
          <Hospital aria-hidden strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-primary" />
          {location.reference}
        </p>
      ) : null}
      <p className="mt-3 flex gap-2 text-fg">
        <MapPin aria-hidden strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-primary" />
        {formatLocationAddress(location)}
      </p>
      <p className="mt-2 flex gap-2 text-muted">
        <Clock aria-hidden strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-primary" />
        {location.hours.label}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6">
        <a
          href={locationWhatsApp(location, withLocation(site.defaultWhatsAppMessage, location))}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "whatsapp" })}
        >
          <WhatsAppIcon /> WhatsApp {location.whatsapp.display}
          <span className="sr-only"> (abre WhatsApp en otra pestaña)</span>
        </a>
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-1.5 font-display font-semibold text-primary hover:underline"
        >
          Cómo llegar <ArrowUpRight aria-hidden className="size-5" />
          <span className="sr-only"> a la sede {location.name} (Google Maps, pestaña nueva)</span>
        </a>
        {showDetailLink ? (
          <Link
            href={`${LOCATIONS_PATH}/${location.id}`}
            className="inline-flex min-h-12 items-center gap-1.5 font-display font-semibold text-primary hover:underline"
          >
            Ver sede<span className="sr-only"> {location.name}</span> <ArrowRight aria-hidden className="size-5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
