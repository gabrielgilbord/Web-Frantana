import { sanitizeNewsHtml } from "@/lib/news/sanitize-html";

function looksLikeHtml(body: string) {
  return /<\/?[a-z][\s\S]*>/i.test(body.trim());
}

/** Texto plano legado (**negrita**, párrafos) → HTML. */
function renderPlainBody(body: string) {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const withBold = (s: string) =>
    escape(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  return body
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split(/\n/).map(withBold).join("<br />");
      return `<p>${lines}</p>`;
    })
    .join("");
}

/** HTML del editor TipTap (o texto plano legado) → HTML seguro. */
export function renderNewsBody(body: string) {
  const raw = body.trim();
  if (!raw) return "";
  const html = looksLikeHtml(raw) ? raw : renderPlainBody(raw);
  return sanitizeNewsHtml(html);
}

export const NEWS_CATEGORY_LABEL: Record<string, string> = {
  lanzamiento: "Lanzamiento",
  promocion: "Promoción",
  noticia: "Noticia",
  otro: "Novedad",
};
