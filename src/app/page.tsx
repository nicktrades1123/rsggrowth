import Link from "next/link";
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
      <section className="home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <Eyebrow>Business strategy & advisory</Eyebrow>
            <h1>
              Clarity for your
              <br />
              next <em>chapter.</em>
            </h1>
            <p className="hero-description">
              Your business has potential. Give it direction.
            </p>
            <p className="hero-detail">
              RSG helps small and growing businesses connect strategy, finance,
              growth, and execution—so the next decision leads somewhere.
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
          <div
            className="framework-visual"
            aria-label="Four connected capabilities: Strategy, Finance, Growth, and Execution"
          >
            <div className="framework-heading">
              <span>The RSG framework</span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className="framework-grid">
              {capabilities.map((item) => (
                <div key={item.id} className={`framework-cell ${item.id}`}>
                  <span className="framework-number">{item.number}</span>
                  <p>{item.name}</p>
                  <span className="framework-caption">{item.line}</span>
                </div>
              ))}
            </div>
            <div className="framework-foot">
              <span>One connected approach.</span>
              <span aria-hidden="true">—</span>
              <span>Your business at the center.</span>
            </div>
          </div>
        </div>
        <div className="container hero-baseline">
          <span>Perspective for the decisions ahead.</span>
          <a href="#our-approach">
            Discover our approach <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <section id="our-approach" className="section">
        <div className="container section-heading">
          <Eyebrow>Built for the real work of business</Eyebrow>
          <div>
            <h2>
              Running a business is complex.
              <br />
              Your priorities should be clear.
            </h2>
            <p>
              Growth brings decisions that rarely sit in just one category. A
              new opportunity affects cash flow. A strategic shift changes how
              your team works. RSG brings these conversations together.
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
                "Finding direction",
                "You’re building a business and deciding where to focus.",
              ],
              [
                "Navigating growth",
                "Demand is changing, and your plans need to keep pace.",
              ],
              [
                "Strengthening the business",
                "You want better visibility, stronger processes, and clearer accountability.",
              ],
            ].map(([title, copy], i) => (
              <div key={title}>
                <span className="list-number">0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
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
