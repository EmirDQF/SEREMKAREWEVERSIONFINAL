import type { Doctor } from "@/types/medical";

export const CREDENTIALS_PENDING = "CMP/RNE por confirmar";

/** "CMP 12345 · RNE 6789", o «CMP/RNE por confirmar» si falta alguno (no se inventa). */
export function credentialsLabel(doctor: Pick<Doctor, "cmp" | "rne">): string {
  if (!doctor.cmp || !doctor.rne) return CREDENTIALS_PENDING;
  return `CMP ${doctor.cmp} · RNE ${doctor.rne}`;
}

/** True si el CMP está confirmado (solo entonces tiene sentido enlazar al buscador del CMP). */
export function hasVerifiableCmp(doctor: Pick<Doctor, "cmp">): boolean {
  return Boolean(doctor.cmp);
}

/** "14 años de experiencia", o null si no está confirmado (la UI oculta el sello). */
export function experienceLabel(doctor: Pick<Doctor, "yearsOfExperience">): string | null {
  const years = doctor.yearsOfExperience;
  if (years === null || years <= 0) return null;
  return `${years} ${years === 1 ? "año" : "años"} de experiencia`;
}
