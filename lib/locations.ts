import { site } from "@/data/site";
import { formatAddress } from "@/lib/maps";
import { getOpenStatus, type OpenStatus } from "@/lib/schedule";
import type { ClinicLocation, LocationId, WhatsAppLine } from "@/types/medical";

/** Sede por slug de URL; undefined si no existe (para notFound()). */
export function findLocation(slug: string): ClinicLocation | undefined {
  return site.locations.find((location) => location.id === slug);
}

export function getLocation(id: LocationId): ClinicLocation {
  const location = findLocation(id);
  if (!location) throw new Error(`Sede no configurada en data/site.ts: ${id}`);
  return location;
}

export function primaryLocation(): ClinicLocation {
  return getLocation(site.primaryLocationId);
}

export function allWhatsAppLines(): readonly WhatsAppLine[] {
  return site.whatsappLines;
}

export function primaryWhatsAppLine(): WhatsAppLine {
  return site.whatsappLines[0];
}

/** "Los Olivos, Callao y Puente Piedra" */
export function locationNamesLabel(): string {
  const names = site.locations.map((location) => location.name);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

/** "Av. Alfredo Mendiola 5875, Urb. Villasol, Los Olivos, Lima" */
export function formatLocationAddress(location: ClinicLocation): string {
  return formatAddress(location);
}

/** Abierto/cerrado de la sede; null si su horario aún no está confirmado (no mostramos datos falsos). */
export function locationOpenStatus(location: ClinicLocation, now: Date = new Date()): OpenStatus | null {
  return location.hours.confirmed ? getOpenStatus(location.hours, now) : null;
}
