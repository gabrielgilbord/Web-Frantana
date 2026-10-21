/**
 * Sanitizador HTML mínimo (allowlist) sin jsdom/DOMPurify.
 * Suficiente para el HTML que genera TipTap en novedades.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "hr",
]);

const VOID_TAGS = new Set(["br", "hr"]);

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeAttrs(tag: string, attrs: string): string {
  if (tag !== "a") return "";
  const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").trim();
  if (!href) return "";
  const lower = href.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return "";
  }
  if (
    !(
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.startsWith("mailto:") ||
      lower.startsWith("tel:") ||
      lower.startsWith("/") ||
      lower.startsWith("#")
    )
  ) {
    return "";
  }
  return ` href="${escapeAttr(href)}" rel="noopener noreferrer" target="_blank"`;
}

/** Elimina scripts/eventos y deja solo tags permitidos. */
export function sanitizeNewsHtml(dirty: string): string {
  if (!dirty) return "";

  // Quitar comentarios y bloques peligrosos enteros
  let html = dirty
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|input|textarea|button|link|meta)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(script|style|iframe|object|embed|form|input|textarea|button|link|meta)\b[^>]*>/gi, "");

  html = html.replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (full, rawTag: string, rawAttrs = "") => {
    const tag = rawTag.toLowerCase();
    const isClose = full.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (isClose) return VOID_TAGS.has(tag) ? "" : `</${tag}>`;
    if (VOID_TAGS.has(tag)) return `<${tag}>`;
    const attrs = sanitizeAttrs(tag, rawAttrs || "");
    return `<${tag}${attrs}>`;
  });

  return html;
}
