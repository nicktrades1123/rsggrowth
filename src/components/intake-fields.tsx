"use client";

export function IntakeField({
  name,
  label,
  value,
  onChange,
  error,
  options,
  multiline,
  optional,
  maxLength = 100,
  type = "text",
  autoComplete,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options?: readonly string[];
  multiline?: boolean;
  optional?: boolean;
  maxLength?: number;
  type?: string;
  autoComplete?: string;
}) {
  const props = {
    id: name,
    name,
    value,
    required: !optional,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${name}-error` : undefined,
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => onChange(e.target.value),
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
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : multiline ? (
        <textarea {...props} maxLength={maxLength} rows={4} />
      ) : (
        <input
          {...props}
          type={type}
          maxLength={maxLength}
          autoComplete={autoComplete}
        />
      )}
      {error && (
        <p className="field-error" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
export function IntakeChoices({
  name,
  label,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  label: string;
  options: readonly string[];
  value: readonly string[];
  onChange: (value: string[]) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="field-label">{label}</legend>
      <p className="field-help">Select all that apply.</p>
      <div className="choice-grid">
        {options.map((option, i) => (
          <label className="choice" key={option}>
            <input
              id={i === 0 ? name : `${name}-${i}`}
              type="checkbox"
              checked={value.includes(option)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${name}-error` : undefined}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...value, option]
                    : value.filter((v) => v !== option),
                )
              }
            />
            {option}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
export function IntakeErrors({ errors }: { errors: Record<string, string> }) {
  if (!Object.keys(errors).length) return null;
  return (
    <div
      className="error-summary"
      role="alert"
      tabIndex={-1}
      id="intake-errors"
    >
      <strong>Please check these fields.</strong>
      <ul>
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>
            <a
              href={`#${field}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(field)?.focus();
              }}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

