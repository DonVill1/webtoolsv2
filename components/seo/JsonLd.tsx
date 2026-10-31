type Data = Record<string, unknown> | Array<Record<string, unknown>>;

/**
 * Server-rendered JSON-LD. This is deliberately not a client component and has
 * no mounted check: structured data must be in the HTML the crawler receives.
 */
export function JsonLd({ data, id }: { data: Data; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
