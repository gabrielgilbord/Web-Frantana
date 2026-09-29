export type TicketStatus =
  | "available"
  | "limited"
  | "sold_out"
  | "free"
  | "cancelled"
  | "tba";

export type Concert = {
  id: string;
  title: string;
  date: string; // ISO date YYYY-MM-DD
  time: string | null; // HH:mm
  city: string;
  venue: string;
  ticketUrl: string | null;
  ticketStatus: TicketStatus;
  published: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  published: boolean;
  sortOrder: number;
  credit: string | null;
};

export type SocialLinks = {
  instagram: string | null;
  facebook: string | null;
  spotify: string | null;
  youtube: string | null;
  tiktok: string | null;
  appleMusic: string | null;
};

export type SiteContent = {
  heroSubtitle: string;
  homeIntroTitle: string;
  homeIntroBody: string;
  aboutTitle: string;
  aboutBody: string;
  aboutStoryTitle: string;
  aboutStoryBody: string;
  musicIntro: string;
  spotifyEmbedUrl: string | null;
  spotifyArtistUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  social: SocialLinks;
  seoDescription: string;
  updatedAt: string;
};

export type ProductCategory = "merch" | "digital" | "physical_music";

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  priceCents: number;
  currency: string;
  stock: number;
  attributes: Record<string, string>;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  images: string[];
  published: boolean;
  featured: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type Order = {
  id: string;
  status: OrderStatus;
  email: string;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    unitPriceCents: number;
  }>;
  totalCents: number;
  currency: string;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SiteData = {
  content: SiteContent;
  concerts: Concert[];
  gallery: GalleryImage[];
  products: Product[];
  orders: Order[];
};
