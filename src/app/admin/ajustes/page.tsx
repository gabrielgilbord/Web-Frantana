import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";
import { stripeConfigured } from "@/lib/shop/stripe";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getContentBackend } from "@/lib/content/store";

function StatusPill({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={
        active ? "admin-status admin-status--on" : "admin-status admin-status--off"
      }
    >
      <span className="admin-status__dot" aria-hidden>
        ●
      </span>
      {label}: {active ? "activo" : "inactivo"}
    </span>
  );
}

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const shop = SHOP_ENABLED;
  const stripe = stripeConfigured();
  const supabase = isSupabaseConfigured();
  const supabaseAdmin = isSupabaseAdminConfigured();
  const backend = getContentBackend();

  return (
    <div className="admin-page admin-settings">
      <header className="admin-page__header">
        <div>
          <p className="admin-home__eyebrow">Sistema</p>
          <h1 className="admin-page__title">Ajustes</h1>
          <p className="admin-page__lede">
            Estado de integraciones y checklist para pagos reales.
          </p>
        </div>
      </header>

      <section className="admin-section" aria-labelledby="admin-status">
        <h2 id="admin-status" className="admin-section__title">
          Estado
        </h2>
        <div className="admin-section__body">
          <div className="admin-settings__pills">
            <StatusPill label="Tienda" active={shop} />
            <StatusPill label="Stripe" active={stripe} />
            <StatusPill label="Supabase" active={supabase} />
            <StatusPill label="Service role" active={supabaseAdmin} />
          </div>
          <div>
            <p className="admin-order-detail__label">Almacenamiento</p>
            <p className="admin-order-detail__value">
              {backend === "supabase"
                ? "Supabase (service role)"
                : "JSON local (src/data/site.json)"}
            </p>
            {supabase && !supabaseAdmin ? (
              <p className="admin-field__hint">
                Para usar la BD: ejecuta{" "}
                <code>supabase/seed_and_setup.sql</code> en el SQL Editor y
                descomenta <code>SUPABASE_SERVICE_ROLE_KEY</code> en{" "}
                <code>.env.local</code>. Luego{" "}
                <code>node --env-file=.env.local scripts/seed-supabase.mjs</code>
                .
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="admin-section" aria-labelledby="admin-checklist">
        <h2 id="admin-checklist" className="admin-section__title">
          Activar pagos reales
        </h2>
        <ol className="admin-checklist">
          <li>
            Añadir en <code>.env.local</code>:{" "}
            <code>STRIPE_SECRET_KEY</code>,{" "}
            <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>,{" "}
            <code>STRIPE_WEBHOOK_SECRET</code>.
          </li>
          <li>
            Activar <code>SHOP_ENABLED=true</code> y{" "}
            <code>NEXT_PUBLIC_SHOP_ENABLED=true</code>.
          </li>
          <li>
            Configurar el webhook de Stripe apuntando a{" "}
            <code>/api/webhooks/stripe</code>.
          </li>
          <li>Probar un checkout en modo test con tarjeta 4242…</li>
        </ol>
      </section>
    </div>
  );
}
