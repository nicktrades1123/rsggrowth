import { ButtonLink, Eyebrow, PageIntro } from "@/components/ui";
import { pageMetadata, site } from "@/lib/site";
export const metadata = pageMetadata(
  "Contact",
  "Contact RSG at grow@rsggrowth.com or start a Business Diagnostic to introduce your business.",
  "/contact/",
);
export default function Contact() {
  return (
    <>
      <PageIntro eyebrow="Contact" title="Let’s start with a conversation.">
        <p>
          A decision to make. A question to work through. A business ready for
          its next chapter. Tell us what’s on your mind.
        </p>
      </PageIntro>
      <section className="section">
        <div className="container contact-grid">
          <div>
            <Eyebrow>Email RSG</Eyebrow>
            <a className="contact-email" href={`mailto:${site.email}`}>
              {site.email}
              <span aria-hidden="true">↗</span>
            </a>
            <p>
              For general inquiries, email us directly. Please avoid sending
              sensitive financial or personal records.
            </p>
          </div>
          <div className="contact-diagnostic">
            <Eyebrow>Consulting inquiries</Eyebrow>
            <h2>
              Start with the
              <br />
              Business Diagnostic.
            </h2>
            <p>
              For substantive consulting inquiries, start with the Business
              Diagnostic. Share where your business stands, your goals, and the
              challenges you want to address so RSG can consider potential next
              steps.
            </p>
            <ButtonLink href="/business-diagnostic/">
              Start a Business Diagnostic
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
