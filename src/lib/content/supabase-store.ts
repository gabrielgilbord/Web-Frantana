import { createClient as createBrowserStyleServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  createAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import { normalizeConcert, occupancyFromConcerts } from "@/lib/content/occupancy";
import { localTodayISO } from "@/lib/concerts/date";
import type {
  BookingRequest,
  Concert,
  GalleryImage,
  OccupancyDay,
  Order,
  Product,
  ProductVariant,
  SiteContent,
  TicketStatus,
} from "@/types";

export { isSupabaseAdminConfigured as useSupabaseStore };

/** Try public occupancy RPC with anon key (works after seed SQL). */
export async function dbGetOccupancyPublic(options?: {
  from?: string;
  to?: string;
}): Promise<OccupancyDay[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const sb = await createBrowserStyleServerClient();
    const { data, error } = await sb.rpc("get_occupancy", {
      from_d: options?.from ?? localTodayISO(),
      to_d: options?.to ?? null,
    });
    if (error || !Array.isArray(data)) return null;
    return data as OccupancyDay[];
  } catch {
    return null;
  }
}


type ConcertRow = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  city: string;
  venue: string;
  lat: number | null;
  lng: number | null;
  image: string | null;
  ticket_url: string | null;
  ticket_status: TicketStatus;
  published: boolean;
  blocks_calendar: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function rowToConcert(r: ConcertRow): Concert {
  return normalizeConcert({
    id: r.id,
    title: r.title,
    date: r.date,
    time: r.time ? String(r.time).slice(0, 5) : null,
    city: r.city,
    venue: r.venue,
    lat: r.lat,
    lng: r.lng,
    image: r.image,
    ticketUrl: r.ticket_url,
    ticketStatus: r.ticket_status,
    published: r.published,
    blocksCalendar: r.blocks_calendar,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });
}

function concertToRow(c: Concert) {
  return {
    id: c.id,
    title: c.title,
    date: c.date,
    time: c.time,
    city: c.city,
    venue: c.venue,
    lat: c.lat,
    lng: c.lng,
    image: c.image,
    ticket_url: c.ticketUrl,
    ticket_status: c.ticketStatus,
    published: c.published,
    blocks_calendar: c.blocksCalendar,
    notes: c.notes,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

export async function dbGetConcerts(options?: {
  includeUnpublished?: boolean;
}): Promise<Concert[] | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  let q = sb.from("concerts").select("*").order("date", { ascending: true });
  if (!options?.includeUnpublished) {
    q = q.eq("published", true);
  }
  const { data, error } = await q;
  if (error) {
    console.error("[supabase] getConcerts", error.message);
    return null;
  }
  return (data as ConcertRow[]).map(rowToConcert);
}

export async function dbUpsertConcert(concert: Concert): Promise<Concert | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("concerts")
    .upsert(concertToRow(concert), { onConflict: "id" })
    .select("*")
    .single();
  if (error) {
    console.error("[supabase] upsertConcert", error.message);
    return null;
  }
  return rowToConcert(data as ConcertRow);
}

export async function dbDeleteConcert(id: string): Promise<boolean> {
  const sb = createAdminClient();
  if (!sb) return false;
  const { error } = await sb.from("concerts").delete().eq("id", id);
  if (error) {
    console.error("[supabase] deleteConcert", error.message);
    return false;
  }
  return true;
}

export async function dbGetOccupancy(options?: {
  from?: string;
  to?: string;
}): Promise<OccupancyDay[] | null> {
  const fromPublic = await dbGetOccupancyPublic(options);
  if (fromPublic) return fromPublic;

  const sb = createAdminClient();
  if (!sb) return null;
  const all = await dbGetConcerts({ includeUnpublished: true });
  if (!all) return null;
  return occupancyFromConcerts(all, options);
}

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: Product["category"];
  images: string[];
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  product_variants?: Array<{
    id: string;
    name: string;
    sku: string;
    price_cents: number;
    currency: string;
    stock: number;
    attributes: Record<string, string>;
  }>;
};

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    category: r.category,
    images: r.images ?? [],
    published: r.published,
    featured: r.featured,
    variants: (r.product_variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      priceCents: v.price_cents,
      currency: v.currency,
      stock: v.stock,
      attributes: v.attributes ?? {},
    })),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function dbGetProducts(options?: {
  includeUnpublished?: boolean;
}): Promise<Product[] | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  let q = sb
    .from("products")
    .select("*, product_variants(*)")
    .order("created_at", { ascending: true });
  if (!options?.includeUnpublished) {
    q = q.eq("published", true);
  }
  const { data, error } = await q;
  if (error) {
    console.error("[supabase] getProducts", error.message);
    return null;
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function dbUpsertProduct(product: Product): Promise<Product | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  const { error: pErr } = await sb.from("products").upsert(
    {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      images: product.images,
      published: product.published,
      featured: product.featured,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
    },
    { onConflict: "id" }
  );
  if (pErr) {
    console.error("[supabase] upsertProduct", pErr.message);
    return null;
  }
  // Replace variants
  await sb.from("product_variants").delete().eq("product_id", product.id);
  if (product.variants.length) {
    const { error: vErr } = await sb.from("product_variants").insert(
      product.variants.map((v: ProductVariant) => ({
        id: v.id,
        product_id: product.id,
        name: v.name,
        sku: v.sku,
        price_cents: v.priceCents,
        currency: v.currency,
        stock: v.stock,
        attributes: v.attributes,
      }))
    );
    if (vErr) {
      console.error("[supabase] upsertVariants", vErr.message);
      return null;
    }
  }
  return product;
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  const sb = createAdminClient();
  if (!sb) return false;
  const { error } = await sb.from("products").delete().eq("id", id);
  return !error;
}

