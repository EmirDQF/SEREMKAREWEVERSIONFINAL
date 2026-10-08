"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { specialties } from "@/data/specialties";
import { treatments } from "@/data/treatments";
import { doctors } from "@/data/doctors";
import { LocationWhatsAppPicker } from "@/components/shared/LocationWhatsAppPicker";
import { messageAbout, messageForDoctor } from "@/lib/whatsapp";
import { useOpenStatus } from "@/lib/use-open-status";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/** Mensaje de WhatsApp adaptado a la página (p. ej. /especialidades/gota → "…por gota."). */
export function messageForPath(pathname: string): string {
  const [section, slug] = pathname.split("/").filter(Boolean);
  if (section === "especialidades" && slug) {
    const specialty = specialties.find((s) => s.slug === slug);
    if (specialty) return messageAbout(specialty.shortName);
  }
  if (section === "tratamientos" && slug) {
    const treatment = treatments.find((t) => t.slug === slug);
    if (treatment) return messageAbout(treatment.name);
  }
  if (section === "staff" && slug) {
    const doctor = doctors.find((d) => d.slug === slug);
    if (doctor) return messageForDoctor(doctor.name);
  }
  return site.defaultWhatsAppMessage;
}

/** Botón flotante (tablet y escritorio; en móvil lo reemplaza la MobileActionBar). */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const status = useOpenStatus();
  const isOpen = status?.isOpen === true;
  const statusLabel = isOpen ? "En línea" : "Déjanos tu mensaje";

  return (
    <LocationWhatsAppPicker
      message={messageForPath(pathname)}
      className="group fixed bottom-6 right-6 z-50 hidden md:block"
      triggerClassName="flex items-center gap-3 rounded-full"
      triggerLabel={`Escríbenos por WhatsApp (${statusLabel}): elige tu sede`}
      panelClassName="bottom-full right-0 mb-4"
    >
      <span
        aria-hidden
        className="glass pointer-events-none translate-x-2 rounded-2xl px-4 py-2.5 text-[0.95rem] opacity-0 shadow-soft transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-has-[button:focus-visible]:translate-x-0 group-has-[button:focus-visible]:opacity-100 group-has-[[aria-expanded=true]]:hidden"
      >
        <span className="block font-display font-semibold text-heading">¿Tienes dudas? Escríbenos</span>
        <span className="block text-sm text-muted">Te ayudamos a elegir especialista</span>
      </span>
      <span className="relative grid size-16 place-items-center rounded-full bg-whatsapp text-on-whatsapp-brand shadow-lift transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        <WhatsAppIcon className="size-8" />
        <span
          aria-hidden
          className={cn(
            "absolute -top-2 right-1/2 inline-flex translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.7rem] font-bold shadow-soft",
            isOpen ? "border border-online-border bg-card-solid text-online" : "bg-navy text-on-navy dark:bg-on-navy dark:text-navy",
            status === null && "invisible",
          )}
        >
          {isOpen ? <span className="online-dot" /> : null}
          {isOpen ? "En línea" : "Déjanos tu mensaje"}
        </span>
      </span>
    </LocationWhatsAppPicker>
  );
}
