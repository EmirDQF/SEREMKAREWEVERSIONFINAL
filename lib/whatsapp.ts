import { site } from "@/data/site";

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
