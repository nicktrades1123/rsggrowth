# Content refinement

Preserve the existing navigation, responsive CSS, typography, colors, logo, images, and reusable components. Update Home, Who We Serve, About, Contact, What We Do framework introduction, and diagnostic introductory/confirmation copy. Reuse the editorial-list layout for six owner situations. Industry segments describe intended audiences and needs, not client experience or results.

## Submission architecture inspected before edits

The four-step React form holds answers in component memory. Zod validates each step and the full payload. Back navigation preserves answers; leaving or refreshing clears them. With NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED=false (the deployed configuration), submitDiagnostic returns prepared without a network request. The confirmation explicitly says answers have not been sent; visitors open a mailto draft and send it themselves or download a text summary. No browser storage or email credentials are used.

The disabled optional transport validates again, POSTs JSON to same-origin /api/diagnostic with an Idempotency-Key UUID and a 15-second timeout, rejects redirects/non-2xx/invalid receipts, and preserves answers on errors. Success requires status submitted and a receiptId. No production handler exists. See SUBMISSIONS.md for server requirements.

This refinement changes only form copy; fields, state transitions, validation, transport, public flag, and email/download behavior remain unchanged. Review/follow-up wording is conditional on RSG receiving the responses.
