import { ReviewForm } from "@/components/review-form";
import { PageIntro } from "@/components/ui";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Private feedback",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
};
export default function Review() {
  return (
    <>
      <PageIntro
        eyebrow="Private client feedback"
        title="How was your experience with RSG?"
      >
        <p>
          Your feedback helps other people understand what working with RSG is
          actually like. This should only take about a minute.
        </p>
      </PageIntro>
      <div className="container review-page">
        <noscript>
          <p>
            JavaScript is required to open your private invitation. Please
            contact grow@rsggrowth.com if you need help.
          </p>
        </noscript>
        <ReviewForm />
      </div>
    </>
  );
}

