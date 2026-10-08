import { describe, expect, it } from "vitest";
import { getLocation, primaryWhatsAppLine } from "@/lib/locations";
import {
  buildMailtoLink,
  buildWhatsAppLink,
  clinicWhatsApp,
  locationWhatsApp,
  messageAbout,
  messageForDoctor,
  withLocation,
} from "@/lib/whatsapp";

describe("buildWhatsAppLink", () => {
  it("encodes the message and strips non-digits from the number", () => {
    const link = buildWhatsAppLink("+51 994 931 540", "Hola & gracias");
    expect(link).toBe("https://wa.me/51994931540?text=Hola%20%26%20gracias");
  });
});

describe("clinicWhatsApp", () => {
  it("uses the primary official line", () => {
    expect(clinicWhatsApp("Hola")).toBe(`https://wa.me/${primaryWhatsAppLine().number}?text=Hola`);
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
    expect(messageAbout("Gota")).toBe("Hola SERMEKARE, quiero agendar una teleconsulta por gota.");
    expect(messageAbout("Rodillas", "Dra. Ana")).toBe(
      "Hola SERMEKARE, quiero agendar una teleconsulta con Dra. Ana por rodillas.",
    );
  });
});

describe("messageForDoctor", () => {
  it("asks for an appointment with a specific doctor", () => {
    expect(messageForDoctor("Dr. Luis Prado")).toBe(
      "Hola SERMEKARE, quiero agendar una teleconsulta con Dr. Luis Prado.",
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
