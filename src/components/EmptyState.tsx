import Link from "next/link";

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
  return (
    <section className="hp-card hp-empty-state">
      {title && <h2 className="hp-empty-title">{title}</h2>}
      <p className="hp-body">{body}</p>
      {action && <EmptyStateLink action={action} />}
    </section>
  );
}
