import { describe, expect, it } from "vitest";
import {
  breadcrumbSchema,
  clinicSchema,
  diagnosticProcedureSchema,
  locationClinicSchema,
  medicalServiceSchema,
  procedureSchema,
} from "@/lib/schema";
import { getLocation, primaryLocation } from "@/lib/locations";
import { site } from "@/data/site";

describe("clinicSchema", () => {
  it("uses the main WhatsApp line and the main branch address", () => {
    const schema = clinicSchema() as { telephone: string; legalName: string; address: { addressLocality: string } };
    expect(schema.telephone).toBe("+51994931540");
    expect(schema.legalName).toBe("KARE SAC");
    expect(schema.address.addressLocality).toBe(primaryLocation().district);
  });

  it("does not publish opening hours until they are confirmed", () => {
    expect(primaryLocation().hours.confirmed).toBe(false);
    expect(clinicSchema()).not.toHaveProperty("openingHoursSpecification");
  });
});

describe("locationClinicSchema", () => {
  const schema = locationClinicSchema(getLocation("callao")) as Record<string, unknown> & {
    address: { addressLocality: string };
    areaServed: { name: string }[];
    availableService: { "@type": string; name: string };
  };

  it("has its own @id and belongs to the organization", () => {
    expect(schema["@id"]).toBe(`${site.url}/sedes/callao#clinic`);
    expect(schema.parentOrganization).toEqual({ "@id": `${site.url}/#clinic` });
  });

  it("uses the branch WhatsApp, map and hospital reference", () => {
    const location = getLocation("callao");
    expect(schema.telephone).toBe(`+${location.whatsapp.number}`);
    expect(schema.hasMap).toBe(location.mapsUrl);
    expect(schema.description).toContain("Daniel Alcides Carrión");
    expect(schema.address.addressLocality).toBe("Callao");
  });

  it("serves nearby districts and offers bone densitometry", () => {
    expect(schema.areaServed.map((area) => area.name)).toEqual(getLocation("callao").nearbyDistricts);
    expect(schema.availableService).toEqual({ "@type": "DiagnosticProcedure", name: "Densitometría ósea (DXA)" });
  });

  it("never invents coordinates, ratings or unconfirmed hours", () => {
    expect(schema).not.toHaveProperty("geo");
    expect(schema).not.toHaveProperty("aggregateRating");
    expect(schema).not.toHaveProperty("openingHoursSpecification");
  });
});

describe("breadcrumbSchema", () => {
  it("lists absolute URLs in order", () => {
    const schema = breadcrumbSchema([
      { label: "Inicio", href: "/" },
      { label: "Densitometría ósea", href: "/densitometria-osea" },
    ]) as { itemListElement: { position: number; item: string }[] };
    expect(schema.itemListElement.map((i) => [i.position, i.item])).toEqual([
      [1, `${site.url}/`],
      [2, `${site.url}/densitometria-osea`],
    ]);
  });
});

describe("diagnosticProcedureSchema", () => {
  it("is a non-invasive diagnostic procedure linked to the clinic", () => {
    const schema = diagnosticProcedureSchema({
      name: "Densitometría ósea",
      alternateName: ["DXA"],
      description: "d",
      path: "/densitometria-osea",
      bodyLocation: "Columna lumbar y cadera",
      howPerformed: "h",
      preparation: "p",
      followup: "f",
    });
    expect(schema["@type"]).toBe("DiagnosticProcedure");
    expect(schema.procedureType).toBe("https://schema.org/NoninvasiveProcedure");
    expect(schema.availableAt).toEqual({ "@id": `${site.url}/#clinic` });
  });
});

describe("procedureSchema and medicalServiceSchema", () => {
  it("marks therapeutic procedures with their own type", () => {
    const schema = procedureSchema("TherapeuticProcedure", {
      name: "Infiltración",
      alternateName: [],
      description: "d",
      path: "/tratamientos/infiltraciones-ecoguiadas",
      bodyLocation: "Articulaciones",
      howPerformed: "h",
      preparation: "p",
      followup: "f",
    });
    expect(schema["@type"]).toBe("TherapeuticProcedure");
  });

  it("lists every sub-service as an offer of the clinic", () => {
    const schema = medicalServiceSchema({ name: "Telemedicina", description: "d", path: "/servicios/telemedicina", offers: ["A", "B"] });
    const catalog = schema.hasOfferCatalog as { itemListElement: { itemOffered: { name: string } }[] };
    expect(catalog.itemListElement.map((item) => item.itemOffered.name)).toEqual(["A", "B"]);
    expect(schema.provider).toEqual({ "@id": `${site.url}/#clinic` });
  });
});
