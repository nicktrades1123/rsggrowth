import { z } from "zod";

export const experienceOptions = [
  "Less than 2 years",
  "2–5 years",
  "6–10 years",
  "11–15 years",
  "16+ years",
] as const;
export const careerGoals = [
  "Find a new job",
  "Move into a higher-paying role",
  "Move into management or leadership",
  "Change industries",
  "Change career paths",
  "Re-enter the workforce",
  "Improve my resume",
  "Improve my LinkedIn profile",
  "Get more interviews",
  "Improve interview performance",
  "Figure out what roles I should target",
  "Other",
] as const;
export const careerChallenges = [
  "I am not getting interviews",
  "I am unsure what roles fit my background",
  "My resume is not generating responses",
  "I struggle to explain my experience",
  "I am changing industries",
  "I have an employment gap",
  "My work history is complicated",
  "I do not have the formal title employers seem to want",
  "I do not have the education / credential employers seem to want",
  "I struggle in interviews",
  "I am unsure how to market transferable skills",
  "I have not started searching yet",
  "Other",
] as const;
export const careerEfforts = [
  "Updated my resume",
  "Applied through job boards",
  "LinkedIn Easy Apply",
  "Networking",
  "Recruiters",
  "Reached out directly to companies",
  "Interview coaching",
  "Resume service",
  "LinkedIn optimization",
  "Nothing yet",
  "Other",
] as const;
export const careerTimelines = [
  "Immediately",
  "Within 30 days",
  "1–3 months",
  "3–6 months",
  "I am exploring options",
] as const;
const text = (max: number) =>
  z.string().trim().min(1, "Please complete this field.").max(max);
const optional = (max: number) => z.string().trim().max(max).default("");
export const careerSchema = z.object({
  firstName: text(60),
  lastName: text(60),
  email: z.email("Enter a valid email address.").max(120),
  phone: optional(40),
  location: optional(100),
  title: text(100),
  industry: text(100),
  experience: z.enum(experienceOptions, {
    error: "Choose your experience range.",
  }),
  goals: z
    .array(z.enum(careerGoals))
    .min(1, "Choose at least one goal.")
    .max(careerGoals.length),
  challenges: z
    .array(z.enum(careerChallenges))
    .min(1, "Choose at least one challenge.")
    .max(careerChallenges.length),
  efforts: z
    .array(z.enum(careerEfforts))
    .min(1, "Choose what you have tried, or Nothing yet.")
    .max(careerEfforts.length),
  success: text(1000),
  timeline: z.enum(careerTimelines, { error: "Choose a timeframe." }),
  context: optional(1000),
  consent: z.literal(true, {
    error: "Confirm that RSG may contact you about your inquiry.",
  }),
});
export type CareerData = z.infer<typeof careerSchema>;
export type CareerDraft = Omit<
  CareerData,
  "experience" | "timeline" | "consent"
> & { experience: string; timeline: string; consent: boolean };
export const initialCareer: CareerDraft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  title: "",
  industry: "",
  experience: "",
  goals: [],
  challenges: [],
  efforts: [],
  success: "",
  timeline: "",
  context: "",
  consent: false,
};
export const careerSteps = [
  "Contact",
  "Current position",
  "Goals",
  "Challenges",
  "Prior efforts",
  "Success",
  "Timing",
  "Context & review",
];
export const careerStepFields: (keyof CareerDraft)[][] = [
  ["firstName", "lastName", "email", "phone", "location"],
  ["title", "industry", "experience"],
  ["goals"],
  ["challenges"],
  ["efforts"],
  ["success"],
  ["timeline"],
  ["context", "consent"],
];
export function validateCareerStep(draft: CareerDraft, step: number) {
  const parsed = careerSchema.safeParse(draft);
  const errors: Record<string, string> = {};
  if (!parsed.success)
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof CareerDraft;
      if (careerStepFields[step]?.includes(field))
        errors[field] ||= issue.message;
    }
  return errors;
}
export async function submitCareer(data: CareerData, requestId: string) {
  const response = await fetch("/api/career-diagnostic", {
    method: "POST",
    credentials: "same-origin",
    redirect: "error",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": requestId,
    },
    body: JSON.stringify(careerSchema.parse(data)),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      "Delivery could not be confirmed. Your answers are still here. Try again or email grow@rsggrowth.com.",
    );
  return z
    .object({
      status: z.literal("submitted"),
      receiptId: z.string().min(1).max(100),
    })
    .parse(await response.json());
}

