import type { BookingRequest } from "@/types";

const GIST_FILE = "bookings.json";

type GistPayload = { bookings: BookingRequest[] };

function gistId() {
  return process.env.BOOKINGS_GIST_ID?.trim() || "";
}

function gistToken() {
  return (
    process.env.GITHUB_BOOKINGS_TOKEN?.trim() ||
    process.env.GH_TOKEN?.trim() ||
    process.env.GITHUB_TOKEN?.trim() ||
    ""
  );
}

export function isGistBookingsConfigured() {
  return Boolean(gistId() && gistToken());
}

async function githubFetch(path: string, init?: RequestInit) {
  const token = gistToken();
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  return res;
}

function parsePayload(raw: string): GistPayload {
  try {
    const parsed = JSON.parse(raw) as GistPayload;
    if (!parsed || !Array.isArray(parsed.bookings)) {
      return { bookings: [] };
    }
    return { bookings: parsed.bookings };
  } catch {
    return { bookings: [] };
  }
}

async function readGist(): Promise<{
  payload: GistPayload;
  filename: string;
} | null> {
  const id = gistId();
  if (!id || !gistToken()) return null;

  const res = await githubFetch(`/gists/${id}`);
  if (!res.ok) {
    console.error("[bookings-gist] read failed", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    files?: Record<
      string,
      {
        content?: string;
        filename?: string;
        truncated?: boolean;
        raw_url?: string;
      }
    >;
  };
  const files = data.files ?? {};
  const preferred =
    files[GIST_FILE] ||
    files["tmp-bookings-seed.json"] ||
    Object.values(files)[0];
  if (!preferred) return { payload: { bookings: [] }, filename: GIST_FILE };

  let content = preferred.content ?? "";
  if (preferred.truncated && preferred.raw_url) {
    const rawRes = await fetch(preferred.raw_url, {
      headers: { Authorization: `Bearer ${gistToken()}` },
      cache: "no-store",
    });
    content = await rawRes.text();
  }

  const filename = preferred.filename || GIST_FILE;
  return { payload: parsePayload(content), filename };
}

async function writeGist(
  previousFilename: string,
  payload: GistPayload
): Promise<boolean> {
  const id = gistId();
  if (!id || !gistToken()) return false;

  const files: Record<string, { content?: string }> = {
    [GIST_FILE]: {
      content: `${JSON.stringify(payload, null, 2)}\n`,
    },
  };
  // Rename away from the seed filename if needed
  if (previousFilename && previousFilename !== GIST_FILE) {
    files[previousFilename] = { content: "" };
  }

  const res = await githubFetch(`/gists/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ files }),
  });
  if (!res.ok) {
    console.error("[bookings-gist] write failed", res.status, await res.text());
    return false;
  }
  return true;
}

export async function gistGetBookings(): Promise<BookingRequest[] | null> {
  if (!isGistBookingsConfigured()) return null;
  const current = await readGist();
  if (!current) return null;
  return [...current.payload.bookings].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function gistGetBookingByToken(
  token: string
): Promise<BookingRequest | null> {
  const all = await gistGetBookings();
  if (!all) return null;
  return all.find((b) => b.accessToken === token) ?? null;
}

export async function gistUpsertBooking(
  booking: BookingRequest
): Promise<BookingRequest | null> {
  if (!isGistBookingsConfigured()) return null;
  const current = await readGist();
  if (!current) return null;

  const list = [...current.payload.bookings];
  const idx = list.findIndex((b) => b.id === booking.id);
  if (idx >= 0) list[idx] = booking;
  else list.unshift(booking);

  const ok = await writeGist(current.filename, { bookings: list });
  if (!ok) return null;
  return booking;
}
