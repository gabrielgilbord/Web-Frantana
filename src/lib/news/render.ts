/** Texto plano con párrafos y **negrita** → HTML seguro para posts. */
export function renderNewsBody(body: string) {
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

export const NEWS_CATEGORY_LABEL: Record<string, string> = {
  lanzamiento: "Lanzamiento",
  promocion: "Promoción",
  noticia: "Noticia",
  otro: "Novedad",
};
