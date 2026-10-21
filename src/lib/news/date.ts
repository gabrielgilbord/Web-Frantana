export function formatNewsDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function newsDateParts(iso: string | null | undefined) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) {
    return { day: "—", month: "" };
  }
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
  };
}
