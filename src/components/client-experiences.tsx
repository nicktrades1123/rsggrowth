"use client";
import { useEffect, useState } from "react";
import { services } from "@/lib/review-options";
import type { PublicReview } from "@/lib/reviews";
export function ClientExperiences({
  practice,
  service,
}: {
  practice: "career" | "business";
  service?: keyof typeof services;
}) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  useEffect(() => {
    const abort = new AbortController();
    fetch(
      `/api/reviews/public?practice=${practice}${service ? `&service=${service}` : ""}`,
      { signal: abort.signal, cache: "no-store", redirect: "error" },
    )
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
      })
      .catch(() => {});
    return () => abort.abort();
  }, [practice, service]);
  if (!reviews.length) return null;
  return (
    <section className="section" aria-label="Client Experiences">
      <div className="container">
        <p className="eyebrow">Client Experiences</p>
        <h2>In their own words.</h2>
        <div className="testimonial-grid">
          {reviews.map((r) => (
            <figure className="client-experience" key={r.id}>
              <p className="eyebrow">{services[r.service]}</p>
              <p aria-label={`${r.rating} out of 5 stars`}>
                <span aria-hidden="true">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </p>
              <blockquote>
                <p>{r.response2}</p>
              </blockquote>
              <p className="experience-change">What changed: {r.response1}</p>
              {r.outcome &&
                !["Prefer not to say", "Other"].includes(r.outcome) && (
                  <p className="field-help">
                    Client-reported outcome: {r.outcome}
                  </p>
                )}
              <figcaption>
                {r.publicName}
                {r.jobTitle ? ` · ${r.jobTitle}` : ""}
                {r.industry ? ` · ${r.industry}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

