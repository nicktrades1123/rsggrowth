import { CareerForm } from "@/components/career-form";
import { PageIntro } from "@/components/ui";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Career Diagnostic",
  "Share your career goals, experience, and job-search challenges with RSG to identify a practical next step.",
  "/careers/diagnostic/",
);
export default function CareerDiagnostic() {
  return (
    <>
      <PageIntro
        eyebrow="RSG Career Strategy"
        title="Let’s understand your next move."
      >
        <p>
          Tell us where you are, where you want to go, and what’s getting in the
          way. We’ll start by understanding your experience before recommending
          support.
        </p>
      </PageIntro>
      <div className="container diagnostic-layout">
        <aside className="diagnostic-sidebar">
          <h2>
            Your experience.
            <br />
            Your next chapter.
          </h2>
          <p>Approximately 5–7 minutes. No obligation.</p>
          <p>You can share your resume after we review your diagnostic.</p>
          <p>
            Please don’t include sensitive personal details, account
            credentials, or confidential employer information.
          </p>
          <p>
            Prefer to write directly?
            <br />
            <a href="mailto:grow@rsggrowth.com">grow@rsggrowth.com</a>
          </p>
        </aside>
        <div>
          <noscript>
            <p className="noscript">
              This diagnostic needs JavaScript. You can email grow@rsggrowth.com
              to discuss your goals.
            </p>
          </noscript>
          <CareerForm />
        </div>
      </div>
    </>
  );
}

