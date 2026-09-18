"use client";

import Link from "next/link";
import { createDiagnosticTracking } from "@/lib/analytics";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  diagnosticSchema,
  diagnosticSummary,
  initialDraft,
  priorities,
  stages,
  stepFields,
  submissionEnabled,
  submitDiagnostic,
  teamSizes,
  timelines,
  validateStep,
  type DiagnosticDraft,
  type DiagnosticResult,
  type FieldErrors,
  type FieldName,
} from "@/lib/diagnostic";

const stepLabels = ["Your business", "Your priorities", "Your goals", "Review"];
const stepTitles = [
  "First, a little about you.",
  "Where is your focus?",
  "What would you like to change?",
  "Review your diagnostic.",
];
const stepDescriptions = [
  "Introduce yourself and the business you’re building. All fields are required unless marked optional.",
  "Choose the context and capabilities that best fit your business.",
  "A short description is enough. Please don’t include confidential financial records or sensitive personal information.",
  "Check your answers before taking the next step. Use Back to make changes.",
];

function Field({
  name,
  label,
  draft,
  errors,
  update,
  options,
  multiline,
  optional,
  maxLength,
  type = "text",
  autoComplete,
}: {
  name: FieldName;
  label: string;
  draft: DiagnosticDraft;
  errors: FieldErrors;
  update: (key: FieldName, value: string) => void;
  options?: readonly string[];
  multiline?: boolean;
  optional?: boolean;
  maxLength?: number;
  type?: string;
  autoComplete?: string;
}) {
  const value = String(draft[name]);
  const props = {
    id: name,
    name,
    value,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby":
      [errors[name] ? `${name}-error` : "", multiline ? `${name}-hint` : ""]
        .filter(Boolean)
        .join(" ") || undefined,
    required: !optional,
    onChange: (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => update(name, event.target.value),
  };
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {optional ? " (optional)" : ""}
      </label>
      {options ? (
        <select {...props}>
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea {...props} maxLength={maxLength} rows={4} />
      ) : (
        <input
          {...props}
          type={type}
          autoComplete={autoComplete}
          maxLength={maxLength}
        />
      )}
      {multiline && (
        <p className="field-help" id={`${name}-hint`}>
          {value.length}/{maxLength} characters
        </p>
      )}
      {errors[name] && (
        <p className="field-error" id={`${name}-error`}>
          {errors[name]}
        </p>
      )}
    </div>
  );
}

