import { promises as fs } from "fs";
import path from "path";
import type {
  BookingRequest,
  Concert,
  ContactInquiry,
  GalleryImage,
  OccupancyDay,
  Order,
  Product,
  SiteContent,
  SiteData,
} from "@/types";
import { localTodayISO } from "@/lib/concerts/date";
import {
  normalizeConcert,
  occupancyFromConcerts,
} from "@/lib/content/occupancy";
import {
  dbDeleteConcert,
  dbDeleteProduct,
  dbGetBookingByToken,
  dbGetBookings,
  dbGetConcerts,
  dbGetContent,
  dbGetGallery,
  dbGetOccupancy,
  dbGetOccupancyPublic,
  dbGetOrders,
  dbGetProducts,
  dbUpsertBooking,
  dbUpsertConcert,
  dbUpsertOrder,
  dbUpsertProduct,
  useSupabaseStore,
} from "@/lib/content/supabase-store";

const DATA_PATH = path.join(process.cwd(), "src/data/site.json");

async function readRaw(): Promise<SiteData> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw) as SiteData;
}

async function writeRaw(data: SiteData) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function getContentBackend(): "supabase" | "json" {
  return useSupabaseStore() ? "supabase" : "json";
}

export async function getSiteData(): Promise<SiteData> {
  return readRaw();
}

export async function getContent(): Promise<SiteContent> {
  if (useSupabaseStore()) {
    const fromDb = await dbGetContent();
    if (fromDb) return fromDb;
  }
  const data = await readRaw();
  return data.content;
}

export async function updateContent(
  patch: Partial<SiteContent>
): Promise<SiteContent> {
  const data = await readRaw();
  data.content = {
    ...data.content,
    ...patch,
    social: {
      ...data.content.social,
      ...(patch.social ?? {}),
    },
    updatedAt: new Date().toISOString(),
  };
  await writeRaw(data);
  return data.content;
}

