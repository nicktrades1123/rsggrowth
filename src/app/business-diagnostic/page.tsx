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
        title="A clearer view starts here."
      >
        <p>
          Step back from the day-to-day. Share a little about your business and
          the questions you want to work through.
        </p>
      </PageIntro>
      <div className="container diagnostic-layout">
        <aside className="diagnostic-sidebar">
          <h2>
            Your business.
            <br />
            Your starting point.
          </h2>
          <p>
            Four short steps to organize your context, priorities, and goals.
          </p>
          <p>
            This is a conversation starter, not an automated assessment or a
            commitment to work together.
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
