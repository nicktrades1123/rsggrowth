import { PageIntro } from "@/components/ui";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Terms",
  "Terms for using the RSG website and Business Diagnostic.",
  "/terms/",
);
export default function Terms() {
  return (
    <>
      <PageIntro eyebrow="Website terms" title="A clear starting point.">
        <p>
          These terms describe use of the RSG website and Business Diagnostic.
        </p>
      </PageIntro>
      <article className="container legal">
        <h2>Website information</h2>
        <p>
          This website provides general information about RSG’s business
          strategy and advisory services. Its content is not individualized
          legal, tax, accounting, investment, or other regulated professional
          advice.
        </p>
        <h2>Inquiries and the Business Diagnostic</h2>
        <p>
          The diagnostic is a way to describe your business and begin a
          conversation. It does not provide an automated assessment,
          recommendation, or guarantee of any result. Sending an inquiry does
          not create an advisory relationship or oblige either party to enter an
          engagement.
        </p>
        <p>
          Any engagement, including its scope, fees, responsibilities, and
          confidentiality terms, must be agreed separately in writing. Please
          avoid sending confidential records or sensitive personal information
          through this website or an initial inquiry.
        </p>
        <h2>Appropriate use</h2>
        <p>
          Use this website lawfully. Do not attempt to disrupt its operation,
          gain unauthorized access, submit malicious content, or impersonate
          another person. Provide information you are authorized to share.
        </p>
        <h2>Website content</h2>
        <p>
          RSG’s name, branding, and original website materials may not be used
          to imply an affiliation or endorsement without permission. Third-party
          materials, where identified, remain subject to their owners’ rights.
        </p>
        <h2>Availability and outcomes</h2>
        <p>
          Website content and features may change. Availability and
          uninterrupted operation are not guaranteed. Business outcomes depend
          on circumstances, decisions, and execution; this website makes no
          promise of financial or commercial results.
        </p>
        <h2>External services</h2>
        <p>
          Third-party services, including your email provider, operate under
          their own terms. RSG does not control their availability or practices.
        </p>
        <h2>Questions</h2>
        <p>
          Contact <a href="mailto:grow@rsggrowth.com">grow@rsggrowth.com</a>{" "}
          with questions about this website or a potential engagement.
        </p>
      </article>
    </>
  );
}
