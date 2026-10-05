import { site } from "@/data/site";
import { MODALITY_LABEL } from "@/data/teleconsult";
import { todayISO } from "@/lib/schedule";
import { formatDayISO } from "@/lib/slots";
import type { Appointment } from "@/types/medical";

export const FIELD_LIMITS = {
  nameMax: 80,
  reasonMax: 500,
  phoneMinDigits: 7,
  phoneMaxDigits: 15,
} as const;

export type AppointmentField = "fullName" | "phone" | "reason" | "consent" | "preferredDate" | "specialty";
export type AppointmentErrors = Partial<Record<AppointmentField, string>>;

export function buildWhatsAppLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** Enlace de WhatsApp de la clínica con un mensaje (por defecto, el saludo base). */
export function clinicWhatsApp(message: string = site.whatsapp.defaultMessage): string {
  return buildWhatsAppLink(site.whatsapp.number, message);
}

/** "Hola SERMEKARE, quiero agendar una teleconsulta por gota." */
export function messageAbout(topic: string, doctorName?: string): string {
  const withDoctor = doctorName ? ` con ${doctorName}` : "";
  return `Hola ${site.name}, quiero agendar una teleconsulta${withDoctor} por ${topic.toLowerCase()}.`;
}

/** "Hola SERMEKARE, quiero agendar una teleconsulta con Dra. Valeria Quintana." */
export function messageForDoctor(doctorName: string): string {
  return `Hola ${site.name}, quiero agendar una teleconsulta con ${doctorName}.`;
}

export function buildMailtoLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** "2026-10-12" → "lunes 12 de octubre" (sin depender de la zona horaria del navegador). */
export function formatPreferredDate(iso: string): string {
  return formatDayISO(iso);
}

export function buildAppointmentMessage(a: Appointment): string {
  const lines = [
    site.whatsapp.defaultMessage,
    "",
    `• Modalidad: ${MODALITY_LABEL[a.modality]}`,
    `• Para: ${a.forWhom === "mi" ? "Mí" : "Un familiar"}`,
    `• Especialidad: ${a.specialty.trim()}`,
    a.doctorName ? `• Médico: ${a.doctorName}` : null,
    `• Nombre: ${a.fullName.trim()}`,
    `• Teléfono: ${a.phone.trim()}`,
    `• Motivo: ${a.reason.trim()}`,
    a.preferredDate ? `• Fecha preferida: ${formatPreferredDate(a.preferredDate)}` : null,
  ];
  return lines.filter((line): line is string => line !== null).join("\n");
}

export function validateAppointment(a: Appointment, consent: boolean, now: Date = new Date()): AppointmentErrors {
  const errors: AppointmentErrors = {};
  const name = a.fullName.trim();
  const phoneDigits = a.phone.replace(/\D/g, "").length;
  const reason = a.reason.trim();

  if (!a.specialty.trim()) errors.specialty = "Elige una especialidad o «Aún no lo sé».";
  if (name.length < 2) errors.fullName = "Escribe tu nombre (o el de tu familiar).";
  else if (name.length > FIELD_LIMITS.nameMax) errors.fullName = `Máximo ${FIELD_LIMITS.nameMax} caracteres.`;
  if (phoneDigits < FIELD_LIMITS.phoneMinDigits || phoneDigits > FIELD_LIMITS.phoneMaxDigits) {
    errors.phone = "Escribe un teléfono válido, por ejemplo 987 654 321.";
  }
  if (reason.length < 3) errors.reason = "Cuéntanos brevemente el motivo de la consulta.";
  else if (reason.length > FIELD_LIMITS.reasonMax) errors.reason = `Máximo ${FIELD_LIMITS.reasonMax} caracteres.`;
  if (a.preferredDate && a.preferredDate < todayISO(site.hours.timeZone, now)) {
    errors.preferredDate = "Elige una fecha de hoy en adelante.";
  }
  if (!consent) errors.consent = "Necesitamos tu autorización para usar tus datos y contactarte.";
  return errors;
}
