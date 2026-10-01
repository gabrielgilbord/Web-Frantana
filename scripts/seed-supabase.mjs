/**
 * Seed Supabase from src/data/site.json using the service role key.
 * Usage: node --env-file=.env.local scripts/seed-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const data = JSON.parse(readFileSync(join(root, "src/data/site.json"), "utf8"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SECRET_KEY?.trim();

if (!url || !key) {
  console.error(
    "Falta SUPABASE_SERVICE_ROLE_KEY (descoméntala en .env.local) o NEXT_PUBLIC_SUPABASE_URL."
  );
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function concertRow(c) {
  return {
    id: c.id,
    title: c.title,
    date: c.date,
    time: c.time,
    city: c.city,
    venue: c.venue,
    lat: c.lat ?? null,
    lng: c.lng ?? null,
    image: c.image ?? null,
    ticket_url: c.ticketUrl,
    ticket_status: c.ticketStatus,
    published: c.published,
    blocks_calendar: c.blocksCalendar ?? true,
    notes: c.notes,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

async function main() {
  const c = data.content;
  const { error: contentErr } = await sb.from("site_content").upsert({
    id: "main",
    hero_subtitle: c.heroSubtitle,
    home_intro_title: c.homeIntroTitle,
    home_intro_body: c.homeIntroBody,
    about_title: c.aboutTitle,
    about_body: c.aboutBody,
    about_story_title: c.aboutStoryTitle,
    about_story_body: c.aboutStoryBody,
    music_intro: c.musicIntro,
    spotify_embed_url: c.spotifyEmbedUrl,
    spotify_artist_url: c.spotifyArtistUrl,
    contact_email: c.contactEmail,
    contact_phone: c.contactPhone,
    social: c.social,
    seo_description: c.seoDescription,
    updated_at: c.updatedAt,
  });
  if (contentErr) throw contentErr;
  console.log("✓ site_content");

  const { error: concertErr } = await sb
    .from("concerts")
    .upsert(data.concerts.map(concertRow), { onConflict: "id" });
  if (concertErr) throw concertErr;
  console.log(`✓ concerts (${data.concerts.length})`);

  const galleryRows = data.gallery.map((g) => ({
    id: g.id,
    src: g.src,
    alt: g.alt,
    width: g.width,
    height: g.height,
    published: g.published,
    sort_order: g.sortOrder,
    credit: g.credit,
  }));
  const { error: galErr } = await sb
    .from("gallery_images")
    .upsert(galleryRows, { onConflict: "id" });
  if (galErr) throw galErr;
  console.log(`✓ gallery (${galleryRows.length})`);

  for (const p of data.products) {
    const { error: pErr } = await sb.from("products").upsert({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      images: p.images,
      published: p.published,
      featured: p.featured,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    });
    if (pErr) throw pErr;
    await sb.from("product_variants").delete().eq("product_id", p.id);
    const { error: vErr } = await sb.from("product_variants").insert(
      p.variants.map((v) => ({
        id: v.id,
        product_id: p.id,
        name: v.name,
        sku: v.sku,
        price_cents: v.priceCents,
        currency: v.currency,
        stock: v.stock,
        attributes: v.attributes,
      }))
    );
    if (vErr) throw vErr;
  }
  console.log(`✓ products (${data.products.length})`);

  const sampleBooking = {
    id: "book-demo-seed",
    access_token: "tok-demo-seed-frantana",
    name: "María Demo",
    email: "maria.demo@example.com",
    phone: "+34 600 000 000",
    event_type: "boda",
    preferred_date: "2026-11-22",
    preferred_time: "20:00",
    city: "Las Palmas de Gran Canaria",
    venue: "Salón Costa",
    message: "Boda íntima, formato acústico ~90 min.",
    messages: [
      {
        id: "msg-demo-0",
        from: "client",
        body: "Boda íntima, formato acústico ~90 min.",
        createdAt: "2026-10-01T16:00:00.000Z",
      },
    ],
    status: "new",
    created_at: "2026-10-01T16:00:00.000Z",
    updated_at: "2026-10-01T16:00:00.000Z",
  };
  const { error: bErr } = await sb
    .from("bookings")
    .upsert(sampleBooking, { onConflict: "id" });
  if (bErr) throw bErr;
  console.log("✓ bookings (demo)");

  const { data: occ, error: occErr } = await sb.rpc("get_occupancy");
  if (occErr) {
    console.warn("⚠ get_occupancy RPC:", occErr.message);
  } else {
    console.log(`✓ occupancy days: ${Array.isArray(occ) ? occ.length : "?"}`);
  }

  console.log("Seed OK.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
