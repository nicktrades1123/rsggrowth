"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  classification,
  outcomes,
  reviewSchema,
  services,
  tokenSchema,
  type ReviewInput,
} from "@/lib/reviews";
import { IntakeErrors, IntakeField } from "./intake-fields";

export function ReviewForm() {
  const token = useRef(""),
    lock = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  const [invitation, setInvitation] = useState<{
    practice: "career" | "business";
    service: keyof typeof services;
  } | null>(null);
  const [loading, setLoading] = useState(true),
    [unavailable, setUnavailable] = useState(""),
    [error, setError] = useState("");
  const [pending, setPending] = useState(false),
    [done, setDone] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<ReviewInput>({
    rating: 0,
    response1: "",
    response2: "",
    outcome: "",
    identity: "anonymous",
    firstName: "",
    lastInitial: "",
    jobTitle: "",
    industry: "",
    consent: false,
  });
  useEffect(() => {
    // Keep the bearer token in memory, never storage, markup, analytics, or HTTP URLs.
    token.current ||= window.location.hash.slice(1);
    window.history.replaceState(null, "", window.location.pathname);
    const abort = new AbortController();
    async function verify() {
      try {
        tokenSchema.parse(token.current);
        const response = await fetch("/api/reviews/verify", {
          method: "POST",
          redirect: "error",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.current }),
          signal: abort.signal,
        });
        if (!response.ok) throw new Error();
        const category = classification.parse(await response.json());
        if (!abort.signal.aborted) setInvitation(category);
      } catch {
        if (!abort.signal.aborted)
          setUnavailable(
            "This invitation is unavailable. It may be expired, withdrawn, or already used. Please ask RSG for a new link.",
          );
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    }
    void verify();
    return () => abort.abort();
  }, []);
  useEffect(() => {
    if (done) heading.current?.focus();
  }, [done]);
  useEffect(() => {
    if (Object.keys(errors).length)
      document.getElementById("intake-errors")?.focus();
  }, [errors]);
  function update(key: keyof ReviewInput, value: string | number | boolean) {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      const n = { ...e };
      delete n[key];
      return n;
    });
    setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    const parsed = reviewSchema.safeParse(draft);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] ||= issue.message;
      setErrors(next);
      return;
    }
    lock.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        redirect: "error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.current, review: parsed.data }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok || (await response.json()).status !== "submitted")
        throw new Error();
      token.current = "";
      setDone(true);
    } catch {
      setError(
        "We could not confirm your feedback. Your answers are still here. If you already submitted, contact grow@rsggrowth.com before retrying.",
      );
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  function field(
    name:
      | "response1"
      | "response2"
      | "firstName"
      | "lastInitial"
      | "jobTitle"
      | "industry"
      | "outcome",
    label: string,
    props: Partial<React.ComponentProps<typeof IntakeField>> = {},
  ) {
    return (
      <IntakeField
        name={name}
        label={label}
        value={draft[name] || ""}
        onChange={(v) => update(name, v)}
        error={errors[name]}
        {...props}
      />
    );
  }
  if (loading) return <p role="status">Opening your invitation…</p>;
  if (unavailable || !invitation)
    return (
      <p role="alert" className="error-summary">
        {unavailable || "Invitation unavailable."}
      </p>
    );
  if (done)
    return (
      <div className="confirmation">
        <h2 ref={heading} tabIndex={-1}>
          Thank you — we really appreciate it.
        </h2>
        <p>
          Your feedback helps other professionals and business owners understand
          what working with RSG is actually like.
        </p>
        <p>
          RSG will review your feedback. It will only be published with your
          permission and RSG’s approval.
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} noValidate aria-busy={pending}>
      <p className="eyebrow">
        {invitation.practice === "career"
          ? "Career Strategy"
          : "Business Advisory"}{" "}
        · {services[invitation.service]}
      </p>
      <IntakeErrors errors={errors} />
      <fieldset disabled={pending}>
        <fieldset aria-describedby={errors.rating ? "rating-error" : undefined}>
          <legend className="field-label">
            How would you rate your experience?
          </legend>
          <div className="rating-options">
            {[1, 2, 3, 4, 5].map((n) => (
              <label className="choice" key={n}>
                <input
                  id={n === 1 ? "rating" : `rating-${n}`}
                  type="radio"
                  name="rating"
                  value={n}
                  checked={draft.rating === n}
                  onChange={() => update("rating", n)}
                  aria-describedby={errors.rating ? "rating-error" : undefined}
                />
                <span>
                  {n} <span aria-hidden="true">★</span>
                  <span className="sr-only">
                    {n === 1 ? " star" : " stars"}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errors.rating && (
            <p className="field-error" id="rating-error">
              Choose a rating from 1 to 5 stars.
            </p>
          )}
        </fieldset>
        {field(
          "response1",
          "What changed or improved after working with RSG?",
          { multiline: true, maxLength: 800 },
        )}
        {field(
          "response2",
          "What would you tell someone considering working with RSG?",
          { multiline: true, maxLength: 800 },
        )}
        {invitation.practice === "career" &&
          field("outcome", "Did anything happen after working with RSG?", {
            options: outcomes,
            optional: true,
          })}
        <fieldset>
          <legend className="field-label">
            How would you like to appear publicly?
          </legend>
          {(
            [
              ["first_initial", "First name + last initial"],
              ["first", "First name only"],
              ["anonymous", "Anonymous"],
            ] as const
          ).map(([value, label]) => (
            <label className="consent identity-choice" key={value}>
              <input
                type="radio"
                name="identity"
                checked={draft.identity === value}
                onChange={() => update("identity", value)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        {draft.identity !== "anonymous" && (
          <div className="form-grid">
            {field("firstName", "Public first name", { maxLength: 60 })}
            {draft.identity === "first_initial" &&
              field("lastInitial", "Last initial", { maxLength: 1 })}
          </div>
        )}
        <div className="form-grid">
          {field("jobTitle", "Public job title", { optional: true })}
          {field("industry", "Public industry", { optional: true })}
        </div>
        <p className="privacy-note">
          Only include details you are comfortable making public. Please leave
          names of employers, contact details, and sensitive information out of
          your feedback. Any optional title, industry, and selected outcome may
          appear with your testimonial if you give permission below.
        </p>
        <label className="consent review-consent">
          <input
            type="checkbox"
            id="consent"
            checked={draft.consent}
            onChange={(e) => update("consent", e.target.checked)}
          />
          <span>
            I give RSG permission to display this testimonial on its website and
            marketing materials. (Optional)
          </span>
        </label>
        <p className="privacy-note">
          You can submit private feedback without publication consent. Read our{" "}
          <a
            className="text-link"
            href="/privacy/"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy (opens in a new tab)
          </a>
          .
        </p>
      </fieldset>
      {error && (
        <p className="error-summary" role="alert">
          {error}
        </p>
      )}
      <button className="button" disabled={pending}>
        {pending ? "Submitting…" : "Submit feedback"}
      </button>
    </form>
  );
}

