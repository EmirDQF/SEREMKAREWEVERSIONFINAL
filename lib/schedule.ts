import type { OpeningHours, Weekday } from "@/types/medical";

export interface OpenStatus {
  /** Hay doctores atendiendo teleconsultas en este momento. */
  isOpen: boolean;
  /** "Doctores en línea ahora" / "Próxima atención" */
  headline: string;
  /** "hasta las 10:00 p.m." / "el lunes a las 7:00 p.m." */
  detail: string;
  /** Frase completa para lectores de pantalla y espacios amplios. */
  label: string;
}

const WEEKDAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"] as const;
const WEEKDAY_INDEX: Record<string, Weekday> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const MINUTES_PER_HOUR = 60;
const DAYS_PER_WEEK = 7;
const ONLINE_HEADLINE = "Doctores en línea ahora";
const NEXT_HEADLINE = "Próxima atención";

/** 480 → "8:00 a.m.", 1140 → "7:00 p.m." */
export function formatTime(minutesFromMidnight: number): string {
  const hours24 = Math.floor(minutesFromMidnight / MINUTES_PER_HOUR);
  const minutes = minutesFromMidnight % MINUTES_PER_HOUR;
  const suffix = hours24 < 12 ? "a.m." : "p.m.";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** Día de la semana y minutos desde medianoche en la zona horaria indicada. */
export function getZonedClock(date: Date, timeZone: string): { weekday: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    weekday: WEEKDAY_INDEX[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * MINUTES_PER_HOUR + Number(get("minute")),
  };
}

/** "hoy a las 7:00 p.m." / "mañana a las 7:00 p.m." / "el lunes a las 7:00 p.m.", o null si no hay días hábiles. */
function describeNextOpening(hours: OpeningHours, weekday: Weekday, minutes: number): string | null {
  const opens = formatTime(hours.opensAt);
  if (hours.days.includes(weekday) && minutes < hours.opensAt) return `hoy a las ${opens}`;
  for (let offset = 1; offset <= DAYS_PER_WEEK; offset++) {
    const day = ((weekday + offset) % DAYS_PER_WEEK) as Weekday;
    if (!hours.days.includes(day)) continue;
    return offset === 1 ? `mañana a las ${opens}` : `el ${WEEKDAY_NAMES[day]} a las ${opens}`;
  }
  return null;
}

/** Estado en vivo de la teleconsulta en la zona horaria del sitio (Lima). */
export function getOpenStatus(hours: OpeningHours, now: Date = new Date()): OpenStatus {
  const { weekday, minutes } = getZonedClock(now, hours.timeZone);
  const isOpen = hours.days.includes(weekday) && minutes >= hours.opensAt && minutes < hours.closesAt;
  if (isOpen) {
    const detail = `hasta las ${formatTime(hours.closesAt)}`;
    return { isOpen, headline: ONLINE_HEADLINE, detail, label: `${ONLINE_HEADLINE} · ${detail}` };
  }
  const next = describeNextOpening(hours, weekday, minutes);
  if (!next) return { isOpen, headline: NEXT_HEADLINE, detail: hours.closedLabel, label: hours.closedLabel };
  return { isOpen, headline: NEXT_HEADLINE, detail: next, label: `${NEXT_HEADLINE}: ${next}` };
}

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria indicada. */
export function todayISO(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Agrupa días consecutivos: [1,2,3,5] → [[1,3],[5,5]]. */
function dayRuns(days: readonly Weekday[]): [Weekday, Weekday][] {
  const sorted = [...days].sort((a, b) => a - b);
  return sorted.reduce<[Weekday, Weekday][]>((runs, day) => {
    const last = runs.at(-1);
    if (last && day === last[1] + 1) return [...runs.slice(0, -1), [last[0], day]];
    return [...runs, [day, day]];
  }, []);
}

/** [1,2,3,4,5] → "Lunes a viernes" · [1,3,5] → "Lunes, miércoles y viernes" */
export function describeDays(days: readonly Weekday[]): string {
  const parts = dayRuns(days).flatMap(([start, end]): string[] => {
    if (start === end) return [WEEKDAY_NAMES[start]];
    if (end - start === 1) return [WEEKDAY_NAMES[start], WEEKDAY_NAMES[end]];
    return [`${WEEKDAY_NAMES[start]} a ${WEEKDAY_NAMES[end]}`];
  });
  if (parts.length === 0) return "";
  const text = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} y ${parts.at(-1)}`;
  return capitalize(text);
}
