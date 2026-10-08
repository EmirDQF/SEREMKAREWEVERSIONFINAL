import type { BookingPrefill, PainPoint } from "@/types/medical";

export const TRIAGE_EVENT = "sermekare:triage";
export const TRIAGE_SECTION_ID = "donde-te-duele";
export const BOOKING_EVENT = "sermekare:booking";
export const BOOKING_SECTION_ID = "agendar";

export type TriageTarget = PainPoint["target"];

/** Pide al triage "¿Dónde te duele?" que preseleccione una zona o condición. */
export function requestTriage(target: TriageTarget): void {
  window.dispatchEvent(new CustomEvent<TriageTarget>(TRIAGE_EVENT, { detail: target }));
}

/** Pide al agendador que precargue el paso 1 (molestia y, si encaja, el doctor recomendado). */
export function requestBooking(prefill: BookingPrefill): void {
  window.dispatchEvent(new CustomEvent<BookingPrefill>(BOOKING_EVENT, { detail: prefill }));
}
