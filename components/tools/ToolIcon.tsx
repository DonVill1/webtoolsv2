/**
 * Per-tool icon assets.
 *
 * Fourteen are the exact SVGs from v1; the rest follow the same 512px solid
 * silhouette style. Kept as static files so every card gets a distinct mark
 * without a client-side icon runtime.
 */
export function ToolIcon({ slug, size = 26 }: { slug: string; size?: number }) {
  return (
    <img
      src={`/tool-icons/${slug}.svg`}
      alt=""
      width={size}
      height={size}
      className="tool-icon-img"
      loading="lazy"
      decoding="async"
      aria-hidden="true"
    />
  );
}
