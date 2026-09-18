import { DiagnosticForm } from "@/components/diagnostic-form";
import { PageIntro } from "@/components/ui";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Business Diagnostic",
  "Introduce your business, identify your priorities, and prepare for a conversation with RSG using our Business Diagnostic.",
  "/business-diagnostic/",
);
export default function BusinessDiagnostic() {
  return (
    <>
      <PageIntro
        eyebrow="Business diagnostic"
        title="Let’s understand the business first."
      >
        <p>
          Before recommending a solution, RSG wants to understand where your
          business stands today, where you want to go, and what’s getting in the
          way.
        </p>
      </PageIntro>
      <div className="container diagnostic-layout">
        <aside className="diagnostic-sidebar">
          <h2>
            Your business.
            <br />
            Your starting point.
          </h2>
          <p>Takes approximately 3–5 minutes. No obligation.</p>
          <p>
            Submitting a diagnostic does not create a consulting engagement.
            Once RSG receives your responses, we will review them and follow up
            regarding potential next steps.
          </p>
          <p>
            Prefer to write directly?
            <br />
            <a href="mailto:grow@rsggrowth.com">grow@rsggrowth.com</a>
          </p>
        </aside>
        <div>
          <noscript>
            <div className="noscript">
              The multi-step diagnostic needs JavaScript. You can also email
              your business name, priorities, and goals directly to{" "}
              <a href="mailto:grow@rsggrowth.com">grow@rsggrowth.com</a>.
            </div>
          </noscript>
          <DiagnosticForm />
        </div>
      </div>
    </>
  );
}
