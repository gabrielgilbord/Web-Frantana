"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import type { Product, ProductCategory, ProductVariant } from "@/types";
import { randomUUID } from "@/lib/client-id";
import { formatPrice } from "@/lib/shop/format";

type FormState = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  published: boolean;
  featured: boolean;
  images: string[];
  variants: ProductVariant[];
};

type StockFilter = "all" | "published" | "draft" | "soldout" | "low";

const LOW_STOCK = 5;

const emptyForm = (): FormState => ({
  id: null,
  name: "",
  slug: "",
  description: "",
  category: "merch",
  published: false,
  featured: false,
  images: [],
  variants: [
    {
      id: randomUUID(),
      name: "M",
      sku: "",
      priceCents: 2500,
      currency: "EUR",
      stock: 10,
      attributes: { size: "M" },
    },
  ],
});

function totalStock(p: Product | FormState) {
  return p.variants.reduce((s, v) => s + v.stock, 0);
}

export function ShopAdminClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [query, setQuery] = useState("");
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const stock = totalStock(p);
      if (filter === "published" && !p.published) return false;
      if (filter === "draft" && p.published) return false;
      if (filter === "soldout" && stock > 0) return false;
      if (filter === "low" && !(stock > 0 && stock <= LOW_STOCK)) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [products, filter, query]);

  async function refresh() {
    const res = await fetch("/api/products");
    if (!res.ok) return;
    const data = await res.json();
    setProducts(data.products ?? []);
  }

  function startCreate() {
    setForm(emptyForm());
    setExpandedVariant(null);
    setMessage(null);
    setError(null);
    setMode("edit");
  }

  function edit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      published: p.published,
      featured: p.featured,
      images: [...p.images],
      variants: p.variants.map((v) => ({ ...v, attributes: { ...v.attributes } })),
    });
    setExpandedVariant(p.variants[0]?.id ?? null);
    setMessage(null);
    setError(null);
    setMode("edit");
  }

  function backToList() {
    setForm(emptyForm());
    setMode("list");
    setMessage(null);
    setError(null);
  }

  async function onUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al subir");
        return;
      }
      setForm((f) => ({ ...f, images: [...f.images, data.src] }));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const slug =
      form.slug ||
      form.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const variants = form.variants.map((v, i) => ({
      ...v,
      id: v.id || randomUUID(),
      sku: v.sku || `${slug}-${i + 1}`,
      attributes: {
        ...v.attributes,
        ...(v.name ? { size: v.name } : {}),
      },
    }));

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id ?? undefined,
          name: form.name,
          slug,
          description: form.description,
          category: form.category,
          images: form.images,
          published: form.published,
          featured: form.featured,
          variants,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al guardar");
        return;
      }
      setMessage(form.id ? "Producto actualizado" : "Producto creado");
      setForm(emptyForm());
      setMode("list");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar producto?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    if (form.id === id) backToList();
    await refresh();
  }

  function updateVariant(index: number, patch: Partial<ProductVariant>) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  }

  function addVariant() {
    const id = randomUUID();
    setForm((f) => ({
      ...f,
      variants: [
        ...f.variants,
        {
          id,
          name: "",
          sku: "",
          priceCents: f.variants[0]?.priceCents ?? 2500,
          currency: "EUR",
          stock: 0,
          attributes: {},
        },
      ],
    }));
    setExpandedVariant(id);
  }

  function renderVariantFields(v: ProductVariant, i: number) {
    return (
      <>
        <label className="admin-field">
          <span className="admin-field__label">Talla / nombre</span>
          <input
            className="admin-field__input"
            value={v.name}
            onChange={(e) => updateVariant(i, { name: e.target.value })}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">SKU</span>
          <input
            className="admin-field__input"
            value={v.sku}
            onChange={(e) => updateVariant(i, { sku: e.target.value })}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Precio €</span>
          <input
            className="admin-field__input"
            type="number"
            step="0.01"
            min="0"
            value={(v.priceCents / 100).toFixed(2)}
            onChange={(e) =>
              updateVariant(i, {
                priceCents: Math.round(Number(e.target.value) * 100) || 0,
              })
            }
          />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Stock</span>
          <input
            className="admin-field__input"
            type="number"
            min="0"
            value={v.stock}
            onChange={(e) =>
              updateVariant(i, { stock: Number(e.target.value) || 0 })
            }
          />
        </label>
      </>
    );
  }

  if (mode === "edit") {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <button
              type="button"
              className="admin-linkish admin-editor-back"
              onClick={backToList}
            >
              ← Volver al catálogo
            </button>
            <h1 className="admin-page__title">
              {form.id ? "Editar producto" : "Nuevo producto"}
            </h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="admin-form">
          <section className="admin-section">
            <h2 className="admin-section__title">Información</h2>
            <div className="admin-section__body">
              <label className="admin-field">
                <span className="admin-field__label">Nombre</span>
                <input
                  required
                  className="admin-field__input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Slug</span>
                <input
                  className="admin-field__input"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="se-genera-del-nombre"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Descripción</span>
                <textarea
                  className="admin-field__input admin-field__input--area"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Categoría</span>
                <select
                  className="admin-field__input"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value as ProductCategory,
                    })
                  }
                >
                  <option value="merch">Merch</option>
                  <option value="digital">Digital</option>
                  <option value="physical_music">Música física</option>
                </select>
              </label>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section__title">Imágenes</h2>
            <div className="admin-section__body">
              <div className="admin-media-grid">
                {form.images.map((src, i) => (
                  <div key={src} className="admin-media-item">
                    <div className="admin-media-item__preview">
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="140px"
                        className="object-cover"
                      />
                    </div>
                    <div className="admin-media-item__actions">
                      {i === 0 ? (
                        <span className="admin-media-item__badge">Principal</span>
                      ) : (
                        <button
                          type="button"
                          className="admin-linkish"
                          onClick={() =>
                            setForm((f) => {
                              const images = [...f.images];
                              const [img] = images.splice(i, 1);
                              images.unshift(img);
                              return { ...f, images };
                            })
                          }
                        >
                          Hacer principal
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-linkish"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            images: f.images.filter((_, idx) => idx !== i),
                          }))
                        }
                      >
                        Quitar
                      </button>
                      {i > 0 && (
                        <button
                          type="button"
                          className="admin-linkish"
                          onClick={() =>
                            setForm((f) => {
                              const images = [...f.images];
                              [images[i - 1], images[i]] = [
                                images[i],
                                images[i - 1],
                              ];
                              return { ...f, images };
                            })
                          }
                        >
                          ↑
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <label className="admin-upload admin-upload--lg">
                <span>{uploading ? "Subiendo…" : "Subir imagen"}</span>
                <span className="admin-upload__hint">
                  JPEG, PNG, WebP o AVIF · toca para elegir
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section__title">Variantes</h2>
            <div className="admin-section__body">
              <div className="admin-variant-table-wrap">
                <table className="admin-variant-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>SKU</th>
                      <th>Precio €</th>
                      <th>Stock</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((v, i) => (
                      <tr key={v.id}>
                        <td>
                          <input
                            className="admin-field__input"
                            value={v.name}
                            onChange={(e) =>
                              updateVariant(i, { name: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="admin-field__input"
                            value={v.sku}
                            onChange={(e) =>
                              updateVariant(i, { sku: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="admin-field__input"
                            type="number"
                            step="0.01"
                            min="0"
                            value={(v.priceCents / 100).toFixed(2)}
                            onChange={(e) =>
                              updateVariant(i, {
                                priceCents:
                                  Math.round(Number(e.target.value) * 100) || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="admin-field__input"
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) =>
                              updateVariant(i, {
                                stock: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-linkish"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                variants: f.variants.filter((_, idx) => idx !== i),
                              }))
                            }
                            disabled={form.variants.length <= 1}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-variant-cards">
                {form.variants.map((v, i) => {
                  const open = expandedVariant === v.id;
                  return (
                    <div key={v.id} className="admin-variant-card">
                      <button
                        type="button"
                        className="admin-variant-card__summary"
                        onClick={() =>
                          setExpandedVariant(open ? null : v.id)
                        }
                        aria-expanded={open}
                      >
                        <span>
                          {v.name || `Variante ${i + 1}`} ·{" "}
                          {formatPrice(v.priceCents)} · stock {v.stock}
                        </span>
                        <span aria-hidden>{open ? "−" : "+"}</span>
                      </button>
                      {open && (
                        <div className="admin-variant-card__body">
                          {renderVariantFields(v, i)}
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger admin-btn--sm"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                variants: f.variants.filter((_, idx) => idx !== i),
                              }))
                            }
                            disabled={form.variants.length <= 1}
                          >
                            Quitar variante
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button type="button" className="admin-btn admin-btn--ghost" onClick={addVariant}>
                + Añadir variante
              </button>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section__title">Visibilidad</h2>
            <div className="admin-section__body">
              <label className="admin-field admin-field--row">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                />
                <span className="admin-field__label">Publicado</span>
              </label>
              <label className="admin-field admin-field--row">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                <span className="admin-field__label">Destacado</span>
              </label>
            </div>
          </section>

          <div className="admin-sticky-actions">
            {(error || message) && (
              <div className="admin-sticky-actions__feedback">
                {error && (
                  <p role="alert" className="admin-feedback admin-feedback--error">
                    {error}
                  </p>
                )}
                {message && (
                  <p role="status" className="admin-feedback admin-feedback--ok">
                    {message}
                  </p>
                )}
              </div>
            )}
            <button
              type="submit"
              className="admin-btn admin-btn--ember"
              disabled={saving}
            >
              {saving ? "Guardando…" : form.id ? "Guardar" : "Crear"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={backToList}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Tienda</h1>
          <p className="admin-page__lede">{products.length} productos</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--ember"
          onClick={startCreate}
        >
          + Nuevo producto
        </button>
      </div>

      <div className="admin-chips" role="tablist" aria-label="Filtrar productos">
        {(
          [
            ["all", "Todos"],
            ["published", "Publicados"],
            ["draft", "Borradores"],
            ["soldout", "Agotados"],
            ["low", "Stock bajo"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            className={`admin-chip${filter === id ? " is-active" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-page__toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Buscar por nombre o slug…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar productos"
        />
      </div>

      {!filtered.length ? (
        <p className="admin-empty">
          {products.length
            ? "Ningún producto coincide con los filtros."
            : "Catálogo vacío."}
        </p>
      ) : (
        <ul className="admin-list">
          {filtered.map((p) => {
            const stock = totalStock(p);
            const price = p.variants[0]?.priceCents;
            return (
              <li key={p.id} className="admin-list-row admin-list-row--product">
                <div className="admin-list-row__thumb">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="admin-list-row__main">
                  <p className="admin-list-row__title">{p.name}</p>
                  <p className="admin-list-row__meta">
                    {price != null ? formatPrice(price) : "—"} · stock {stock}
                    {p.featured ? " · Destacado" : ""}
                  </p>
                  <div className="admin-list-row__badges">
                    <span
                      className={`admin-status ${
                        p.published
                          ? "admin-status--published"
                          : "admin-status--draft"
                      }`}
                    >
                      {p.published ? "Publicado" : "Borrador"}
                    </span>
                    {stock === 0 && (
                      <span className="admin-status admin-status--soldout">
                        Agotado
                      </span>
                    )}
                    {stock > 0 && stock <= LOW_STOCK && (
                      <span className="admin-status admin-status--low">
                        Stock bajo
                      </span>
                    )}
                  </div>
                </div>
                <div className="admin-list-row__actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => edit(p)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger admin-btn--sm"
                    onClick={() => remove(p.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
