import { DiagnosticCTA, Eyebrow, PageIntro } from "@/components/ui";
import { pageMetadata } from "@/lib/site";
import { TeamProfile } from "@/components/team-profile";
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
          Finance, Growth, and Execution. We bring disciplines from strategy,
          finance, corporate development, and business growth to the practical
          decisions facing small and growing business owners.
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
              The RSG Framework connects these four capabilities around the
              realities of your business. That can mean assessing a new market,
              developing business relationships, understanding profitability, or
              turning a growth goal into a plan with clear responsibilities.
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
      <section className="section" aria-labelledby="leadership-heading">
        <div className="container">
          <Eyebrow>The experience behind RSG</Eyebrow>
          <h2 id="leadership-heading">
            Experience built inside complex businesses. Applied to growing ones.
          </h2>
          <TeamProfile
            name="Dominick Reed"
            role="Founder"
            portrait={{
              src: "/images/dominick-reed.jpg",
              width: 480,
              height: 720,
            }}
          >
            <p>
              Dominick Reed brings nine years of experience across investment
              banking, management consulting, transaction advisory, corporate
              development, strategic finance, growth strategy, and business
              transformation. His professional experience includes Accenture and
              Stout, alongside his current role as Manager, Corporate
              Development and Strategic Finance within a multi-site healthcare
              services organization.
            </p>
            <p>
              His work includes evaluating businesses and growth opportunities,
              financial and operational analysis, strategic planning,
              transaction-related work, and translating analysis into executable
              initiatives.
            </p>
            <p>
              He created RSG to bring structured strategy, financial discipline,
              growth planning, and execution support to small and growing
              businesses that may not have an internal strategy, finance, or
              business-development team. Growing businesses deserve access to
              the same thoughtful analysis and decision-making disciplines used
              inside much larger organizations.
            </p>
            <p className="profile-note">
              Professional experience is provided for background only. RSG is
              independent; current and former employers do not sponsor, endorse,
              partner with, or have an affiliation with RSG.
            </p>
          </TeamProfile>
        </div>
      </section>
      <DiagnosticCTA />
    </>
  );
}
