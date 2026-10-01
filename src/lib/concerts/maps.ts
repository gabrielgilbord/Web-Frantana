import type { Concert } from "@/types";

/** Query string for OpenStreetMap / Google Maps (no API key). */
export function concertMapQuery(concert: Concert) {
  return [concert.venue, concert.city, "España"].filter(Boolean).join(", ");
}

function hasCoords(concert: Concert) {
  return (
    typeof concert.lat === "number" &&
    typeof concert.lng === "number" &&
    Number.isFinite(concert.lat) &&
    Number.isFinite(concert.lng)
  );
}

/** Reliable iframe embed without Google API key. Prefers lat/lng pin when set. */
export function googleMapsEmbedUrl(concert: Concert) {
  if (hasCoords(concert)) {
    const { lat, lng } = concert;
    return `https://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=16&output=embed&hl=es`;
  }
  const q = encodeURIComponent(concertMapQuery(concert));
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed&hl=es`;
}

export function googleMapsExternalUrl(concert: Concert) {
  if (hasCoords(concert)) {
    return `https://www.google.com/maps/search/?api=1&query=${concert.lat},${concert.lng}`;
  }
  const q = encodeURIComponent(concertMapQuery(concert));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function appleMapsExternalUrl(concert: Concert) {
  if (hasCoords(concert)) {
    return `https://maps.apple.com/?ll=${concert.lat},${concert.lng}&q=${encodeURIComponent(concert.venue)}`;
  }
  const q = encodeURIComponent(concertMapQuery(concert));
  return `https://maps.apple.com/?q=${q}`;
}
