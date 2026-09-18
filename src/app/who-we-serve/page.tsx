import { DiagnosticCTA, Eyebrow, PageIntro } from "@/components/ui";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Who We Serve",
  "Business advisory for small and growing businesses navigating decisions, financial questions, growth, and execution.",
  "/who-we-serve/",
);
const stages = [
  {
    title: "Building a foundation",
    text: "You have a business to build and important choices to make. Bring structure to your thinking before adding complexity.",
    questions: [
      "How should I prioritize limited time and resources?",
      "Does my business model support my goals?",
      "What do I need to understand about cash and pricing?",
    ],
  },
  {
    title: "Managing a growing business",
    text: "More activity brings more decisions. Align opportunity with the financial and operational capacity to support it.",
    questions: [
      "Which growth opportunities are worth pursuing?",
      "Can our cash flow support the next step?",
      "Where are our processes holding us back?",
    ],
  },
  {
    title: "Stepping back to move forward",
    text: "An established business can benefit from a fresh look. Revisit priorities and connect the plan to the work happening every day.",
    questions: [
      "Are we focused on the right priorities?",
      "Do our numbers give us a useful view of performance?",
      "Who owns the next steps, and how will we review them?",
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
        {stages.map((stage, i) => (
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
