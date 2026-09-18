import { PageIntro } from "@/components/ui";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Privacy Policy",
  "How information shared through the RSG website and Business Diagnostic is handled.",
  "/privacy/",
);
export default function Privacy() {
  return (
    <>
      <PageIntro eyebrow="Privacy policy" title="Your information, considered.">
        <p>
          This policy describes information handled through the RSG website and
          inquiries sent to grow@rsggrowth.com.
        </p>
      </PageIntro>
      <article className="container legal">
        <h2>Information you choose to share</h2>
        <p>
          You may provide your name, email address, business name, role,
          business stage, team size, priorities, and goals when you contact RSG
          or complete the Business Diagnostic. Please do not include sensitive
          personal information, account credentials, or confidential financial
          records.
        </p>
        <h2>The Business Diagnostic</h2>
        <p>
          The diagnostic keeps your answers in the current browser tab while you
          complete it. It does not save answers in cookies or browser storage.
          Closing, refreshing, or leaving the page clears your progress.
        </p>
        <p>
          When the diagnostic prepares an email draft, your answers have not
          been sent to RSG. You decide whether to send them through your email
          provider. Downloaded summaries are saved to your own device. If direct
          submission is enabled, the final button is labeled “Submit Business
          Diagnostic” and sends the information to RSG; a receipt is shown only
          after the service confirms acceptance.
        </p>
        <h2>How inquiry information is used</h2>
        <p>
          Information you send to RSG is used to understand your inquiry,
          respond to you, and discuss whether RSG’s services may be appropriate.
          Submitting an inquiry is not consent to receive a marketing
          newsletter.
        </p>
        <h2>Service providers and website data</h2>
        <p>
          Hosting, security, and email providers may process technical
          information such as IP addresses, request details, and email metadata
          to deliver their services. Your email provider’s own terms and privacy
          practices apply when you send an email.
        </p>
        <h2>Website analytics</h2>
        <p>
          RSG uses Google Analytics 4 to understand website visits, referral and
          campaign sources, and interactions such as diagnostic steps and
          contact-link clicks. Google Analytics uses cookies and processes
          technical information about your browser and device. RSG does not send
          diagnostic answers, names, email addresses, business names, or other
          inquiry details in its analytics events. Advertising personalization
          and Google signals are disabled in the website tag. Learn more about{" "}
          <a href="https://policies.google.com/technologies/partner-sites">
            how Google uses information from sites that use its services
          </a>
          .
        </p>
        <h2>Access, retention, and security</h2>
        <p>
          Inquiry information should be limited to what is needed to respond and
          manage the relationship, subject to applicable recordkeeping
          requirements. No internet transmission or storage method can be
          guaranteed completely secure. Contact RSG if you have questions about
          access to, correction of, or deletion of information you have
          provided.
        </p>
        <h2>Links and changes</h2>
        <p>
          Other websites have their own privacy practices. This policy may be
          updated as RSG’s services or website features change.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy questions or requests, email{" "}
          <a href="mailto:grow@rsggrowth.com">grow@rsggrowth.com</a>.
        </p>
      </article>
    </>
  );
}
