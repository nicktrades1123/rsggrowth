import { DiagnosticCTA, Eyebrow, PageIntro } from "@/components/ui";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "About RSG",
  "RSG is a business strategy and advisory firm focused on Strategy, Finance, Growth, and Execution.",
  "/about/",
);
export default function About() {
  return (
    <>
      <PageIntro
        eyebrow="About RSG"
        title="Perspective. With a practical purpose."
      >
        <p>
          RSG is a business strategy and advisory firm focused on Strategy,
          Finance, Growth, and Execution. We help small and growing businesses
          think through what comes next.
        </p>
      </PageIntro>
      <section className="section">
        <div className="container split-layout">
          <div>
            <Eyebrow>Our perspective</Eyebrow>
            <h2>
              A business is more
              <br />
              than a set of parts.
            </h2>
          </div>
          <div className="prose">
            <p>
              Strategy sets direction. Finance brings the tradeoffs into view.
              Growth tests what is possible. Execution turns intention into
              progress.
            </p>
            <p>
              RSG’s approach connects these four capabilities around the
              realities of your business. The aim is clear thinking, sound
              decisions, and practical next steps.
            </p>
            <p>
              We start by understanding the context, rather than assuming the
              answer. Your goals, resources, and constraints shape the
              conversation.
            </p>
          </div>
        </div>
      </section>
      <section className="audience-section">
        <div className="container">
          <Eyebrow>How we approach the work</Eyebrow>
          <div className="process-grid">
            <div>
              <h3>Context before conclusions.</h3>
              <p>
                Understand the business and the question before choosing a
                course of action.
              </p>
            </div>
            <div>
              <h3>Clarity over complexity.</h3>
              <p>
                Make priorities, tradeoffs, and responsibilities easier to
                understand.
              </p>
            </div>
            <div>
              <h3>Thinking connected to doing.</h3>
              <p>
                Keep the practical work of implementation in view from the
                start.
              </p>
            </div>
          </div>
        </div>
      </section>
      <DiagnosticCTA />
    </>
  );
}
