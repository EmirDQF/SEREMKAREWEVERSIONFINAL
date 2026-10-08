import { describe, expect, it } from "vitest";
import { buildMailtoLink, buildWhatsAppLink, messageAbout, messageForDoctor } from "@/lib/whatsapp";

describe("buildWhatsAppLink", () => {
  it("encodes the message and strips non-digits from the number", () => {
    const link = buildWhatsAppLink("+51 999 000 000", "Hola & gracias");
    expect(link).toBe("https://wa.me/51999000000?text=Hola%20%26%20gracias");
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
