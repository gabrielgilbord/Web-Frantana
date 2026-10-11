import { notFound } from "next/navigation";
import { getProducts } from "@/lib/content/store";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  buildMetadata,
  productJsonLd,
} from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) {
    return buildMetadata({
      path: "/tienda",
      title: "Producto",
      noIndex: true,
    });
  }

  const path = `/tienda/${product.slug}`;
  const image = product.images[0];

  return buildMetadata({
    path,
    title: { absolute: `${product.name} | Tienda Frantana` },
    description:
      product.description ||
      `${product.name} — tienda oficial de Frantana.`,
    image,
    imageAlt: product.name,
    openGraph: {
      title: product.name,
      description: product.description,
      url: path,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const path = `/tienda/${product.slug}`;

  return (
    <div className="tienda pt-[var(--header-h)]">
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Tienda", path: "/tienda" },
            { name: product.name, path },
          ]),
        ]}
      />
      <ProductPurchase product={product} />
    </div>
  );
}
