import Link from "next/link";
import Card from "./Card";

type EmptyStateAction = {
  href: string;
  label: string;
  external?: boolean;
};

function EmptyStateLink({ action }: { action: EmptyStateAction }) {
  const external =
    action.external ||
    action.href.startsWith("http") ||
    action.href.startsWith("mailto:");

  if (external) {
    return (
      <a href={action.href} className="hp-btn hp-btn-inset">
        {action.label}
      </a>
    );
  }

  return (
    <Link href={action.href} className="hp-btn hp-btn-inset">
      {action.label}
    </Link>
  );
}

export default function EmptyState({
  title,
  body,
  action,
}: {
  title?: string;
  body: string;
  action?: EmptyStateAction;
}) {
  // The action sits below the card — an inset button inside the grey surface
  // would be grey-on-grey.
  return (
    <section className="hp-empty-state">
      <Card className="hp-empty-card">
        {title && <h2 className="hp-empty-title">{title}</h2>}
        <p className="hp-body">{body}</p>
      </Card>
      {action && <EmptyStateLink action={action} />}
    </section>
  );
}
