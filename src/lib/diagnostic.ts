import { z } from "zod";

export const stages = [
  "Building a foundation",
  "Managing growth",
  "Strengthening an established business",
  "Exploring a new direction",
] as const;
export const priorities = [
  "Strategy",
  "Finance",
  "Growth",
  "Execution",
] as const;
export const teamSizes = [
  "Just me",
  "2–10 people",
  "11–50 people",
  "51+ people",
] as const;
export const timelines = [
  "As soon as practical",
  "In the next 1–3 months",
  "In the next 3–6 months",
  "Just exploring",
] as const;
export const diagnosticSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name (at least 2 characters).")
    .max(80, "Use 80 characters or fewer."),
  email: z
    .email("Enter a valid email address.")
    .max(120, "Use 120 characters or fewer."),
  company: z
    .string()
    .trim()
    .min(2, "Enter your business name.")
    .max(100, "Use 100 characters or fewer."),
  role: z.string().trim().max(80, "Use 80 characters or fewer."),
  stage: z.enum(stages, { error: "Choose your business stage." }),
  teamSize: z.enum(teamSizes, { error: "Choose your team size." }),
  priorities: z
    .array(z.enum(priorities))
    .min(1, "Choose at least one priority.")
    .max(4),
  challenge: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(600, "Use 600 characters or fewer."),
  goal: z
    .string()
    .trim()
    .min(10, "Describe what you want to work toward (at least 10 characters).")
    .max(400, "Use 400 characters or fewer."),
  timeline: z.enum(timelines, { error: "Choose a timeframe." }),
  consent: z.literal(true, {
    error: "Please confirm that RSG may contact you about your inquiry.",
  }),
});
export type Diagnostic = z.infer<typeof diagnosticSchema>;
export type DiagnosticDraft = Omit<
  Diagnostic,
  "stage" | "teamSize" | "timeline" | "consent"
> & { stage: string; teamSize: string; timeline: string; consent: boolean };
export const initialDraft: DiagnosticDraft = {
  name: "",
  email: "",
  company: "",
  role: "",
  stage: "",
  teamSize: "",
  priorities: [],
  challenge: "",
  goal: "",
  timeline: "",
  consent: false,
};
export type FieldName = keyof DiagnosticDraft;
export type FieldErrors = Partial<Record<FieldName, string>>;
export const stepFields: FieldName[][] = [
  ["name", "email", "company", "role"],
  ["stage", "teamSize", "priorities"],
  ["challenge", "goal", "timeline"],
  ["consent"],
];
export function validateStep(
  draft: DiagnosticDraft,
  step: number,
): FieldErrors {
  const result = diagnosticSchema.safeParse(draft);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as FieldName;
    if (stepFields[step].includes(field) && !errors[field])
      errors[field] = issue.message;
  }
  return errors;
}
export function diagnosticSummary(data: DiagnosticDraft): string {
  return [
    "RSG Business Diagnostic",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Business: ${data.company}`,
    `Role: ${data.role || "Not provided"}`,
    `Stage: ${data.stage}`,
    `Team: ${data.teamSize}`,
    `Priorities: ${data.priorities.join(", ")}`,
    "",
    `Current challenge:\n${data.challenge}`,
    "",
    `Desired outcome:\n${data.goal}`,
    "",
    `Timeframe: ${data.timeline}`,
    "",
    "I agree that RSG may contact me about this inquiry.",
  ].join("\n");
}

// This public flag contains no secret. The endpoint must be implemented and
// independently secured before enabling it. See docs/SUBMISSIONS.md.
export const submissionEnabled =
  process.env.NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED === "true";
export type DiagnosticResult =
  { status: "prepared" } | { status: "submitted"; receiptId: string };
export async function submitDiagnostic(
  data: Diagnostic,
  requestId: string,
): Promise<DiagnosticResult> {
  const validated = diagnosticSchema.parse(data);
  if (!submissionEnabled) return { status: "prepared" };
  const response = await fetch("/api/diagnostic", {
    method: "POST",
    credentials: "same-origin",
    redirect: "error",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": requestId,
    },
    body: JSON.stringify(validated),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      "We couldn’t confirm delivery. Please try again or email grow@rsggrowth.com. Your answers are still here.",
    );
  const result = z
    .object({
      status: z.literal("submitted"),
      receiptId: z.string().min(1).max(100),
    })
    .safeParse(await response.json());
  if (!result.success)
    throw new Error(
      "We couldn’t confirm delivery. Your answers are still here. Please contact grow@rsggrowth.com.",
    );
  return result.data;
}