export async function getConcerts(options?: {
  includeUnpublished?: boolean;
}): Promise<Concert[]> {
  if (useSupabaseStore()) {
    const fromDb = await dbGetConcerts(options);
    if (fromDb) return fromDb.map(normalizeConcert);
  }
  const data = await readRaw();
  const list = options?.includeUnpublished
    ? data.concerts
    : data.concerts.filter((c) => c.published);
  return [...list].map(normalizeConcert).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getConcertById(
  id: string,
  options?: { includeUnpublished?: boolean }
): Promise<Concert | null> {
  const list = await getConcerts(options);
  return list.find((c) => c.id === id) ?? null;
}

export async function getOccupancy(options?: {
  from?: string;
  to?: string;
}): Promise<OccupancyDay[]> {
  // Prefer DB RPC (anon) when seed SQL has been applied — includes private
  // holds without leaking titles. Null = RPC missing / failed → JSON fallback.
  const fromRpc = await dbGetOccupancyPublic(options);
  if (fromRpc) return fromRpc;

  if (useSupabaseStore()) {
    const fromDb = await dbGetOccupancy(options);
    if (fromDb) return fromDb;
  }
  const concerts = await getConcerts({ includeUnpublished: true });
  return occupancyFromConcerts(concerts, options);
}

export async function upsertConcert(
  concert: Omit<Concert, "createdAt" | "updatedAt" | "blocksCalendar"> & {
    createdAt?: string;
    updatedAt?: string;
    blocksCalendar?: boolean;
  }
): Promise<Concert> {
  const now = new Date().toISOString();
  const next: Concert = normalizeConcert({
    ...concert,
    blocksCalendar: concert.blocksCalendar ?? true,
    image: concert.image ?? null,
    createdAt: concert.createdAt ?? now,
    updatedAt: now,
  } as Concert);

  if (useSupabaseStore()) {
    const existing = await getConcertById(next.id, { includeUnpublished: true });
    next.createdAt = existing?.createdAt ?? now;
    const saved = await dbUpsertConcert(next);
    if (saved) return saved;
  }

  const data = await readRaw();
  const existingIndex = data.concerts.findIndex((c) => c.id === next.id);
  next.createdAt =
    existingIndex >= 0 ? data.concerts[existingIndex].createdAt : now;
  if (existingIndex >= 0) {
    data.concerts[existingIndex] = next;
  } else {
    data.concerts.push(next);
  }
  await writeRaw(data);
  return next;
}

export async function deleteConcert(id: string) {
  if (useSupabaseStore()) {
    const ok = await dbDeleteConcert(id);
    if (ok) return;
  }
  const data = await readRaw();
  data.concerts = data.concerts.filter((c) => c.id !== id);
  await writeRaw(data);
}

export async function getGallery(options?: {
  includeUnpublished?: boolean;
}): Promise<GalleryImage[]> {
  if (useSupabaseStore()) {
    const fromDb = await dbGetGallery(options);
    // Si la tabla está vacía, cae al seed JSON (fotos oficiales en el repo)
    if (fromDb && fromDb.length > 0) return fromDb;
  }
  const data = await readRaw();
  const list = options?.includeUnpublished
    ? data.gallery
    : data.gallery.filter((g) => g.published);
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function upsertGalleryImage(image: GalleryImage) {
  const data = await readRaw();
  const idx = data.gallery.findIndex((g) => g.id === image.id);
  if (idx >= 0) data.gallery[idx] = image;
  else data.gallery.push(image);
  await writeRaw(data);
  return image;
}

export async function deleteGalleryImage(id: string) {
  const data = await readRaw();
  data.gallery = data.gallery.filter((g) => g.id !== id);
  await writeRaw(data);
}

export async function getProducts(options?: {
  includeUnpublished?: boolean;
}): Promise<Product[]> {
  if (useSupabaseStore()) {
    const fromDb = await dbGetProducts(options);
    if (fromDb) return fromDb;
  }
  const data = await readRaw();
  return options?.includeUnpublished
    ? data.products
    : data.products.filter((p) => p.published);
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts({ includeUnpublished: true });
  return products.find((p) => p.id === id) ?? null;
}

export async function upsertProduct(product: Product) {
  const next = { ...product, updatedAt: new Date().toISOString() };
  if (useSupabaseStore()) {
    const saved = await dbUpsertProduct(next);
    if (saved) return saved;
  }
  const data = await readRaw();
  const idx = data.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) data.products[idx] = next;
  else data.products.push(next);
  await writeRaw(data);
  return next;
}

export async function deleteProduct(id: string) {
  if (useSupabaseStore()) {
    const ok = await dbDeleteProduct(id);
    if (ok) return;
  }
  const data = await readRaw();
  data.products = data.products.filter((p) => p.id !== id);
  await writeRaw(data);
}

export async function getOrders(): Promise<Order[]> {
  if (useSupabaseStore()) {
    const fromDb = await dbGetOrders();
    if (fromDb) return fromDb;
  }
  const data = await readRaw();
  return [...(data.orders ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function getOrderByCheckoutSession(
  sessionId: string
): Promise<Order | null> {
  const orders = await getOrders();
  return (
    orders.find((o) => o.stripeCheckoutSessionId === sessionId) ?? null
  );
}

export async function upsertOrder(order: Order): Promise<Order> {
  const next = { ...order, updatedAt: new Date().toISOString() };
  if (useSupabaseStore()) {
    const saved = await dbUpsertOrder(next);
    if (saved) return saved;
  }
  const data = await readRaw();
  if (!data.orders) data.orders = [];
  const idx = data.orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) data.orders[idx] = next;
  else data.orders.push(next);
  await writeRaw(data);
  return next;
}

/**
 * Decrement stock for paid lines. Best-effort on JSON store —
 * not strongly concurrent across multiple serverless instances.
 */
export async function decrementStock(
  items: Array<{ productId: string; variantId: string; quantity: number }>
): Promise<{ ok: boolean; error?: string }> {
  const data = await readRaw();
  for (const item of items) {
    const product = data.products.find((p) => p.id === item.productId);
    if (!product) return { ok: false, error: `Producto ${item.productId}` };
    const variant = product.variants.find((v) => v.id === item.variantId);
    if (!variant) return { ok: false, error: `Variante ${item.variantId}` };
    if (variant.stock < item.quantity) {
      return {
        ok: false,
        error: `Stock insuficiente: ${product.name} / ${variant.name}`,
      };
    }
  }
  for (const item of items) {
    const product = data.products.find((p) => p.id === item.productId)!;
    const variant = product.variants.find((v) => v.id === item.variantId)!;
    variant.stock -= item.quantity;
    product.updatedAt = new Date().toISOString();
  }
  await writeRaw(data);

  if (useSupabaseStore()) {
    for (const product of data.products) {
      await dbUpsertProduct(product);
    }
  }
  return { ok: true };
}

export function splitConcerts(concerts: Concert[]) {
  const today = localTodayISO();
  const upcoming = concerts
    .filter((c) => c.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = concerts
    .filter((c) => c.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}

export async function getBookings(): Promise<BookingRequest[]> {
  if (useSupabaseStore()) {
    const fromDb = await dbGetBookings();
    if (fromDb) return fromDb.map(normalizeBooking);
  }
  const data = await readRaw();
  return [...(data.bookings ?? [])]
    .map(normalizeBooking)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBookingByToken(
  token: string
): Promise<BookingRequest | null> {
  if (useSupabaseStore()) {
    const fromDb = await dbGetBookingByToken(token);
    if (fromDb) return normalizeBooking(fromDb);
  }
  const bookings = await getBookings();
  return bookings.find((b) => b.accessToken === token) ?? null;
}

function normalizeBooking(b: BookingRequest): BookingRequest {
  return {
    ...b,
    preferredTime: b.preferredTime ?? null,
    accessToken: b.accessToken || `legacy-${b.id}`,
    messages: Array.isArray(b.messages)
      ? b.messages
      : [
          {
            id: `msg-${b.id}-0`,
            from: "client" as const,
            body: b.message,
            createdAt: b.createdAt,
          },
        ],
  };
}

function makeToken() {
  return `tok-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function createBooking(
  input: Omit<
    BookingRequest,
    "id" | "accessToken" | "status" | "messages" | "createdAt" | "updatedAt"
  >
): Promise<BookingRequest> {
  const now = new Date().toISOString();
  const id = `book-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const booking: BookingRequest = {
    ...input,
    id,
    accessToken: makeToken(),
    status: "new",
    messages: [
      {
        id: `msg-${id}-0`,
        from: "client",
        body: input.message,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  if (useSupabaseStore()) {
    const saved = await dbUpsertBooking(booking);
    if (saved) return normalizeBooking(saved);
  }

  const data = await readRaw();
  if (!data.bookings) data.bookings = [];
  data.bookings.unshift(booking);
  await writeRaw(data);
  return booking;
}

export async function updateBookingStatus(
  id: string,
  status: BookingRequest["status"]
): Promise<BookingRequest | null> {
  const data = await readRaw();
  if (!data.bookings) data.bookings = [];
  const idx = data.bookings.findIndex((b) => b.id === id);
  let next: BookingRequest | null = null;

  if (idx >= 0) {
    const current = normalizeBooking(data.bookings[idx]);
    next = {
      ...current,
      status,
      updatedAt: new Date().toISOString(),
    };
    data.bookings[idx] = next;
    await writeRaw(data);
  } else if (useSupabaseStore()) {
    const all = await dbGetBookings();
    const found = all?.find((b) => b.id === id);
    if (!found) return null;
    next = {
      ...normalizeBooking(found),
      status,
      updatedAt: new Date().toISOString(),
    };
  }

  if (!next) return null;
  if (useSupabaseStore()) {
    const saved = await dbUpsertBooking(next);
    if (saved) return normalizeBooking(saved);
  }
  return next;
}

export async function addBookingMessage(options: {
  bookingId?: string;
  token?: string;
  from: "client" | "admin";
  body: string;
}): Promise<BookingRequest | null> {
  let current: BookingRequest | null = null;
  const data = await readRaw();
  if (!data.bookings) data.bookings = [];
  const idx = data.bookings.findIndex((b) =>
    options.bookingId
      ? b.id === options.bookingId
      : b.accessToken === options.token
  );

  if (idx >= 0) {
    current = normalizeBooking(data.bookings[idx]);
  } else if (useSupabaseStore()) {
    if (options.token) {
      current = await dbGetBookingByToken(options.token);
    } else if (options.bookingId) {
      const all = await dbGetBookings();
      current = all?.find((b) => b.id === options.bookingId) ?? null;
    }
    if (current) current = normalizeBooking(current);
  }

  if (!current) return null;
  const now = new Date().toISOString();
  const msg = {
    id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    from: options.from,
    body: options.body.trim(),
    createdAt: now,
  };
  if (!msg.body) return current;
  const next: BookingRequest = {
    ...current,
    messages: [...current.messages, msg],
    status:
      options.from === "admin"
        ? "replied"
        : current.status === "archived"
          ? current.status
          : "read",
    updatedAt: now,
  };

  if (idx >= 0) {
    data.bookings[idx] = next;
    await writeRaw(data);
  }
  if (useSupabaseStore()) {
    const saved = await dbUpsertBooking(next);
    if (saved) return normalizeBooking(saved);
  }
  return next;
}

export async function createContactInquiry(
  input: Omit<ContactInquiry, "id" | "createdAt">
): Promise<ContactInquiry> {
  const data = await readRaw();
  if (!data.contactInquiries) data.contactInquiries = [];
  const inquiry: ContactInquiry = {
    ...input,
    id: `contact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  data.contactInquiries.unshift(inquiry);
  await writeRaw(data);
  return inquiry;
}
