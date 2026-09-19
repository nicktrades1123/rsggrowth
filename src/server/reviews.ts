import { tokenSchema, type PublicReview } from "../lib/reviews.ts";
import { hash, type Database } from "./http.ts";
export type Invitation = {
  id: string;
  practice: "career" | "business";
  service: PublicReview["service"];
};
export async function findInvitation(db: Database, token: string) {
  if (!tokenSchema.safeParse(token).success) return null;
  return db
    .prepare(
      "SELECT id, practice, service FROM review_invitations WHERE token_hash = ? AND expires_at > ? AND used_at IS NULL AND revoked_at IS NULL",
    )
    .bind(await hash(token), Date.now())
    .first<Invitation>();
}
export const publicReviewSql = `SELECT r.id, i.practice, i.service, r.rating,
  r.original_response1 AS response1, r.original_response2 AS response2,
  r.outcome, r.public_name AS publicName, r.job_title AS jobTitle, r.industry
  FROM reviews r JOIN review_invitations i ON i.id = r.invitation_id
  WHERE r.status = 'approved' AND r.consent = 1 AND i.revoked_at IS NULL
  AND i.practice = ? AND (? = '' OR i.service = ?)
  ORDER BY r.approved_at DESC, r.id LIMIT 12`;

