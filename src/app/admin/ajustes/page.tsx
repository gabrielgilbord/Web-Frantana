import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl">Ajustes</h1>
      <dl className="mt-8 space-y-4 border border-line bg-ivory p-6 text-sm">
        <div>
          <dt className="text-taupe-dark">SHOP_ENABLED</dt>
          <dd className="font-medium">{String(SHOP_ENABLED)}</dd>
        </div>
        <div>
          <dt className="text-taupe-dark">Supabase configurado</dt>
          <dd className="font-medium">{String(isSupabaseConfigured())}</dd>
        </div>
        <div>
          <dt className="text-taupe-dark">Almacenamiento de datos actual</dt>
          <dd className="font-medium">
            {isSupabaseConfigured()
              ? "Supabase (cuando las tablas estén migradas)"
              : "JSON local (src/data/site.json) — listo para desarrollo"}
          </dd>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Checklist para activar la tienda</h2>
        <ol className="prose-editorial mt-4 list-decimal space-y-2 pl-5">
          <li>Configurar Stripe (cuenta, claves, webhooks firmados).</li>
          <li>Probar PaymentIntents / Checkout Session en modo test.</li>
          <li>Definir impuestos (IVA España/UE) y facturación.</li>
          <li>Configurar envíos físicos o entrega digital.</li>
          <li>Redactar políticas legales (aviso, privacidad, cookies, condiciones, devoluciones).</li>
          <li>Cumplir RGPD y obligación de información al consumidor.</li>
          <li>Conectar inventario real y alertas de stock.</li>
          <li>Activar `SHOP_ENABLED=true` solo tras pruebas E2E de compra.</li>
          <li>Añadir ruta pública `/tienda`, enlace en nav/footer y sitemap.</li>
          <li>Monitorizar webhooks de pago, reembolsos y fulfillment.</li>
        </ol>
        <p className="provisional mt-6">
          La arquitectura admite Stripe sin reescribir el frontend; el checkout no
          está implementado a propósito.
        </p>
      </section>
    </div>
  );
}
