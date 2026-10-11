type Props = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

/** Inyecta JSON-LD sin hidratar en cliente. */
export function JsonLd({ data }: Props) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload),
      }}
    />
  );
}
