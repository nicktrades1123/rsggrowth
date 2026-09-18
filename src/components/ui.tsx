import Link from "next/link";
import type { ReactNode } from "react";

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span aria-hidden="true" className="arrow">
      {diagonal ? "↗" : "→"}
    </span>
  );
}
export function ButtonLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={secondary ? "button button-secondary" : "button"}
    >
      {children}
      <Arrow />
    </Link>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="container">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <div className="intro-copy">{children}</div>
      </div>
    </section>
  );
}
export function DiagnosticCTA() {
  return (
    <section className="cta-band">
      <div className="container cta-inner">
        <div>
          <Eyebrow>A clearer starting point</Eyebrow>
          <h2>
            Start with your business.
            <br />
            Build from there.
          </h2>
          <p>
            Tell us what’s working, what’s getting in the way, and what comes
            next.
          </p>
        </div>
        <ButtonLink href="/business-diagnostic/">
          Start a Business Diagnostic
        </ButtonLink>
      </div>
    </section>
  );
}