export function DiagnosticForm() {
  const [draft, setDraft] = useState<DiagnosticDraft>(initialDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const focusErrors = useRef(false);
  const didMount = useRef(false);
  const locked = useRef(false);
  const requestId = useRef("");
  const analytics = useRef(createDiagnosticTracking());
  useEffect(() => {
    if (didMount.current) heading.current?.focus();
    else didMount.current = true;
  }, [step, result]);
  useEffect(() => {
    if (focusErrors.current && Object.keys(errors).length) {
      errorSummary.current?.focus();
      focusErrors.current = false;
    }
  }, [errors]);
  function update(key: FieldName, value: string | boolean | string[]) {
    analytics.current.start();
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setDeliveryError("");
    requestId.current = "";
  }
  async function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    const nextErrors = validateStep(draft, step);
    focusErrors.current = Object.keys(nextErrors).length > 0;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (step < 3) {
      analytics.current.advance(step + 2);
      setStep(step + 1);
      return;
    }
    const parsed = diagnosticSchema.safeParse(draft);
    if (!parsed.success) {
      const invalid = parsed.error.issues[0].path[0] as FieldName;
      setStep(stepFields.findIndex((fields) => fields.includes(invalid)));
      return;
    }
    locked.current = true;
    setPending(true);
    setDeliveryError("");
    try {
      requestId.current ||= crypto.randomUUID();
      const response = await submitDiagnostic(parsed.data, requestId.current);
      setResult(response);
      analytics.current.complete(response);
    } catch (error) {
      setDeliveryError(
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "Delivery couldn’t be confirmed in time. Your answers are still here. Try again or email grow@rsggrowth.com.",
      );
    } finally {
      locked.current = false;
      setPending(false);
    }
  }
  const common = { draft, errors, update };
  const summary = diagnosticSummary(draft);
  function downloadSummary() {
    const url = URL.createObjectURL(
      new Blob([summary], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "RSG-business-diagnostic.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (result)
    return (
      <div className="confirmation">
        <p className="eyebrow">
          {result.status === "submitted"
            ? "Diagnostic received"
            : "Ready for the next conversation"}
        </p>
        <h2 ref={heading} tabIndex={-1}>
          {result.status === "submitted"
            ? "Thank you for introducing your business."
            : "Your diagnostic is prepared."}
        </h2>
        {result.status === "submitted" ? (
          <>
            <p>
              RSG has received your diagnostic. We will review your responses
              and follow up regarding potential next steps. Keep a copy of your
              answers for your records.
            </p>
            <p className="field-help">Reference: {result.receiptId}</p>
          </>
        ) : (
          <>
            <p>
              <strong>It has not been sent to RSG.</strong> Open an email draft
              below, review it, and send it from your email app to
              grow@rsggrowth.com.
            </p>
            <p>
              If your email app doesn’t open or include all your answers,
              download the summary and attach it to an email.
            </p>
            <a
              className="button"
              href="mailto:grow@rsggrowth.com"
              onClick={(event) => {
                // Keep private answers out of the DOM link URL, which automatic
                // outbound-link measurement could otherwise collect.
                event.preventDefault();
                window.location.href = `mailto:grow@rsggrowth.com?subject=${encodeURIComponent("Business Diagnostic — " + draft.company)}&body=${encodeURIComponent(summary)}`;
              }}
            >
              Open email draft <span aria-hidden="true">↗</span>
            </a>
          </>
        )}
        <p>
          Once RSG receives your responses, we will review them and follow up
          regarding potential next steps. Submitting a diagnostic does not
          create a consulting engagement.
        </p>
        <div className="secondary-actions">
          <button
            type="button"
            className="link-button"
            onClick={downloadSummary}
          >
            Download my answers
          </button>
          {result.status === "prepared" && (
            <button
              type="button"
              className="link-button"
              onClick={() => setResult(null)}
            >
              Edit my answers
            </button>
          )}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setDraft(initialDraft);
              setStep(0);
              setResult(null);
              setErrors({});
              requestId.current = "";
              analytics.current = createDiagnosticTracking();
            }}
          >
            Clear and start again
          </button>
        </div>
        <details className="confirmation-details">
          <summary>View your answers</summary>
          <pre>{summary}</pre>
        </details>
        <p className="privacy-note">
          Your answers stay in this tab until you close or refresh it. Download
          a copy if you’d like to keep them.
        </p>
      </div>
    );

  return (
    <div className="diagnostic-shell">
      <div className="progress-meta">
        <span>Business Diagnostic</span>
        <span aria-live="polite">Step {step + 1} of 4</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Diagnostic progress"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={step + 1}
        aria-valuetext={`Step ${step + 1} of 4: ${stepLabels[step]}`}
      >
        <div
          className="progress-fill"
          style={{ width: `${(step + 1) * 25}%` }}
        />
      </div>
      <ol className="step-list">
        {stepLabels.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {label}
          </li>
        ))}
      </ol>
      <form noValidate onSubmit={next} aria-busy={pending}>
        <h2 ref={heading} tabIndex={-1} className="form-title">
          {stepTitles[step]}
        </h2>
        <p className="form-subtitle">{stepDescriptions[step]}</p>
        {Object.keys(errors).length > 0 && (
          <div
            ref={errorSummary}
            tabIndex={-1}
            role="alert"
            className="error-summary"
          >
            <strong>Please check the highlighted fields.</strong>
            <ul>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>
                  <a
                    href={`#${field}`}
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById(field)?.focus();
                    }}
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {step === 0 && (
          <div className="form-grid">
            <Field
              name="name"
              label="Your name"
              maxLength={80}
              autoComplete="name"
              {...common}
            />
            <Field
              name="email"
              label="Email address"
              type="email"
              maxLength={120}
              autoComplete="email"
              {...common}
            />
            <Field
              name="company"
              label="Business name"
              maxLength={100}
              autoComplete="organization"
              {...common}
            />
            <Field
              name="role"
              label="Your role"
              maxLength={80}
              autoComplete="organization-title"
              optional
              {...common}
            />
          </div>
        )}
        {step === 1 && (
          <>
            <Field
              name="stage"
              label="What stage is your business in?"
              options={stages}
              {...common}
            />
            <Field
              name="teamSize"
              label="How large is your team?"
              options={teamSizes}
              {...common}
            />
            <fieldset
              aria-describedby={
                errors.priorities ? "priorities-error" : "priorities-help"
              }
            >
              <legend className="field-label">
                Where would you like support?
              </legend>
              <p className="field-help mb-3" id="priorities-help">
                Select all that apply.
              </p>
              <div className="choice-grid">
                {priorities.map((priority, i) => (
                  <label className="choice" key={priority}>
                    <input
                      type="checkbox"
                      id={i === 0 ? "priorities" : `priority-${priority}`}
                      name="priorities"
                      value={priority}
                      aria-invalid={Boolean(errors.priorities)}
                      aria-describedby={
                        errors.priorities ? "priorities-error" : undefined
                      }
                      checked={draft.priorities.includes(priority)}
                      onChange={(e) =>
                        update(
                          "priorities",
                          e.target.checked
                            ? [...draft.priorities, priority]
                            : draft.priorities.filter((p) => p !== priority),
                        )
                      }
                    />
                    {priority}
                  </label>
                ))}
              </div>
              {errors.priorities && (
                <p id="priorities-error" className="field-error">
                  {errors.priorities}
                </p>
              )}
            </fieldset>
          </>
        )}
        {step === 2 && (
          <>
            <Field
              name="challenge"
              label="What is your main business challenge right now?"
              multiline
              maxLength={600}
              {...common}
            />
            <Field
              name="goal"
              label="What would you like to work toward?"
              multiline
              maxLength={400}
              {...common}
            />
            <Field
              name="timeline"
              label="When are you looking to get started?"
              options={timelines}
              {...common}
            />
          </>
        )}
        {step === 3 && (
          <>
            <dl className="review">
              {[
                ["Name", draft.name],
                ["Email", draft.email],
                ["Business", draft.company],
                ["Role", draft.role || "Not provided"],
                ["Stage", draft.stage],
                ["Team", draft.teamSize],
                ["Priorities", draft.priorities.join(", ")],
                ["Current challenge", draft.challenge],
                ["Desired outcome", draft.goal],
                ["Timeframe", draft.timeline],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <label className="consent">
              <input
                id="consent"
                type="checkbox"
                checked={draft.consent}
                onChange={(e) => update("consent", e.target.checked)}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "consent-error" : undefined}
              />
              <span>
                I agree that RSG may contact me about this inquiry. I have read
                the{" "}
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
              <p id="consent-error" className="field-error">
                {errors.consent}
              </p>
            )}
            <p className="privacy-note">
              {submissionEnabled
                ? "Submitting sends your answers to RSG for review. This does not establish an advisory relationship."
                : "Next, we’ll prepare your answers for an email to RSG. Nothing is sent automatically. You choose when to send the email."}
            </p>
          </>
        )}
        {deliveryError && (
          <div role="alert" className="error-summary">
            {deliveryError}
          </div>
        )}
        <div className="form-actions">
          {step > 0 && (
            <button
              type="button"
              className="back-button"
              disabled={pending}
              onClick={() => {
                setStep(step - 1);
                setErrors({});
                setDeliveryError("");
              }}
            >
              ← Back
            </button>
          )}
          <button className="button" type="submit" disabled={pending}>
            {pending
              ? "Sending…"
              : step < 3
                ? "Continue"
                : submissionEnabled
                  ? "Submit Business Diagnostic"
                  : "Prepare my diagnostic"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
      <p className="privacy-note">
        Your progress is kept only in this tab. Refreshing or leaving this page
        clears your answers.
      </p>
    </div>
  );
}
