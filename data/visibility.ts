import type { SpecialtySlug } from "@/types/medical";

/**
 * Fuente única de lo que se publica. Nada se borra: cambiar un valor reactiva el contenido
 * (menú, footer, sitemap, enlaces internos y páginas, que responden 404 si están ocultas).
 *
 * Decisiones aprobadas (D1–D11, plan del consultorio virtual):
 * - D1: teleconsulta reumatológica activa (instrucción vigente del cliente), aunque la tarjeta
 *   de KARE SAC solo respalda la densitometría.
 * - D2: cifras, aseguradoras, testimonios y médicos de muestra ocultos hasta tener datos reales.
 * - D3: procedimientos y terapias que la tarjeta no respalda, ocultos.
 * - D8: la llamada telefónica no figura en el material real (WhatsApp, Zoom o Google Meet).
 * - D11: solo las especialidades que nombra el material de teleconsulta.
 */
export const visibility = {
  teleconsultation: true,
  stats: false,
  testimonials: false,
  insurers: false,
  sampleDoctors: false,
  sampleVideo: false,
  email: false,
  socials: false,
  phoneCallModality: false,
} as const;

/** Especialidades visibles (D11): las que nombra el index.html real de la teleconsulta. */
export const VISIBLE_SPECIALTIES: ReadonlySet<SpecialtySlug> = new Set<SpecialtySlug>([
  "artrosis",
  "artritis-reumatoide",
  "lupus",
  "osteoporosis",
]);

/** Pilares de servicio visibles (D3): diagnóstico (densitometría) y telemedicina. */
export const VISIBLE_SERVICE_PILLARS: ReadonlySet<string> = new Set(["apoyo-diagnostico", "telemedicina"]);

/** Servicios concretos respaldados dentro de los pilares visibles (D3). */
export const VISIBLE_SERVICES: ReadonlySet<string> = new Set(["Densitometría ósea", "Teleconsulta"]);

/** Tratamientos visibles (D3): ninguno está respaldado por el material real. */
export const VISIBLE_TREATMENTS: ReadonlySet<string> = new Set<string>();
