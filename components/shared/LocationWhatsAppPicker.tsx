"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { HelpCircle, MapPin } from "lucide-react";
import { site } from "@/data/site";
import { primaryWhatsAppLine } from "@/lib/locations";
import { clinicWhatsApp, locationWhatsApp, withLocation } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface LocationWhatsAppPickerProps {
  /** Mensaje base; se le agrega «en la sede de …» según la sede elegida. */
  message?: string;
  /** Contenido visible del botón que abre el selector. */
  children: ReactNode;
  /** Nombre accesible del botón cuando su contenido es solo un icono. */
  triggerLabel?: string;
  className?: string;
  triggerClassName?: string;
  /** Posición del panel (p. ej. "bottom-full right-0 mb-3"). */
  panelClassName?: string;
}

const LINK_SELECTOR = "a[href]";
const NEW_TAB_NOTICE = " (abre WhatsApp en otra pestaña)";

/** Mueve el foco entre los enlaces del panel con las flechas, Inicio y Fin. */
function moveFocus(panel: HTMLElement, key: string): boolean {
  const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>(LINK_SELECTOR));
  const current = links.indexOf(document.activeElement as HTMLAnchorElement);
  const last = links.length - 1;
  const next =
    key === "ArrowDown" ? (current >= last ? 0 : current + 1)
    : key === "ArrowUp" ? (current <= 0 ? last : current - 1)
    : key === "Home" ? 0
    : key === "End" ? last
    : null;
  if (next === null) return false;
  links[next]?.focus();
  return true;
}

/** Botón que despliega las sedes y abre el WhatsApp de la sede elegida. */
export function LocationWhatsAppPicker({
  message = site.defaultWhatsAppMessage,
  children,
  triggerLabel,
  className,
  triggerClassName,
  panelClassName = "top-full left-0 mt-2",
}: LocationWhatsAppPickerProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>(LINK_SELECTOR)?.focus();
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      close(true);
      return;
    }
    if (panelRef.current && moveFocus(panelRef.current, event.key)) event.preventDefault();
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative", className)}
      onKeyDown={open ? handleKeyDown : undefined}
      onBlur={(event) => {
        if (open && !rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        className={triggerClassName}
      >
        {children}
      </button>
      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        className={cn(
          "absolute z-50 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-line bg-card-solid p-3 text-left shadow-lift",
          panelClassName,
        )}
      >
        <p className="px-2 pb-2 pt-1 font-display font-semibold text-heading">¿A qué sede quieres escribir?</p>
        <ul className="space-y-1">
          {site.locations.map((location) => (
            <li key={location.id}>
              <a
                href={locationWhatsApp(location, withLocation(message, location))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => close(false)}
                className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-teal-tint focus-visible:bg-teal-tint"
              >
                <MapPin aria-hidden strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="block font-semibold text-heading">{location.name}</span>
                  <span className="block text-sm text-muted">{location.reference ?? location.street}</span>
                  <span className="block text-sm font-semibold text-primary">{location.whatsapp.display}</span>
                  <span className="sr-only">{NEW_TAB_NOTICE}</span>
                </span>
              </a>
            </li>
          ))}
          <li>
            <a
              href={clinicWhatsApp(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => close(false)}
              className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-teal-tint focus-visible:bg-teal-tint"
            >
              <HelpCircle aria-hidden strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-semibold text-heading">No sé cuál me queda cerca</span>
                <span className="block text-sm text-muted">Te orientamos por la línea principal</span>
                <span className="block text-sm font-semibold text-primary">{primaryWhatsAppLine().display}</span>
                <span className="sr-only">{NEW_TAB_NOTICE}</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
