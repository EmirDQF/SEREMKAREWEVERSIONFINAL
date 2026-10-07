"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatLocationAddress } from "@/lib/locations";
import { cn } from "@/lib/utils";
import type { ClinicLocation } from "@/types/medical";

interface MapFacadeProps {
  location: ClinicLocation;
  className?: string;
}

/**
 * Fachada del mapa: Google Maps (y sus cookies y scripts) solo se carga cuando el usuario lo pide.
 * La altura es fija antes y después del clic para no mover el contenido (CLS 0).
 */
export function MapFacade({ location, className }: MapFacadeProps) {
  const [loaded, setLoaded] = useState(false);
  const title = `Mapa de la sede ${location.name}: ${formatLocationAddress(location)}`;

  return (
    <div className={cn("relative h-80 overflow-hidden rounded-[2rem] border border-line bg-bg-alt shadow-soft", className)}>
      {loaded ? (
        <iframe src={location.mapsEmbedUrl} title={title} referrerPolicy="no-referrer-when-downgrade" className="size-full" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,var(--teal-tint),transparent_70%)] p-6 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-primary text-on-primary shadow-lift">
            <MapPin aria-hidden strokeWidth={1.75} className="size-7" />
          </span>
          <p className="max-w-xs text-muted">
            {location.reference ?? formatLocationAddress(location)}
          </p>
          <button type="button" onClick={() => setLoaded(true)} className={buttonVariants({ variant: "outline" })}>
            Ver mapa de la sede {location.name}
          </button>
          <p className="max-w-xs text-xs text-muted">Al cargarlo, Google Maps puede usar cookies.</p>
        </div>
      )}
    </div>
  );
}
