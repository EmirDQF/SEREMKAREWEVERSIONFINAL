import { describe, expect, it } from "vitest";
import {
  appointmentWhatsAppNumber,
  buildAppointmentMessage,
  buildMailtoLink,
  buildWhatsAppLink,
  locationWhatsApp,
  messageAbout,
  messageForDoctor,
  validateAppointment,
  withLocation,
} from "@/lib/whatsapp";
import { getLocation, primaryWhatsAppLine } from "@/lib/locations";
import type { Appointment } from "@/types/medical";

const base: Appointment = {
  modality: "presencial",
  location: "callao",
  forWhom: "familiar",
  specialty: "Artrosis",
  fullName: "  María Pérez ",
  phone: "987 654 321",
  reason: "Dolor de rodilla al subir escaleras",
  preferredDate: "2026-10-12",
};

describe("buildWhatsAppLink", () => {
  it("encodes the message and strips non-digits from the number", () => {
    const link = buildWhatsAppLink("+51 994 931 540", "Hola & gracias");
    expect(link).toBe("https://wa.me/51994931540?text=Hola%20%26%20gracias");
  });
});

describe("buildAppointmentMessage", () => {
  it("includes every field in a structured, trimmed message", () => {
    const msg = buildAppointmentMessage({ ...base, doctorName: "Dra. Lucía Andrade" });
    expect(msg).toContain("Hola SERMEKARE, quisiera agendar una consulta.");
    expect(msg).toContain("• Modalidad: Presencial");
    expect(msg).toContain("• Sede: Callao (frente al Hosp. Daniel A. Carrión)");
    expect(msg).toContain("• Para: Un familiar");
    expect(msg).toContain("• Especialidad: Artrosis");
    expect(msg).toContain("• Médico: Dra. Lucía Andrade");
    expect(msg).toContain("• Nombre: María Pérez");
    expect(msg).toContain("• Teléfono: 987 654 321");
    expect(msg).toContain("• Motivo: Dolor de rodilla al subir escaleras");
    expect(msg).toContain("• Fecha preferida: lunes 12 de octubre");
  });

  it("says «la más cercana» when the patient does not know the branch", () => {
    expect(buildAppointmentMessage({ ...base, location: "cualquiera" })).toContain(
      "• Sede: La más cercana (por coordinar)",
    );
  });

  it("omits optional fields and the branch for teleconsultations", () => {
    const msg = buildAppointmentMessage({ ...base, preferredDate: undefined, modality: "teleconsulta", forWhom: "mi" });
    expect(msg).not.toContain("Médico");
    expect(msg).not.toContain("Fecha preferida");
    expect(msg).not.toContain("Sede");
    expect(msg).toContain("• Modalidad: Teleconsulta");
    expect(msg).toContain("• Para: Mí");
  });
});

describe("appointmentWhatsAppNumber", () => {
  it("sends the request to the chosen branch", () => {
    expect(appointmentWhatsAppNumber(base)).toBe(getLocation("callao").whatsapp.number);
  });

  it("falls back to the main line when the branch is unknown or it is a teleconsultation", () => {
    expect(appointmentWhatsAppNumber({ ...base, location: "cualquiera" })).toBe(primaryWhatsAppLine().number);
    expect(appointmentWhatsAppNumber({ ...base, modality: "teleconsulta" })).toBe(primaryWhatsAppLine().number);
  });
});

describe("validateAppointment", () => {
  it("accepts a valid appointment", () => {
    expect(validateAppointment(base, true, new Date("2026-10-03T12:00:00-05:00"))).toEqual({});
  });

  it("flags missing name, short phone, empty reason and no consent", () => {
    const errors = validateAppointment({ ...base, fullName: " ", phone: "123", reason: "" }, false);
    expect(Object.keys(errors).sort()).toEqual(["consent", "fullName", "phone", "reason"]);
  });

  it("requires a branch for in-person visits only", () => {
    const now = new Date("2026-10-03T12:00:00-05:00");
    expect(validateAppointment({ ...base, location: undefined }, true, now).location).toBeDefined();
    expect(validateAppointment({ ...base, location: undefined, modality: "teleconsulta" }, true, now)).toEqual({});
  });

  it("rejects a past preferred date", () => {
    const errors = validateAppointment({ ...base, preferredDate: "2020-01-01" }, true, new Date("2026-10-03T12:00:00-05:00"));
    expect(errors.preferredDate).toBeDefined();
  });
});

describe("withLocation y locationWhatsApp", () => {
  it("adds the branch to a prefilled message", () => {
    expect(withLocation("Hola SERMEKARE, quisiera agendar una densitometría ósea.", getLocation("los-olivos"))).toBe(
      "Hola SERMEKARE, quisiera agendar una densitometría ósea en la sede de Los Olivos.",
    );
  });

  it("opens the WhatsApp of that branch", () => {
    const location = getLocation("puente-piedra");
    expect(locationWhatsApp(location, "Hola")).toBe(`https://wa.me/${location.whatsapp.number}?text=Hola`);
  });
});

describe("messageAbout", () => {
  it("adapts the base message to a topic and optional doctor", () => {
    expect(messageAbout("Gota")).toBe("Hola SERMEKARE, quisiera agendar una consulta por gota.");
    expect(messageAbout("Rodillas", "Dra. Ana")).toBe(
      "Hola SERMEKARE, quisiera agendar una consulta con Dra. Ana por rodillas.",
    );
  });
});

describe("messageForDoctor", () => {
  it("asks for an appointment with a specific doctor", () => {
    expect(messageForDoctor("Dr. Luis Prado")).toBe(
      "Hola SERMEKARE, quisiera agendar una consulta con Dr. Luis Prado.",
    );
  });
});

describe("buildMailtoLink", () => {
  it("builds an encoded mailto link", () => {
    expect(buildMailtoLink("a@b.com", "Cita", "Hola mundo")).toBe(
      "mailto:a@b.com?subject=Cita&body=Hola%20mundo",
    );
  });
});
