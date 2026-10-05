import type { Modality, RedFlag, SinceId } from "@/types/medical";

export const MODALITY_LABEL: Readonly<Record<Modality, string>> = {
  videollamada: "Videollamada",
  llamada: "Llamada",
};

export const MODALITY_HINT: Readonly<Record<Modality, string>> = {
  videollamada: "Te vemos por cámara desde tu celular o PC",
  llamada: "Si tu internet es lento o prefieres solo voz",
};

/** Señales de alarma: si alguna aplica, la teleconsulta no es el canal adecuado. */
export const RED_FLAGS: readonly RedFlag[] = [
  { id: "fractura", label: "Golpe fuerte o posible fractura reciente" },
  { id: "pecho", label: "Dolor de pecho" },
  { id: "aire", label: "Falta de aire" },
  { id: "fiebre", label: "Fiebre alta con una articulación caliente e hinchada" },
  { id: "debilidad", label: "Debilidad súbita (cara, brazo o pierna)" },
];

export const SINCE_OPTIONS: readonly { id: SinceId; label: string }[] = [
  { id: "dias", label: "Días" },
  { id: "semanas", label: "Semanas" },
  { id: "meses", label: "Meses" },
  { id: "anos", label: "Años" },
];

export const EMERGENCY = {
  notice: "La teleconsulta no es para emergencias.",
  action: "Acude a emergencias o llama al SAMU 106.",
  phone: "106",
  acknowledge: "Entiendo que no es una emergencia y quiero agendar igual",
} as const;
