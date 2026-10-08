import { site } from "@/data/site";
import { primaryWhatsAppLine } from "@/lib/locations";
import type { ClinicLocation } from "@/types/medical";

export function buildWhatsAppLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** Enlace a la línea principal de WhatsApp con un mensaje (por defecto, el saludo base). */
export function clinicWhatsApp(message: string = site.defaultWhatsAppMessage): string {
  return buildWhatsAppLink(primaryWhatsAppLine().number, message);
}

/** Enlace al WhatsApp de una sede concreta. */
export function locationWhatsApp(location: ClinicLocation, message: string = site.defaultWhatsAppMessage): string {
  return buildWhatsAppLink(location.whatsapp.number, message);
}

/** "…una densitometría ósea." → "…una densitometría ósea en la sede de Los Olivos." */
export function withLocation(message: string, location: ClinicLocation): string {
  return `${message.replace(/\.\s*$/, "")} en la sede de ${location.name}.`;
}

/** "Hola SERMEKARE, quiero agendar una teleconsulta por gota." */
export function messageAbout(topic: string, doctorName?: string): string {
  const withDoctor = doctorName ? ` con ${doctorName}` : "";
  return `Hola ${site.name}, quiero agendar una teleconsulta${withDoctor} por ${topic.toLowerCase()}.`;
}

/** "Hola SERMEKARE, quiero agendar una teleconsulta con el Dr. Daniel Ccolcca." */
export function messageForDoctor(doctorName: string): string {
  return `Hola ${site.name}, quiero agendar una teleconsulta con ${doctorName}.`;
}

export function buildMailtoLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
