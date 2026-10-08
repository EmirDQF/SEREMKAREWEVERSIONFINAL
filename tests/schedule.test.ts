import { describe, expect, it } from "vitest";
import { describeDays, formatTime, getOpenStatus, todayISO } from "@/lib/schedule";
import type { OpeningHours } from "@/types/medical";

const hours: OpeningHours = {
  days: [1, 2, 3, 4, 5],
  opensAt: 19 * 60,
  closesAt: 22 * 60,
  timeZone: "America/Lima",
  label: "Lunes a viernes · 7:00 p.m. – 10:00 p.m.",
  closedLabel: "Sábados y domingos sin atención",
  confirmed: true,
};

// Lima es UTC-5 todo el año (sin horario de verano). 2026-10-05 es lunes.
const limaTime = (iso: string) => new Date(`${iso}-05:00`);

describe("getOpenStatus (doctores en línea / próxima atención)", () => {
  it("before hours on a weekday: next attention is today", () => {
    const status = getOpenStatus(hours, limaTime("2026-10-05T18:59:00"));
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe("Próxima atención: hoy a las 7:00 p.m.");
  });

  it("during hours on a weekday: doctors online until 10 p.m.", () => {
    const status = getOpenStatus(hours, limaTime("2026-10-05T19:00:00"));
    expect(status.isOpen).toBe(true);
    expect(status.headline).toBe("Doctores en línea ahora");
    expect(status.detail).toBe("hasta las 10:00 p.m.");
    expect(status.label).toBe("Doctores en línea ahora · hasta las 10:00 p.m.");
  });

  it("is still online one minute before closing", () => {
    expect(getOpenStatus(hours, limaTime("2026-10-07T21:59:00")).isOpen).toBe(true);
  });

  it("after hours on a weekday: next attention is tomorrow", () => {
    const status = getOpenStatus(hours, limaTime("2026-10-05T22:00:00"));
    expect(status.isOpen).toBe(false);
    expect(status.headline).toBe("Próxima atención");
    expect(status.detail).toBe("mañana a las 7:00 p.m.");
  });

  it("Friday after 10 p.m. jumps to Monday", () => {
    expect(getOpenStatus(hours, limaTime("2026-10-09T22:30:00")).label).toBe("Próxima atención: el lunes a las 7:00 p.m.");
  });

  it("Saturday jumps to Monday, even during evening hours", () => {
    const status = getOpenStatus(hours, limaTime("2026-10-10T20:00:00"));
    expect(status.isOpen).toBe(false);
    expect(status.detail).toBe("el lunes a las 7:00 p.m.");
  });

  it("Sunday: Monday is tomorrow", () => {
    expect(getOpenStatus(hours, limaTime("2026-10-11T12:00:00")).detail).toBe("mañana a las 7:00 p.m.");
  });

  it("uses Lima time, not the host time zone", () => {
    // 2026-10-06T00:30Z es martes en UTC, pero lunes 7:30 p.m. en Lima → en línea
    expect(getOpenStatus(hours, new Date("2026-10-06T00:30:00Z")).isOpen).toBe(true);
    // 2026-10-10T02:00Z es sábado en UTC, pero viernes 9:00 p.m. en Lima → en línea
    expect(getOpenStatus(hours, new Date("2026-10-10T02:00:00Z")).isOpen).toBe(true);
  });

  it("falls back to the closed label when there are no working days", () => {
    expect(getOpenStatus({ ...hours, days: [] }, limaTime("2026-10-05T20:00:00")).label).toBe(hours.closedLabel);
  });
});

describe("formatTime", () => {
  it("formats minutes from midnight in 12-hour Peruvian style", () => {
    expect(formatTime(19 * 60)).toBe("7:00 p.m.");
    expect(formatTime(21 * 60 + 30)).toBe("9:30 p.m.");
    expect(formatTime(0)).toBe("12:00 a.m.");
    expect(formatTime(12 * 60)).toBe("12:00 p.m.");
  });
});

describe("todayISO", () => {
  it("returns the calendar date in Lima", () => {
    expect(todayISO("America/Lima", new Date("2026-10-06T03:00:00Z"))).toBe("2026-10-05");
  });
});

describe("describeDays", () => {
  it("collapses consecutive runs and lists the rest", () => {
    expect(describeDays([1, 2, 3, 4, 5])).toBe("Lunes a viernes");
    expect(describeDays([1, 3, 5])).toBe("Lunes, miércoles y viernes");
    expect(describeDays([2, 4])).toBe("Martes y jueves");
    expect(describeDays([1, 2, 3, 5])).toBe("Lunes a miércoles y viernes");
    expect(describeDays([4])).toBe("Jueves");
    expect(describeDays([])).toBe("");
  });
});
