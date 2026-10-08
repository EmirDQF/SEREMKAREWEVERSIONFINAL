import { describe, expect, it } from "vitest";
import {
  addDaysISO,
  availableSlots,
  dayChipLabel,
  formatSlot,
  isSlotAvailable,
  nextBusinessDays,
  slotStarts,
  weekdayOfISO,
} from "@/lib/slots";
import type { TeleconsultHours } from "@/types/medical";

const hours: TeleconsultHours = {
  confirmed: true,
  days: [1, 2, 3, 4, 5],
  opensAt: 19 * 60,
  closesAt: 22 * 60,
  slotMinutes: 30,
  minLeadMinutes: 30,
  timeZone: "America/Lima",
  label: "Lunes a viernes · 7:00 p.m. – 10:00 p.m.",
  shortLabel: "Lun–Vie desde 7:00 p.m.",
  closedLabel: "Sábados y domingos sin atención",
};

// 2026-10-05 es lunes; 2026-10-09 viernes; 2026-10-10 sábado.
const limaTime = (iso: string) => new Date(`${iso}-05:00`);
const ALL_SLOTS = [1140, 1170, 1200, 1230, 1260, 1290]; // 7:00 p.m. … 9:30 p.m.

describe("date helpers", () => {
  it("adds days across month boundaries", () => {
    expect(addDaysISO("2026-10-30", 3)).toBe("2026-11-02");
  });

  it("reads the weekday of an ISO date without depending on the host time zone", () => {
    expect(weekdayOfISO("2026-10-05")).toBe(1);
    expect(weekdayOfISO("2026-10-11")).toBe(0);
  });
});

describe("slotStarts", () => {
  it("creates 30-minute slots from 7 p.m.; the last one starts at 9:30 p.m.", () => {
    expect(slotStarts(hours)).toEqual(ALL_SLOTS);
  });

  it("respects a narrower doctor window inside the site hours", () => {
    expect(slotStarts(hours, { from: 20 * 60, to: 21 * 60 })).toEqual([1200, 1230]);
  });

  it("never goes outside the site hours", () => {
    expect(slotStarts(hours, { from: 18 * 60, to: 23 * 60 })).toEqual(ALL_SLOTS);
  });
});

describe("availableSlots", () => {
  it("before hours on a business day: every slot of today is available", () => {
    expect(availableSlots(hours, "2026-10-05", limaTime("2026-10-05T15:00:00"))).toEqual(ALL_SLOTS);
  });

  it("during hours: only slots starting at least 30 minutes from now", () => {
    // 7:40 p.m. + 30 min = 8:10 p.m. → desde las 8:30 p.m.
    expect(availableSlots(hours, "2026-10-05", limaTime("2026-10-05T19:40:00"))).toEqual([1230, 1260, 1290]);
  });

  it("a slot exactly 30 minutes away is still available", () => {
    expect(availableSlots(hours, "2026-10-05", limaTime("2026-10-05T21:00:00"))).toEqual([1290]);
  });

  it("after hours: no slots left today", () => {
    expect(availableSlots(hours, "2026-10-05", limaTime("2026-10-05T22:15:00"))).toEqual([]);
  });

  it("future business days are fully available", () => {
    expect(availableSlots(hours, "2026-10-06", limaTime("2026-10-05T21:30:00"))).toEqual(ALL_SLOTS);
  });

  it("weekends and past days have no slots", () => {
    expect(availableSlots(hours, "2026-10-10", limaTime("2026-10-05T12:00:00"))).toEqual([]);
    expect(availableSlots(hours, "2026-10-02", limaTime("2026-10-05T12:00:00"))).toEqual([]);
  });

  it("uses Lima time: 01:00 UTC Tuesday is still Monday 8 p.m. in Lima", () => {
    expect(availableSlots(hours, "2026-10-05", new Date("2026-10-06T01:00:00Z"))).toEqual([1230, 1260, 1290]);
  });
});

describe("nextBusinessDays", () => {
  it("includes today when there are slots left", () => {
    expect(nextBusinessDays(hours, 5, limaTime("2026-10-05T18:00:00"))).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
    ]);
  });

  it("skips today once its last slot is no longer bookable", () => {
    expect(nextBusinessDays(hours, 1, limaTime("2026-10-05T21:05:00"))).toEqual(["2026-10-06"]);
  });

  it("Friday after 10 p.m. jumps to Monday", () => {
    expect(nextBusinessDays(hours, 2, limaTime("2026-10-09T22:30:00"))).toEqual(["2026-10-12", "2026-10-13"]);
  });

  it("weekends book the next business days", () => {
    expect(nextBusinessDays(hours, 5, limaTime("2026-10-10T10:00:00"))).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
    ]);
    expect(nextBusinessDays(hours, 1, limaTime("2026-10-11T23:00:00"))).toEqual(["2026-10-12"]);
  });

  it("returns nothing when no day is a working day", () => {
    expect(nextBusinessDays({ ...hours, days: [] }, 5, limaTime("2026-10-05T10:00:00"))).toEqual([]);
  });
});

describe("isSlotAvailable", () => {
  it("accepts an upcoming slot and rejects a past or off-grid one", () => {
    const now = limaTime("2026-10-05T19:40:00");
    expect(isSlotAvailable(hours, { date: "2026-10-05", minutes: 1230 }, now)).toBe(true);
    expect(isSlotAvailable(hours, { date: "2026-10-05", minutes: 1170 }, now)).toBe(false);
    expect(isSlotAvailable(hours, { date: "2026-10-06", minutes: 1145 }, now)).toBe(false);
  });
});

describe("formatSlot", () => {
  it("reads like the WhatsApp template", () => {
    expect(formatSlot({ date: "2026-10-12", minutes: 1170 })).toBe("lunes 12 de octubre, 7:30 p.m.");
  });
});

describe("dayChipLabel", () => {
  it("says hoy / mañana or the weekday, plus a short date", () => {
    expect(dayChipLabel("2026-10-05", "2026-10-05")).toEqual({ title: "Hoy", subtitle: "5 oct" });
    expect(dayChipLabel("2026-10-06", "2026-10-05")).toEqual({ title: "Mañana", subtitle: "6 oct" });
    expect(dayChipLabel("2026-10-12", "2026-10-09")).toEqual({ title: "Lunes", subtitle: "12 oct" });
    expect(dayChipLabel("2026-12-01", "2026-11-28")).toEqual({ title: "Martes", subtitle: "1 dic" });
  });
});
