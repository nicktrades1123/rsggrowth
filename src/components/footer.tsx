import Link from "next/link";
import Image from "next/image";
import { navigation, site } from "@/lib/site";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href="/" className="brand" aria-label="RSG home">
              <Image
                src="/brand/rsg-logo.png"
                alt="RSG — Strategy, Finance, Growth, Execution. A clearer path to what’s next."
                width={1774}
                height={887}
                unoptimized
                className="brand-logo"
              />
            </Link>
            <p>
              Clear direction. Sound decisions.
              <br />
              Purposeful action.
            </p>
            <a className="email-link" href={`mailto:${site.email}`}>
              {site.email} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <nav aria-label="Footer navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/business-diagnostic/">Business Diagnostic</Link>
          </nav>
          <p className="footer-note">
            Strategy. Finance.
            <br />
            Growth. Execution.
            <br />
            <span>Built around your business.</span>
          </p>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RSG. All rights reserved.</p>
          <div>
            <Link href="/privacy/">Privacy Policy</Link>
            <Link href="/terms/">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
