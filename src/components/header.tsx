"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/lib/site";

export function Header() {
  const path = usePathname();
  const career = path.startsWith("/careers");
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          className="brand"
          href="/"
          aria-label="RSG home"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/brand/rsg-logo.png"
            alt="RSG — Strategy, Finance, Growth, Execution. A clearer path to what’s next."
            width={1774}
            height={887}
            unoptimized
            preload
            className="brand-logo"
          />
        </Link>
        <button
          ref={toggle}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden="true">{open ? "×" : "+"}</span>
        </button>
        <nav
          id="primary-navigation"
          aria-label="Main navigation"
          className={`main-nav ${open ? "is-open" : ""}`}
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                path.replace(/\/$/, "") === item.href.replace(/\/$/, "")
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={career ? "/careers/diagnostic/" : "/business-diagnostic/"}
            className="nav-cta"
            onClick={() => setOpen(false)}
          >
            {career ? "Start Your Career Diagnostic" : "Start a Business Diagnostic"} <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

