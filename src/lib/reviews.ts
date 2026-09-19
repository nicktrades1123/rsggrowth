import { z } from "zod";
import { services, serviceKeys, outcomes } from "./review-options.ts";
export { services, serviceKeys, outcomes } from "./review-options.ts";
export const classification = z
  .object({
    practice: z.enum(["career", "business"]),
    service: z.enum(serviceKeys),
  })
  .refine(
    (d) =>
      d.service === "other" ||
      (d.practice === "career"
        ? serviceKeys.slice(0, 4).includes(d.service)
        : serviceKeys.slice(4, 9).includes(d.service)),
    { message: "Choose a service within the selected practice." },
  );
export const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
const optional = (max: number) => z.string().trim().max(max).default("");
export const reviewSchema = z
  .object({
    rating: z.number().int().min(1, "Choose a rating.").max(5),
    response1: z.string().trim().min(1, "Please share what changed.").max(800),
    response2: z
      .string()
      .trim()
      .min(1, "Please share your experience.")
      .max(800),
    outcome: z.union([z.enum(outcomes), z.literal("")]).default(""),
    identity: z.enum(["first_initial", "first", "anonymous"]),
    firstName: optional(60),
    lastInitial: z
      .string()
      .trim()
      .regex(/^\p{L}?$/u, "Enter only one initial.")
      .default(""),
    jobTitle: optional(100),
    industry: optional(100),
    consent: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (d.identity !== "anonymous" && !d.firstName)
      ctx.addIssue({
        code: "custom",
        path: ["firstName"],
        message: "Enter the first name you want displayed.",
      });
    if (d.identity === "first_initial" && !d.lastInitial)
      ctx.addIssue({
        code: "custom",
        path: ["lastInitial"],
        message: "Enter your last initial.",
      });
  });
export const reviewSubmissionSchema = z.object({
  token: tokenSchema,
  review: reviewSchema,
  website: z.literal("").optional(),
});
export type ReviewInput = z.input<typeof reviewSchema>;
export type PublicReview = {
  id: string;
  practice: "career" | "business";
  service: keyof typeof services;
  rating: number;
  response1: string;
  response2: string;
  outcome: string;
  publicName: string;
  jobTitle: string;
  industry: string;
};

