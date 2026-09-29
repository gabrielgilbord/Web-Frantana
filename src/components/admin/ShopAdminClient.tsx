"use client";

import { FormEvent, useState } from "react";
import type { Product, ProductCategory } from "@/types";
import { Button } from "@/components/ui/Button";
import { randomUUID } from "@/lib/client-id";

export function ShopAdminClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "merch" as ProductCategory,
    priceEuros: "25",
    stock: "10",
    variantName: "Única",
    published: false,
    featured: false,
  });

  async function refresh() {
    const res = await fetch("/api/products");
    if (!res.ok) return;
    const data = await res.json();
    setProducts(data.products ?? []);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const priceCents = Math.round(Number(form.priceEuros) * 100);
    if (Number.isNaN(priceCents) || priceCents < 0) {
      setError("Precio inválido");
      return;
    }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug,
        description: form.description,
        category: form.category,
        images: [],
        published: form.published,
        featured: form.featured,
        variants: [
          {
            id: randomUUID(),
            name: form.variantName,
            sku: `${slug}-01`,
            priceCents,
            currency: "EUR",
            stock: Number(form.stock) || 0,
            attributes: {},
          },
        ],
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error al guardar");
      return;
    }
    setMessage(
      "Producto guardado en catálogo (no visible en público mientras SHOP_ENABLED=false)"
    );
    setForm({
      name: "",
      slug: "",
      description: "",
      category: "merch",
      priceEuros: "25",
      stock: "10",
      variantName: "Única",
      published: false,
      featured: false,
    });
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar producto?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Catálogo (tienda oculta)</h1>
      <p className="provisional mt-3 max-w-2xl">
        Gestión de merchandising y música digital. La tienda pública permanece
        desactivada.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 max-w-xl space-y-3 border border-line bg-ivory p-5"
      >
        <label className="block text-sm">
          Nombre
          <input
            required
            className="mt-1 w-full border border-line px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Slug
          <input
            className="mt-1 w-full border border-line px-3 py-2"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Descripción
          <textarea
            className="mt-1 w-full border border-line px-3 py-2"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Categoría
          <select
            className="mt-1 w-full border border-line px-3 py-2"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as ProductCategory })
            }
          >
            <option value="merch">Merch</option>
            <option value="digital">Digital</option>
            <option value="physical_music">Música física</option>
          </select>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-sm">
            Variante
            <input
              className="mt-1 w-full border border-line px-3 py-2"
              value={form.variantName}
              onChange={(e) => setForm({ ...form, variantName: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Precio (€)
            <input
              className="mt-1 w-full border border-line px-3 py-2"
              value={form.priceEuros}
              onChange={(e) => setForm({ ...form, priceEuros: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Stock
            <input
              className="mt-1 w-full border border-line px-3 py-2"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Marcado como publicado en catálogo (sigue oculto en web pública)
        </label>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <Button type="submit">Guardar producto</Button>
      </form>

      <ul className="mt-10 space-y-3">
        {!products.length && <p className="provisional">Catálogo vacío.</p>}
        {products.map((p) => (
          <li key={p.id} className="border border-line bg-ivory p-4">
            <p className="font-display text-xl">{p.name}</p>
            <p className="text-sm text-taupe-dark">
              {p.category} ·{" "}
              {p.variants[0]?.priceCents != null
                ? `${(p.variants[0].priceCents / 100).toFixed(2)} €`
                : "—"}{" "}
              · stock {p.variants[0]?.stock ?? 0}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="mt-2"
              onClick={() => remove(p.id)}
            >
              Eliminar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
