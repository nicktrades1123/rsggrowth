"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  careerChallenges,
  careerEfforts,
  careerGoals,
  careerSchema,
  careerStepFields,
  careerSteps,
  careerTimelines,
  experienceOptions,
  initialCareer,
  submitCareer,
  validateCareerStep,
  type CareerDraft,
} from "@/lib/career";
import { createCareerTracking } from "@/lib/analytics";
import { IntakeChoices, IntakeErrors, IntakeField } from "./intake-fields";

function CareerField({
  name,
  draft,
  errors,
  update,
  ...props
}: Omit<
  React.ComponentProps<typeof IntakeField>,
  "value" | "onChange" | "error"
> & {
  name: keyof CareerDraft;
  draft: CareerDraft;
  errors: Record<string, string>;
  update: (name: keyof CareerDraft, value: string) => void;
}) {
  return (
    <IntakeField
      {...props}
      name={name}
      value={String(draft[name])}
      error={errors[name]}
      onChange={(value) => update(name, value)}
    />
  );
}

export function CareerForm() {
  const [draft, setDraft] = useState<CareerDraft>(initialCareer),
    [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [error, setError] = useState("");
  const [pending, setPending] = useState(false),
    [submitted, setSubmitted] = useState(false);
  const lock = useRef(false),
    requestId = useRef(""),
    tracker = useRef(createCareerTracking());
  const heading = useRef<HTMLHeadingElement>(null),
    mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) heading.current?.focus();
    else mounted.current = true;
  }, [step, submitted]);
  useEffect(() => {
    if (Object.keys(errors).length)
      document.getElementById("intake-errors")?.focus();
  }, [errors]);
  function update(key: keyof CareerDraft, value: string | string[] | boolean) {
    tracker.current.start();
    setDraft((d) => ({ ...d, [key]: value }));
    requestId.current = "";
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
    setError("");
  }
  async function next(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    const invalid = validateCareerStep(draft, step);
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    if (step < 7) {
      tracker.current.advance(step + 2);
      setStep((s) => s + 1);
      return;
    }
    const parsed = careerSchema.safeParse(draft);
    if (!parsed.success) {
      setStep(
        careerStepFields.findIndex((fields) =>
          fields.includes(parsed.error.issues[0].path[0] as keyof CareerDraft),
        ),
      );
      return;
    }
    lock.current = true;
    setPending(true);
    setError("");
    try {
      requestId.current ||= crypto.randomUUID();
      const result = await submitCareer(parsed.data, requestId.current);
      tracker.current.complete(result);
      setSubmitted(true);
    } catch {
      setError(
        "Delivery could not be confirmed. Your answers are still here. Try again or email grow@rsggrowth.com.",
      );
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  const fieldProps = { draft, errors, update };
  if (submitted)
    return (
      <div className="confirmation">
        <h2 ref={heading} tabIndex={-1}>
          Thanks. We’ll take a look.
        </h2>
        <p>
          Your Career Diagnostic has been submitted to RSG. We’ll review what
          you shared and follow up regarding the areas where career positioning
          support may be most useful.
        </p>
        <p>
          Submitting a diagnostic does not create an engagement or guarantee an
          employment outcome.
        </p>
        <Link className="text-link" href="/careers/">
          Return to Career Strategy
        </Link>
      </div>
    );
  return (
    <div className="diagnostic-shell">
      <div className="progress-meta">
        <span>Career Diagnostic</span>
        <span aria-live="polite">Step {step + 1} of 8</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Career Diagnostic progress"
        aria-valuemin={0}
        aria-valuemax={8}
        aria-valuenow={step + 1}
        aria-valuetext={`${careerSteps[step]}: step ${step + 1} of 8`}
      >
        <div
          className="progress-fill"
          style={{ width: `${((step + 1) / 8) * 100}%` }}
        />
      </div>
      <form onSubmit={next} noValidate aria-busy={pending}>
        <h2 className="form-title" tabIndex={-1} ref={heading}>
          {careerSteps[step]}
        </h2>
        <p className="form-subtitle">
          All fields are required unless marked optional. Keep sensitive
          personal information out of your answers.
        </p>
        <IntakeErrors errors={errors} />
        <fieldset disabled={pending}>
          {step === 0 && (
            <div className="form-grid">
              <CareerField
                {...fieldProps}
                name="firstName"
                label="First name"
                maxLength={60}
                autoComplete="given-name"
              />
              <CareerField
                {...fieldProps}
                name="lastName"
                label="Last name"
                maxLength={60}
                autoComplete="family-name"
              />
              <CareerField
                {...fieldProps}
                name="email"
                label="Email"
                maxLength={120}
                type="email"
                autoComplete="email"
              />
              <CareerField
                {...fieldProps}
                name="phone"
                label="Phone number"
                maxLength={40}
                optional
                type="tel"
                autoComplete="tel"
              />
              <CareerField
                {...fieldProps}
                name="location"
                label="City / State"
                optional
              />
            </div>
          )}
          {step === 1 && (
            <>
              <CareerField
                {...fieldProps}
                name="title"
                label="Current or most recent job title"
              />
              <CareerField
                {...fieldProps}
                name="industry"
                label="Current or most recent industry"
              />
              <CareerField
                {...fieldProps}
                name="experience"
                label="Approximate years of professional experience"
                options={experienceOptions}
              />
            </>
          )}
          {step === 2 && (
            <IntakeChoices
              name="goals"
              label="What are you trying to accomplish?"
              options={careerGoals}
              value={draft.goals}
              onChange={(v) => update("goals", v)}
              error={errors.goals}
            />
          )}
          {step === 3 && (
            <IntakeChoices
              name="challenges"
              label="What is getting in the way?"
              options={careerChallenges}
              value={draft.challenges}
              onChange={(v) => update("challenges", v)}
              error={errors.challenges}
            />
          )}
          {step === 4 && (
            <IntakeChoices
              name="efforts"
              label="What have you already tried?"
              options={careerEfforts}
              value={draft.efforts}
              onChange={(v) => update("efforts", v)}
              error={errors.efforts}
            />
          )}
          {step === 5 && (
            <CareerField
              {...fieldProps}
              name="success"
              label="If your job search went well over the next 3–6 months, what would you ideally accomplish?"
              multiline
              maxLength={1000}
            />
          )}
          {step === 6 && (
            <CareerField
              {...fieldProps}
              name="timeline"
              label="When are you looking to get started?"
              options={careerTimelines}
            />
          )}
          {step === 7 && (
            <>
              <CareerField
                {...fieldProps}
                name="context"
                label="Is there anything else about your experience or job search that would help us understand your situation?"
                multiline
                maxLength={1000}
                optional
              />
              <p className="field-help">
                You can share your resume after we review your diagnostic.
              </p>
              <h3>Review your answers</h3>
              <dl className="review">
                {Object.entries(draft)
                  .filter(([k]) => !["consent", "context"].includes(k))
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>
                        {(
                          {
                            firstName: "First name",
                            lastName: "Last name",
                            success: "3–6 month goal",
                          } as Record<string, string>
                        )[key] || key}
                      </dt>
                      <dd>
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value || "Not provided")}
                      </dd>
                    </div>
                  ))}
              </dl>
              <label className="consent">
                <input
                  id="consent"
                  type="checkbox"
                  checked={draft.consent}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={
                    errors.consent ? "consent-error" : undefined
                  }
                  onChange={(e) => update("consent", e.target.checked)}
                />
                <span>
                  I agree that RSG may contact me about this inquiry. I have
                  read the{" "}
                  <Link
                    href="/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy (opens in a new tab)
                  </Link>
                  .
                </span>
              </label>
              {errors.consent && (
                <p className="field-error" id="consent-error">
                  {errors.consent}
                </p>
              )}
              <p className="privacy-note">
                Submitting does not create an engagement. RSG will review your
                responses and follow up regarding potential next steps.
              </p>
            </>
          )}
        </fieldset>
        {error && (
          <p role="alert" className="error-summary">
            {error}
          </p>
        )}
        <div className="form-actions">
          {step > 0 && (
            <button
              className="back-button"
              type="button"
              disabled={pending}
              onClick={() => {
                setStep((s) => s - 1);
                setErrors({});
                setError("");
              }}
            >
              ← Back
            </button>
          )}
          <button className="button" disabled={pending}>
            {pending
              ? "Sending…"
              : step === 7
                ? "Submit Career Diagnostic"
                : "Continue"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
      <p className="privacy-note">
        Your answers stay only in this tab until submitted. Leaving or
        refreshing clears your progress.
      </p>
    </div>
  );
}

