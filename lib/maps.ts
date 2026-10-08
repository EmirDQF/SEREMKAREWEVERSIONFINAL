const MAPS_SEARCH_URL = "https://www.google.com/maps/search/?api=1&query=";
const MAPS_EMBED_URL = "https://www.google.com/maps?q=";

interface AddressParts {
  street: string;
  district: string;
  city: string;
}

/** "Av. X 1, Los Olivos, Lima"; no repite el distrito cuando coincide con la ciudad (Callao). */
export function formatAddress({ street, district, city }: AddressParts): string {
  const parts = district === city ? [street, district] : [street, district, city];
  return parts.join(", ");
}

function mapsQuery(address: string, reference?: string): string {
  return reference ? `${address}, ${reference}` : address;
}

/** Búsqueda en Google Maps (pestaña nueva). La referencia del hospital ayuda a ubicar la sede. */
export function buildMapsSearchUrl(address: string, reference?: string): string {
  return `${MAPS_SEARCH_URL}${encodeURIComponent(mapsQuery(address, reference))}`;
}

/** URL del iframe de Google Maps (solo se carga tras el clic del usuario). */
export function buildMapsEmbedUrl(address: string, reference?: string): string {
  return `${MAPS_EMBED_URL}${encodeURIComponent(mapsQuery(address, reference))}&output=embed`;
}
