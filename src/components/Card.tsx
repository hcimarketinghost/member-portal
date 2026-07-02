import type { ReactNode } from "react";

/**
 * Base card surface — owns `.hp-card` (var(--surface) background,
 * var(--radius-card), 24px padding). Variants pass a modifier class that
 * carries only its deltas, e.g. `<Card className="hp-member-card">`.
 */
export default function Card({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "section" | "article";
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={className ? `hp-card ${className}` : "hp-card"}>{children}</Tag>;
}
