import type { CSSProperties, ReactNode } from "react";
import TopBar from "./TopBar";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AppPage({
  children,
  backHref,
  over = false,
  className,
}: {
  children: ReactNode;
  backHref?: string;
  over?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("hp-detail", className)}>
      <TopBar backHref={backHref} over={over} />
      {children}
    </div>
  );
}

export function AppContent({
  children,
  className,
  maxWidth,
  style,
}: {
  children: ReactNode;
  className?: string;
  maxWidth?: CSSProperties["maxWidth"];
  style?: CSSProperties;
}) {
  const contentStyle = maxWidth === undefined ? style : { ...style, maxWidth };

  return (
    <div className={cx("hp-shell hp-screen hp-rise", className)} style={contentStyle}>
      {children}
    </div>
  );
}

export function AppHeader({
  children,
  align = "start",
  className,
}: {
  children: ReactNode;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <header className={cx("hp-app-header", align === "center" && "is-center", className)}>
      {children}
    </header>
  );
}

export function PageTitle({
  eyebrow,
  title,
  children,
  align = "start",
  size = "hero",
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  align?: "start" | "center";
  size?: "page" | "hero";
}) {
  return (
    <AppHeader align={align}>
      {eyebrow && <p className="hp-eyebrow">{eyebrow}</p>}
      <h1 className={size === "hero" ? "hp-h1" : "hp-h2"}>{title}</h1>
      {children}
    </AppHeader>
  );
}
