import { DiagnosticCTA, Eyebrow, PageIntro } from "@/components/ui";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Who We Serve",
  "Business advisory for small and growing businesses navigating decisions, financial questions, growth, and execution.",
  "/who-we-serve/",
);
const segments = [
  {
    title: "Contractors & Home Services",
    text: "For owners in roofing, restoration, landscaping, HVAC, construction trades, and specialty contracting who want a more deliberate approach to growth.",
    questions: [
      "How do we build commercial business development and property-management relationships?",
      "What do we need to prepare for vendor qualification?",
      "Which markets should we consider, and what growth strategy will support expansion?",
    ],
  },
  {
    title: "Small & Growing Businesses",
    text: "For owners balancing customer demand, profitability, and day-to-day operations. Connect growth goals to the finances, processes, and capacity needed to deliver.",
    questions: [
      "How do we win more customers through a repeatable sales process?",
      "Is revenue growth translating into better profitability and cash flow?",
      "Which operating processes need to improve before we grow further?",
    ],
  },
  {
    title: "Healthcare & Professional Services",
    text: "For owners of practices and service businesses considering how to develop the business alongside delivering their core services. Focus on business planning, financial visibility, and operations.",
    questions: [
      "How do we develop referral relationships and new business opportunities?",
      "What do our costs, pricing, and capacity tell us about financial performance?",
      "How can we strengthen operations and plan for expansion?",
    ],
  },
  {
    title: "Entrepreneurs & New Ventures",
    text: "For founders turning an idea or early business into a practical path forward. Clarify the market, business model, financial needs, and first priorities.",
    questions: [
      "Who are our customers, and how will we reach them?",
      "What assumptions about pricing, costs, and cash should we test?",
      "What needs to happen first, and how will we turn the plan into action?",
    ],
  },
];
export default function WhoWeServe() {
  return (
    <>
      <PageIntro
        eyebrow="Who we serve"
        title="For the business you’re building."
      >
        <p>
          RSG works with small and growing businesses. Our starting point is
          your situation: the decisions in front of you, the constraints you
          face, and the direction you want to take.
        </p>
      </PageIntro>
      <div className="container section">
        {segments.map((stage, i) => (
          <section key={stage.title} className="capability-detail">
            <div>
              <Eyebrow>0{i + 1} / Your next chapter</Eyebrow>
              <h2>{stage.title}</h2>
              <p>{stage.text}</p>
            </div>
            <div>
              <h3 className="small-heading">Questions you might be asking</h3>
              <ul className="question-list">
                {stage.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
      <DiagnosticCTA />
    </>
  );
}
