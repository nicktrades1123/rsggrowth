import Link from "next/link";
import Image from "next/image";
import { Arrow, ButtonLink, DiagnosticCTA, Eyebrow } from "@/components/ui";
import { capabilities, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Strategy, Finance, Growth & Execution",
  "Business strategy and advisory for small and growing businesses. Find clarity on what comes next with RSG’s Business Diagnostic.",
  "/",
);
export default function Home() {
  return (
    <>
      <section className="home-hero home-hero-architectural">
        <picture className="hero-architecture">
          <source
            media="(max-width: 640px)"
            srcSet="/images/rsg-architecture-portrait.webp"
          />
          <Image
            src="/images/rsg-architecture-wide.webp"
            alt=""
            width={1120}
            height={350}
            loading="eager"
            fetchPriority="high"
            unoptimized
            className="hero-architecture-photo"
          />
        </picture>
        <div className="container hero-grid">
          <div className="hero-copy">
            <Eyebrow>Business strategy & advisory</Eyebrow>
            <h1>
              A clearer path
              <br />
              to what’s <em>next.</em>
            </h1>
            <p className="hero-description">
              Turn your growth goals into a practical plan.
            </p>
            <p className="hero-detail">
              RSG helps small and growing business owners move forward through
              strategy, financial insight, business development, and execution
              support.
            </p>
            <div className="hero-actions">
              <ButtonLink href="/business-diagnostic/">
                Start a Business Diagnostic
              </ButtonLink>
              <Link className="text-link" href="/what-we-do/">
                Explore How We Help <Arrow />
              </Link>
            </div>
          </div>
        </div>
        <div className="container hero-baseline">
          <span>
            Strategy <i aria-hidden="true">/</i> Finance{" "}
            <i aria-hidden="true">/</i> Growth <i aria-hidden="true">/</i>{" "}
            Execution
          </span>
          <a href="#our-approach">
            Discover our approach <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <section id="our-approach" className="section">
        <div className="container section-heading">
          <Eyebrow>The RSG Framework</Eyebrow>
          <div>
            <h2>
              Running a business is complex.
              <br />
              Your priorities should be clear.
            </h2>
            <p>
              The RSG Framework connects Strategy, Finance, Growth, and
              Execution around your goals. Winning customers and entering new
              markets require a business-development process, a clear view of
              financial performance, and operations that can support the work.
              We help you connect those decisions to improving profitability and
              strengthening the business.
            </p>
          </div>
        </div>
        <div className="container capability-grid">
          {capabilities.map((item) => (
            <Link
              href={`/what-we-do/#${item.id}`}
              key={item.id}
              className="capability-card"
            >
              <div className="card-top">
                <span>{item.number}</span>
                <Arrow diagonal />
              </div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span className="card-link">{item.line}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section" aria-labelledby="owner-situations">
        <div className="container split-layout">
          <div>
            <Eyebrow>Your next decision</Eyebrow>
            <h2 id="owner-situations">Where RSG Can Help</h2>
            <p>
              Start with the question in front of you. Together, we can work
              through the options and define practical next steps.
            </p>
            <Link href="/business-diagnostic/" className="text-link">
              Start a Business Diagnostic <Arrow />
            </Link>
          </div>
          <div className="editorial-list">
            {[
              "I need more customers.",
              "I want to win commercial work.",
              "I'm considering expanding into another market.",
              "Revenue is growing, but I'm not sure profitability is.",
              "I need a real sales/business-development process.",
              "I know where I want the business to go, but I need a plan to get there.",
            ].map((situation, i) => (
              <div key={situation}>
                <span className="list-number">0{i + 1}</span>
                <div>
                  <h3>{situation}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="audience-section">
        <div className="container split-layout">
          <div>
            <Eyebrow>Who we serve</Eyebrow>
            <h2>
              For owners building
              <br />
              what comes next.
            </h2>
            <p>
              You don’t need to have every answer. You need a considered way to
              work through the right questions.
            </p>
            <Link href="/who-we-serve/" className="text-link">
              Find your starting point <Arrow />
            </Link>
          </div>
          <div className="editorial-list">
            {[
              [
                "Contractors & Home Services",
                "Roofing, restoration, landscaping, HVAC, construction trades, and specialty contractors building a stronger pipeline and pursuing new opportunities.",
                "/industries/contractors-home-services/",
              ],
              [
                "Small & Growing Businesses",
                "Owner-led businesses bringing greater structure to strategy, financial performance, business development, and operations.",
                "/who-we-serve/",
              ],
              [
                "Healthcare & Professional Services",
                "Practices and service organizations strengthening financial performance, operations, growth planning, and management infrastructure.",
                "/who-we-serve/",
              ],
              [
                "Entrepreneurs & New Ventures",
                "Owners evaluating an idea, entering a market, or building the strategic and financial foundation for a new business.",
                "/who-we-serve/",
              ],
            ].map(([title, copy, href], i) => (
              <div key={title}>
                <span className="list-number">0{i + 1}</span>
                <div>
                  <h3>
                    <Link className="segment-link" href={href}>
                      {title} <Arrow />
                    </Link>
                  </h3>
                  <p>{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container process-heading">
          <div>
            <Eyebrow>A practical place to begin</Eyebrow>
            <h2>
              Before a plan,
              <br />a better conversation.
            </h2>
          </div>
          <p>
            The Business Diagnostic helps you step back, describe your business,
            and identify the questions you want to work through with RSG.
          </p>
        </div>
        <div className="container process-grid">
          {[
            [
              "Share the context",
              "Tell us about your business, your stage, and what matters most right now.",
            ],
            [
              "Name the priorities",
              "Identify the challenges and opportunities you’d like to explore.",
            ],
            [
              "Start a conversation",
              "Use your diagnostic as the starting point for discussing how RSG may be able to help.",
            ],
          ].map(([title, text], i) => (
            <div key={title}>
              <span className="step-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <DiagnosticCTA />
    </>
  );
}
