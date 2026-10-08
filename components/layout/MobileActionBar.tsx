import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { LocationWhatsAppPicker } from "@/components/shared/LocationWhatsAppPicker";
import { BOOKING_HREF } from "@/data/navigation";
import { primaryWhatsAppLine } from "@/lib/locations";

const ACTION =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.8rem] font-semibold transition-transform active:scale-95 [&_svg]:size-5";

/** Barra inferior fija en móvil: Agendar · WhatsApp (elige sede) · Llamar a la línea principal. */
export function MobileActionBar() {
  return (
    <nav
      aria-label="Acciones rápidas"
      className="glass fixed inset-x-0 bottom-0 z-50 flex gap-2 border-x-0 border-b-0 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
    >
      <Link href={BOOKING_HREF} className={`${ACTION} bg-primary text-on-primary`}>
        <CalendarCheck aria-hidden strokeWidth={1.75} />
        Agendar
      </Link>
      <LocationWhatsAppPicker
        className="static flex flex-1"
        triggerClassName={`${ACTION} w-full bg-whatsapp-strong text-on-whatsapp`}
        panelClassName="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] w-auto"
      >
        <WhatsAppIcon />
        WhatsApp
      </LocationWhatsAppPicker>
      <a href={`tel:+${primaryWhatsAppLine().number}`} className={`${ACTION} border border-line bg-card-solid text-heading`}>
        <Phone aria-hidden strokeWidth={1.75} />
        Llamar
      </a>
    </nav>
  );
}
