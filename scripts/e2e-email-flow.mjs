/**
 * Flujo E2E de correos Frantana → musync.lpgc@gmail.com
 * Uso: node scripts/e2e-email-flow.mjs [baseUrl]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const TEST_EMAIL = "musync.lpgc@gmail.com";
const MARKER = "[E2E-SMTP-TEST]";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@frantana.es";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "FrantanaAdmin2026!";

function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();

const cookieJar = new Map();

function storeCookies(res) {
  const raw = res.headers.getSetCookie?.() || [];
  for (const c of raw) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    if (i > 0) cookieJar.set(pair.slice(0, i), pair.slice(i + 1));
  }
}

function cookieHeader() {
  return [...cookieJar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const cookie = cookieHeader();
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  storeCookies(res);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { res, data };
}

function cleanupSiteJson() {
  const path = resolve(process.cwd(), "src/data/site.json");
  const data = JSON.parse(readFileSync(path, "utf8"));
  const beforeB = (data.bookings || []).length;
  const beforeC = (data.contactInquiries || []).length;

  data.bookings = (data.bookings || []).filter(
    (b) =>
      !(
        String(b.message || "").includes(MARKER) ||
        String(b.name || "").includes(MARKER) ||
        (b.email === TEST_EMAIL && String(b.message || "").includes("E2E"))
      )
  );
  data.contactInquiries = (data.contactInquiries || []).filter(
    (c) =>
      !(
        String(c.message || "").includes(MARKER) ||
        (c.email === TEST_EMAIL && String(c.message || "").includes("E2E"))
      )
  );

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
  return {
    bookingsRemoved: beforeB - data.bookings.length,
    contactsRemoved: beforeC - data.contactInquiries.length,
  };
}

async function main() {
  console.log(`Base: ${BASE}`);
  console.log(`Destino prueba: ${TEST_EMAIL}`);

  const health = await fetch(BASE).catch(() => null);
  if (!health?.ok && health?.status !== 304) {
    throw new Error(
      `No hay servidor en ${BASE}. Arranca next dev antes de este script.`
    );
  }

  // 1) Contacto → artista (NOTIFY)
  console.log("\n1) POST /api/contact…");
  const contact = await api("/api/contact", {
    method: "POST",
    body: JSON.stringify({
      name: `E2E Contact ${MARKER}`,
      email: TEST_EMAIL,
      phone: "+34 600 111 222",
      subject: "contratacion",
      message: `${MARKER} Mensaje de prueba del formulario de contacto. Puedes ignorar y borrar.`,
    }),
  });
  console.log("   status", contact.res.status, contact.data?.warning || "ok");
  if (contact.res.status !== 201) {
    throw new Error(`Contact failed: ${JSON.stringify(contact.data)}`);
  }

  // 2) Reserva A → artista + solicitante
  const dateA = "2099-06-15";
  console.log("\n2) POST /api/booking (confirm flow)…");
  const bookA = await api("/api/booking", {
    method: "POST",
    body: JSON.stringify({
      name: `E2E Reserva Confirm ${MARKER}`,
      email: TEST_EMAIL,
      phone: "+34 600 111 222",
      eventType: "privado",
      preferredDate: dateA,
      preferredTime: "21:00",
      city: "Las Palmas",
      venue: "Sala E2E",
      message: `${MARKER} Solicitud A para confirmar. Borrar tras la prueba.`,
    }),
  });
  console.log("   status", bookA.res.status, bookA.data?.warning || "ok");
  if (bookA.res.status !== 201) {
    throw new Error(`Booking A failed: ${JSON.stringify(bookA.data)}`);
  }
  const idA = bookA.data.booking.id;

  // 3) Reserva B → rechazar
  const dateB = "2099-06-16";
  console.log("\n3) POST /api/booking (reject flow)…");
  const bookB = await api("/api/booking", {
    method: "POST",
    body: JSON.stringify({
      name: `E2E Reserva Reject ${MARKER}`,
      email: TEST_EMAIL,
      phone: "+34 600 111 223",
      eventType: "fiesta",
      preferredDate: dateB,
      preferredTime: "22:00",
      city: "Telde",
      venue: "Terraza E2E",
      message: `${MARKER} Solicitud B para rechazar. Borrar tras la prueba.`,
    }),
  });
  console.log("   status", bookB.res.status, bookB.data?.warning || "ok");
  if (bookB.res.status !== 201) {
    throw new Error(`Booking B failed: ${JSON.stringify(bookB.data)}`);
  }
  const idB = bookB.data.booking.id;

  // 4) Login admin
  console.log("\n4) Login admin…");
  const login = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD || ADMIN_PASSWORD,
    }),
  });
  console.log("   status", login.res.status);
  if (!login.res.ok) {
    throw new Error(`Login failed: ${JSON.stringify(login.data)}`);
  }

  // 5) Confirmar A
  console.log("\n5) PATCH confirm booking A…");
  const conf = await api("/api/booking", {
    method: "PATCH",
    body: JSON.stringify({ id: idA, status: "confirmed" }),
  });
  console.log("   status", conf.res.status, conf.data?.warning || "ok");
  if (!conf.res.ok) {
    throw new Error(`Confirm failed: ${JSON.stringify(conf.data)}`);
  }

  // 6) Rechazar B
  console.log("\n6) PATCH reject booking B…");
  const rej = await api("/api/booking", {
    method: "PATCH",
    body: JSON.stringify({ id: idB, status: "rejected" }),
  });
  console.log("   status", rej.res.status, rej.data?.warning || "ok");
  if (!rej.res.ok) {
    throw new Error(`Reject failed: ${JSON.stringify(rej.data)}`);
  }

  // Esperar a que SMTP termine en el servidor
  await new Promise((r) => setTimeout(r, 2000));

  // 7) Limpiar datos
  console.log("\n7) Limpiando datos de prueba en site.json…");
  const cleaned = cleanupSiteJson();
  console.log("   eliminados", cleaned);

  console.log("\n✓ Flujo E2E completado. Revisa la bandeja de", TEST_EMAIL);
  console.log(
    "  Esperados: contacto (artista), 2× nueva reserva (artista+usuario), confirmación, rechazo."
  );
}

main().catch((err) => {
  console.error("\n✗ Falló el flujo:", err.message || err);
  try {
    const cleaned = cleanupSiteJson();
    console.error("Limpieza parcial:", cleaned);
  } catch (e) {
    console.error("No se pudo limpiar site.json:", e.message);
  }
  process.exit(1);
});
