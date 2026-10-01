export type CartLine = {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  priceCents: number;
  currency: string;
  quantity: number;
  image: string | null;
};

export type CartState = {
  lines: CartLine[];
  updatedAt: string;
};

export const CART_STORAGE_KEY = "frantana-cart-v1";
