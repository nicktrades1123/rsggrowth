import Link from "next/link";
import { Arrow, ButtonLink, Eyebrow, PageIntro } from "@/components/ui";
import { pageMetadata, site } from "@/lib/site";

const path = "/industries/contractors-home-services/";
export const metadata = pageMetadata(
  "Contractor Business Strategy & Growth",
  "Strategy, financial insight, business development, and execution support for contractors and home-service businesses in DFW and beyond.",
  path,
);
const situations = [
  "We do great work, but most of our business still comes from referrals.",
  "I want to win more commercial or property-management work.",
  "We need a better way to consistently find new customers.",
  "I'm considering expanding into another part of DFW or a new market.",
  "Revenue is growing, but I'm not sure which jobs, customers, or services are actually the most profitable.",
  "I know we can grow, but we don't have a real business-development process.",
  "We're getting bigger, but our processes haven't caught up.",
  "We need to look more established when pursuing larger customers or vendor opportunities.",
];
const framework = [
  {
    name: "Strategy",
    line: "Determine where growth should come from.",
    areas: [
      "Market opportunity assessment and customer prioritization",
      "Geographic expansion and market selection",
      "Commercial vs. residential opportunity",
      "Growth roadmaps and competitive positioning",
    ],
  },
  {
    name: "Finance",
    line: "Understand where the business actually makes money.",
    areas: [
      "Revenue, profitability, and customer/service-line analysis",
      "Pricing and margin visibility",
      "Budgeting and forecasting",
      "Growth investment decisions and KPI development",
    ],
  },
  {
    name: "Growth",
    line: "Build a more intentional path to new business.",
    areas: [
      "Business-development strategy and sales pipeline structure",
      "Property-management outreach and commercial customer targeting",
      "General contractor and subcontractor opportunity strategy",
      "Referral and partnership strategy",
      "Market expansion and go-to-market planning",
    ],
  },
  {
    name: "Execution",
    line: "Turn the strategy into a working operating process.",
    areas: [
      "Business-development processes and opportunity tracking",
      "Vendor qualification and RFP/proposal readiness",
      "KPI dashboards and implementation roadmaps",
      "Accountability and follow-through",
    ],
  },
];
export default function ContractorsHomeServices() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Contractor business strategy and growth advisory",
            serviceType: "Business strategy and advisory",
            description:
              "Strategy, finance, business development, and execution support for contractors and home-service businesses.",
            url: `${site.url}${path}`,
            provider: { "@type": "Organization", name: "RSG", url: site.url },
          }),
        }}
      />
      <PageIntro
        eyebrow="Contractors & home services"
        title="Build the business behind the work."
      >
        <p>
          Being good at the trade and building a business that can grow are
          different challenges. RSG helps contractors strengthen their strategy,
          financial visibility, business-development process, and operating
          structure.
        </p>
        <div className="hero-actions">
          <ButtonLink href="/business-diagnostic/">
            Start a Business Diagnostic
          </ButtonLink>
          <Link href="#how-rsg-helps" className="text-link">
            See How RSG Helps <Arrow />
          </Link>
        </div>
      </PageIntro>
      <section className="section">
        <div className="container split-layout">
          <div>
            <Eyebrow>For owners building the business</Eyebrow>
            <h2>Does any of this sound familiar?</h2>
            <p>
              For roofing, restoration, landscaping, HVAC, construction trades,
              specialty contractors, and related owner-operated home-service
              businesses—in DFW and beyond.
            </p>
          </div>
          <div className="editorial-list">
            {situations.map((situation, i) => (
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
      <section id="how-rsg-helps" className="audience-section">
        <div className="container">
          <Eyebrow>The RSG Framework</Eyebrow>
          <h2>How RSG helps contractors.</h2>
          {framework.map((item, i) => (
            <div className="capability-detail" key={item.name}>
              <div>
                <Eyebrow>
                  0{i + 1} / {item.name}
                </Eyebrow>
                <h3 className="industry-framework-title">{item.line}</h3>
              </div>
              <ul className="ruled-list">
                {item.areas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            </div>
          ))}
          <Link href="/what-we-do/" className="text-link industry-context-link">
            Explore the full RSG Framework <Arrow />
          </Link>
          <p className="industry-scope">
            RSG provides business advisory support. Construction, estimating,
            legal work, insurance adjusting, and licensed trade services remain
            with the appropriate professionals.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container split-layout">
          <div>
            <Eyebrow>Commercial & property-management growth</Eyebrow>
            <h2>Ready to pursue larger opportunities?</h2>
            <p>
              Property managers, multifamily operators, commercial property
              owners, general contractors, builders, facility/service
              relationships, and larger vendor networks can call for a different
              approach to business development.
            </p>
          </div>
          <div className="prose">
            <p>
              Moving beyond residential and referral-driven work takes more than
              sending an email. A clear account strategy, credible qualification
              materials, and a consistent follow-up process help you prepare to
              pursue the right opportunities.
            </p>
            <ul className="ruled-list">
              <li>Target account strategy and market prioritization</li>
              <li>Vendor qualification materials and capability positioning</li>
              <li>Outreach process and opportunity tracking</li>
              <li>Proposal/RFP readiness and follow-up structure</li>
            </ul>
            <p>
              RSG can help you structure that work and prepare your business to
              compete. Contracts, introductions, leads, and wins are not
              guaranteed.
            </p>
          </div>
        </div>
      </section>
      <section className="audience-section">
        <div className="container">
          <Eyebrow>Your stage of growth</Eyebrow>
          <h2>A practical next step for your business.</h2>
          <div className="process-grid">
            {[
              [
                "Building the foundation",
                "The work is there, but sales and operations still depend heavily on the owner.",
              ],
              [
                "Creating a repeatable growth engine",
                "The company has traction and needs more structure around business development, financial visibility, and execution.",
              ],
              [
                "Expanding the business",
                "The company is evaluating new customers, commercial work, additional service lines, or geographic expansion.",
              ],
            ].map(([title, copy], i) => (
              <div key={title}>
                <span className="step-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <Eyebrow>Start with your business</Eyebrow>
            <h2>Let’s understand where the business stands today.</h2>
            <p>
              Tell RSG where the business is today, where you’re trying to take
              it, and what’s getting in the way. Once we receive your responses,
              we’ll review them and determine where RSG may be able to help.
            </p>
            <p>Takes approximately 3–5 minutes. No obligation.</p>
          </div>
          <ButtonLink href="/business-diagnostic/">
            Start a Business Diagnostic
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
