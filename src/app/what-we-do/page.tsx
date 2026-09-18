import { ButtonLink, DiagnosticCTA, Eyebrow, PageIntro } from "@/components/ui";
import { capabilities, pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "What We Do",
  "Explore RSG’s four connected capabilities: Strategy, Finance, Growth, and Execution.",
  "/what-we-do/",
);
export default function WhatWeDo() {
  return (
    <>
      <PageIntro eyebrow="What we do" title="Four capabilities. One business.">
        <p>
          Good decisions connect the whole picture. We bring strategy, finance,
          growth, and execution into the same conversation.
        </p>
      </PageIntro>
      <nav className="capability-nav container" aria-label="Capabilities">
        {capabilities.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            <span>{item.number}</span>
            {item.name}
            <span aria-hidden="true">↓</span>
          </a>
        ))}
      </nav>
      <div className="container">
        {capabilities.map((item) => (
          <section id={item.id} key={item.id} className="capability-detail">
            <div>
              <Eyebrow>
                {item.number} / {item.name}
              </Eyebrow>
              <h2>{item.line}</h2>
              <p className="serif-callout">{item.question}</p>
            </div>
            <div>
              <p>{item.description}</p>
              <h3 className="small-heading">
                Areas we can work through together
              </h3>
              <ul className="ruled-list">
                {item.areas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
      <section className="approach-note">
        <div className="container split-layout">
          <h2>
            The right work starts
            <br />
            with the right context.
          </h2>
          <div>
            <p>
              Your needs may span several capabilities. The diagnostic helps
              frame the conversation before we discuss priorities, scope, and
              the right way to work together.
            </p>
            <ButtonLink href="/business-diagnostic/">
              Start a Business Diagnostic
            </ButtonLink>
          </div>
        </div>
      </section>
      <DiagnosticCTA />
    </>
  );
}
