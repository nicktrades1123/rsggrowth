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
              For general questions or to introduce your business, email us
              directly. Please avoid sending sensitive financial or personal
              records.
            </p>
          </div>
          <div className="contact-diagnostic">
            <Eyebrow>Not sure where to begin?</Eyebrow>
            <h2>
              Start with the
              <br />
              Business Diagnostic.
            </h2>
            <p>
              Organize your goals and challenges into a useful starting point
              for a conversation.
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
