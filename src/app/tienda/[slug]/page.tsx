import { notFound } from "next/navigation";
import { getProducts } from "@/lib/content/store";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) return buildMetadata({ title: "Producto" });
  return buildMetadata({
    title: product.name,
    description: product.description,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <div className="tienda pt-[var(--header-h)]">
      <ProductPurchase product={product} />
    </div>
  );
}
