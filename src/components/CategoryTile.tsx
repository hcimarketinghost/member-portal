import Link from "next/link";

/**
 * Category browse tiles — own `.hp-cat-grid` / `.hp-cat-tile`.
 * `tone` is a CSS background-image value: today a placeholder gradient,
 * later a real photo `url(...)` once category assets exist.
 */
export function CategoryGrid({ children }: { children: React.ReactNode }) {
  return <div className="hp-cat-grid">{children}</div>;
}

export function CategoryTile({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone?: string;
}) {
  return (
    <Link
      href={href}
      className="hp-cat-tile"
      style={tone ? { backgroundImage: tone } : undefined}
    >
      <span className="hp-cat-title">{label}</span>
    </Link>
  );
}
