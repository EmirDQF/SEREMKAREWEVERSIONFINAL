import { describe, expect, it } from "vitest";
import { site } from "@/data/site";
import {
  allWhatsAppLines,
  findLocation,
  formatLocationAddress,
  getLocation,
  locationNamesLabel,
  locationOpenStatus,
  primaryLocation,
  primaryWhatsAppLine,
} from "@/lib/locations";
import { buildMapsEmbedUrl, buildMapsSearchUrl } from "@/lib/maps";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { ClinicLocation } from "@/types/medical";

const OFFICIAL_NUMBERS = ["51994931540", "51945553676", "51922281624"];
const limaTime = (iso: string) => new Date(`${iso}-05:00`);

describe("sedes", () => {
  it("son exactamente Los Olivos, Callao y Puente Piedra", () => {
    expect(site.locations.map((l) => l.id)).toEqual(["los-olivos", "callao", "puente-piedra"]);
  });

  it("getLocation devuelve la sede por id", () => {
    expect(getLocation("callao").district).toBe("Callao");
    expect(getLocation("puente-piedra").reference).toContain("Carlos Lanfranco La Hoz");
  });

  it("findLocation devuelve undefined para un slug desconocido", () => {
    expect(findLocation("lima-centro")).toBeUndefined();
    expect(findLocation("los-olivos")?.name).toBe("Los Olivos");
  });

  it("locationNamesLabel enumera las sedes en español", () => {
    expect(locationNamesLabel()).toBe("Los Olivos, Callao y Puente Piedra");
  });

  it("la sede principal es la configurada en primaryLocationId", () => {
    expect(primaryLocation().id).toBe(site.primaryLocationId);
  });

  it("cada sede escribe a uno de los 3 WhatsApp oficiales", () => {
    for (const location of site.locations) expect(OFFICIAL_NUMBERS).toContain(location.whatsapp.number);
  });

  it("el Callao destaca la referencia del Hospital Daniel Alcides Carrión", () => {
    expect(getLocation("callao").reference).toContain("Daniel Alcides Carrión");
  });

  it("formatLocationAddress une calle, distrito y ciudad sin repetir", () => {
    expect(formatLocationAddress(getLocation("los-olivos"))).toBe(
      "Av. Alfredo Mendiola 5875, Urb. Villasol, Los Olivos, Lima",
    );
    expect(formatLocationAddress(getLocation("callao"))).not.toMatch(/Callao, Callao/);
  });
});

describe("líneas de WhatsApp", () => {
  it("son las 3 de la tarjeta, con la principal primero", () => {
    expect(allWhatsAppLines().map((line) => line.number)).toEqual(OFFICIAL_NUMBERS);
    expect(primaryWhatsAppLine().number).toBe("51994931540");
    expect(primaryWhatsAppLine().display).toBe("+51 994 931 540");
  });

  it("generan enlaces wa.me válidos", () => {
    for (const line of allWhatsAppLines()) {
      expect(buildWhatsAppLink(line.number, "Hola")).toBe(`https://wa.me/${line.number}?text=Hola`);
    }
  });
});

describe("Google Maps", () => {
  it("buildMapsSearchUrl codifica la dirección y la referencia", () => {
    const url = buildMapsSearchUrl("Av. Guardia Chalaca, Callao", "frente al Hospital Carrión");
    expect(url).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Av. Guardia Chalaca, Callao, frente al Hospital Carrión")}`,
    );
  });

  it("omite la referencia si no hay", () => {
    expect(buildMapsSearchUrl("Av. X 1, Lima")).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Av. X 1, Lima")}`,
    );
  });

  it("buildMapsEmbedUrl usa el modo embed", () => {
    expect(buildMapsEmbedUrl("Av. X 1, Lima")).toBe(
      `https://www.google.com/maps?q=${encodeURIComponent("Av. X 1, Lima")}&output=embed`,
    );
  });

  it("cada sede enlaza a una búsqueda que incluye su hospital de referencia", () => {
    for (const location of site.locations) {
      const query = decodeURIComponent(location.mapsUrl.split("query=")[1]);
      expect(query).toContain(location.district);
      if (location.reference) expect(query).toContain(location.reference);
    }
  });
});

describe("horario por sede", () => {
  const confirmed: ClinicLocation = {
    ...getLocation("callao"),
    hours: {
      days: [1, 2, 3, 4, 5, 6],
      opensAt: 8 * 60,
      closesAt: 18 * 60,
      timeZone: "America/Lima",
      label: "Lun a sáb · 8:00 a.m. – 6:00 p.m.",
      closedLabel: "Domingo cerrado",
      confirmed: true,
    },
  };

  it("calcula abierto/cerrado con el horario de esa sede", () => {
    expect(locationOpenStatus(confirmed, limaTime("2026-10-05T10:00:00"))?.isOpen).toBe(true);
    expect(locationOpenStatus(confirmed, limaTime("2026-10-05T18:30:00"))?.isOpen).toBe(false);
  });

  it("no muestra estado si el horario no está confirmado (evita un dato falso)", () => {
    const provisional = { ...confirmed, hours: { ...confirmed.hours, confirmed: false } };
    expect(locationOpenStatus(provisional, limaTime("2026-10-05T10:00:00"))).toBeNull();
  });
});