type BookingRow = {
  id: string;
  access_token: string;
  name: string;
  email: string;
  phone: string | null;
  event_type: BookingRequest["eventType"];
  preferred_date: string | null;
  preferred_time: string | null;
  city: string;
  venue: string | null;
  message: string;
  messages: BookingRequest["messages"];
  status: BookingRequest["status"];
  created_at: string;
  updated_at: string;
};

function rowToBooking(r: BookingRow): BookingRequest {
  return {
    id: r.id,
    accessToken: r.access_token,
    name: r.name,
    email: r.email,
    phone: r.phone,
    eventType: r.event_type,
    preferredDate: r.preferred_date,
    preferredTime: r.preferred_time,
    city: r.city,
    venue: r.venue,
    message: r.message,
    messages: Array.isArray(r.messages) ? r.messages : [],
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function dbGetBookings(): Promise<BookingRequest[] | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase] getBookings", error.message);
    return null;
  }
  return (data as BookingRow[]).map(rowToBooking);
}

export async function dbGetBookingByToken(
  token: string
): Promise<BookingRequest | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();
  if (error || !data) return null;
  return rowToBooking(data as BookingRow);
}

export async function dbUpsertBooking(
  booking: BookingRequest
): Promise<BookingRequest | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("bookings")
    .upsert(
      {
        id: booking.id,
        access_token: booking.accessToken,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        event_type: booking.eventType,
        preferred_date: booking.preferredDate,
        preferred_time: booking.preferredTime,
        city: booking.city,
        venue: booking.venue,
        message: booking.message,
        messages: booking.messages,
        status: booking.status,
        created_at: booking.createdAt,
        updated_at: booking.updatedAt,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();
  if (error) {
    console.error("[supabase] upsertBooking", error.message);
    return null;
  }
  return rowToBooking(data as BookingRow);
}

export async function dbGetContent(): Promise<SiteContent | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("site_content")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (error || !data) return null;
  const r = data as Record<string, unknown>;
  const social = (r.social as SiteContent["social"]) ?? {
    instagram: null,
    facebook: null,
    spotify: null,
    youtube: null,
    tiktok: null,
    appleMusic: null,
  };
  return {
    heroSubtitle: String(r.hero_subtitle ?? ""),
    homeIntroTitle: String(r.home_intro_title ?? ""),
    homeIntroBody: String(r.home_intro_body ?? ""),
    aboutTitle: String(r.about_title ?? ""),
    aboutBody: String(r.about_body ?? ""),
    aboutStoryTitle: String(r.about_story_title ?? ""),
    aboutStoryBody: String(r.about_story_body ?? ""),
    musicIntro: String(r.music_intro ?? ""),
    spotifyEmbedUrl: (r.spotify_embed_url as string) ?? null,
    spotifyArtistUrl: (r.spotify_artist_url as string) ?? null,
    contactEmail: (r.contact_email as string) ?? null,
    contactPhone: (r.contact_phone as string) ?? null,
    social,
    seoDescription: String(r.seo_description ?? ""),
    updatedAt: String(r.updated_at ?? new Date().toISOString()),
  };
}

export async function dbGetGallery(options?: {
  includeUnpublished?: boolean;
}): Promise<GalleryImage[] | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  let q = sb.from("gallery_images").select("*").order("sort_order");
  if (!options?.includeUnpublished) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) return null;
  return (data as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id),
    src: String(r.src),
    alt: String(r.alt),
    width: Number(r.width),
    height: Number(r.height),
    published: Boolean(r.published),
    sortOrder: Number(r.sort_order),
    credit: (r.credit as string) ?? null,
  }));
}

export async function dbGetOrders(): Promise<Order[] | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return null;
  return (data as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id),
    status: r.status as Order["status"],
    email: String(r.email),
    items: (r.items as Order["items"]) ?? [],
    totalCents: Number(r.total_cents ?? 0),
    currency: String(r.currency ?? "EUR"),
    stripeCheckoutSessionId: (r.stripe_checkout_session_id as string) ?? null,
    stripePaymentIntentId: (r.stripe_payment_intent_id as string) ?? null,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }));
}

export async function dbUpsertOrder(order: Order): Promise<Order | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  const { error } = await sb.from("orders").upsert(
    {
      id: order.id,
      status: order.status,
      email: order.email,
      items: order.items,
      total_cents: order.totalCents,
      currency: order.currency,
      stripe_checkout_session_id: order.stripeCheckoutSessionId,
      stripe_payment_intent_id: order.stripePaymentIntentId,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    },
    { onConflict: "id" }
  );
  if (error) {
    console.error("[supabase] upsertOrder", error.message);
    return null;
  }
  return order;
}
