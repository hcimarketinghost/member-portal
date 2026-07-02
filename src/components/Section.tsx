import Link from "next/link";
import type { ReactNode } from "react";

type SectionAction = {
  href: string;
  label: string;
  external?: boolean;
};

function SectionActionLink({ action }: { action: SectionAction }) {
  const external =
    action.external ||
    action.href.startsWith("http") ||
    action.href.startsWith("mailto:");

  if (external) {
    return (
      <a href={action.href} className="hp-section-action">
        {action.label}
      </a>
    );
  }

  return (
    <Link href={action.href} className="hp-section-action">
      {action.label}
    </Link>
  );
}

/**
 * Titled content block — owns `.hp-section`, `.hp-section-head`,
 * `.hp-section-title`. Optional trailing `action` link (e.g. "See all").
 */
export default function Section({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: SectionAction;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className ? `hp-section ${className}` : "hp-section"}>
      <header className="hp-section-head">
        <h2 className="hp-section-title">{title}</h2>
        {action && <SectionActionLink action={action} />}
      </header>
      {children}
    </section>
  );
}
