import { ButtonLink, Eyebrow } from "@/components/ui";
export default function NotFound() {
  return (
    <section className="container not-found">
      <Eyebrow>404 / Page not found</Eyebrow>
      <h1>
        A different
        <br />
        direction.
      </h1>
      <p>
        We couldn’t find the page you’re looking for. Head back to the beginning
        or explore how RSG can help.
      </p>
      <div className="hero-actions">
        <ButtonLink href="/">Back to Home</ButtonLink>
        <ButtonLink href="/what-we-do/" secondary>
          Explore How We Help
        </ButtonLink>
      </div>
    </section>
  );
}
