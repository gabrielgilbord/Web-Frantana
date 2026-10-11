import type { NewsPost } from "@/types";

/** Visible en la web ahora (no borrador ni programada a futuro). */
export function isNewsLive(post: Pick<NewsPost, "published" | "publishedAt">) {
  if (!post.published) return false;
  if (!post.publishedAt) return true;
  return new Date(post.publishedAt).getTime() <= Date.now();
}

export function newsPublishState(
  post: Pick<NewsPost, "published" | "publishedAt">
): "draft" | "scheduled" | "live" {
  if (!post.published) return "draft";
  if (post.publishedAt && new Date(post.publishedAt).getTime() > Date.now()) {
    return "scheduled";
  }
  return "live";
}

export function toDatetimeLocalValue(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(local: string) {
  const v = local.trim();
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
