/**
 * Extrae coordenadas WGS84 desde URLs de Google Maps (completas).
 * Soporta place/@, q=, query=, !3d!4d, ll=, etc.
 */
export function parseGoogleMapsUrl(input: string): {
  lat: number;
  lng: number;
} | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const isMaps =
    host.includes("google.") ||
    host === "maps.app.goo.gl" ||
    host === "goo.gl" ||
    host === "g.page";
  if (!isMaps && !raw.includes("@") && !/[-+]?\d+\.\d+\s*,\s*[-+]?\d+\.\d+/.test(raw)) {
    // Permitir pegar solo "28.12,-15.43"
    const bare = raw.match(
      /^\s*([-+]?\d{1,2}\.\d+)\s*,\s*([-+]?\d{1,3}\.\d+)\s*$/
    );
    if (bare) {
      const lat = Number(bare[1]);
      const lng = Number(bare[2]);
      if (valid(lat, lng)) return { lat, lng };
    }
    return null;
  }

  const full = decodeURIComponent(url.href);

  // .../@28.1234567,-15.4321098,17z
  const at = full.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) {
    const lat = Number(at[1]);
    const lng = Number(at[2]);
    if (valid(lat, lng)) return { lat, lng };
  }

  // q=28.12,-15.43  |  query=28.12,-15.43
  for (const key of ["q", "query", "ll", "center"]) {
    const v = url.searchParams.get(key);
    if (!v) continue;
    const m = v.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (valid(lat, lng)) return { lat, lng };
    }
  }

  // !3dLAT!4dLNG (place) o !2dLNG!3dLAT (algunos embeds)
  const d3d4 = full.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (d3d4) {
    const lat = Number(d3d4[1]);
    const lng = Number(d3d4[2]);
    if (valid(lat, lng)) return { lat, lng };
  }
  const d2d3 = full.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (d2d3) {
    const lng = Number(d2d3[1]);
    const lat = Number(d2d3[2]);
    if (valid(lat, lng)) return { lat, lng };
  }

  // /dir//lat,lng
  const dir = full.match(/\/dir\/[^/]*\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (dir) {
    const lat = Number(dir[1]);
    const lng = Number(dir[2]);
    if (valid(lat, lng)) return { lat, lng };
  }

  return null;
}

function valid(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

export function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
