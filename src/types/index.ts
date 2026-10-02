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
  /** Optional map pin for embeds (WGS84). */
  lat: number | null;
  lng: number | null;
  /** Primary show image. Fallback to gallery when null. */
  image: string | null;
  ticketUrl: string | null;
  ticketStatus: TicketStatus;
  published: boolean;
  /**
   * If true and not published, the date still shows as occupied on the
   * public booking calendar (private parties, holds) without revealing the title.
   * Published concerts always occupy the calendar.
   */
  blocksCalendar: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Public occupancy cell — never exposes private event titles. */
export type OccupancyDay = {
  date: string;
  status: "public" | "private";
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
    productName: string;
    variantId: string;
    variantName: string;
    quantity: number;
    unitPriceCents: number;
  }>;
  totalCents: number;
  currency: string;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingStatus = "new" | "read" | "replied" | "archived";

export type BookingEventType =
  | "privado"
  | "boda"
  | "corporativo"
  | "fiesta"
  | "otro";

export type BookingMessage = {
  id: string;
  from: "client" | "admin";
  body: string;
  createdAt: string;
};

export type BookingRequest = {
  id: string;
  accessToken: string;
  name: string;
  email: string;
  phone: string | null;
  eventType: BookingEventType;
  preferredDate: string | null; // YYYY-MM-DD
  preferredTime: string | null; // HH:mm
  city: string;
  venue: string | null;
  message: string;
  messages: BookingMessage[];
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: "contratacion" | "prensa" | "otro";
  message: string;
  createdAt: string;
};

export type SiteData = {
  content: SiteContent;
  concerts: Concert[];
  gallery: GalleryImage[];
  products: Product[];
  orders: Order[];
  bookings?: BookingRequest[];
  contactInquiries?: ContactInquiry[];
};
