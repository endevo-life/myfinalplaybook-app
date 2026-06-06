# Q12 Mobile Monetization Event Taxonomy

## Purpose
A single, shared list of the events the app sends to analytics and GHL. Tracking these from day one means the data already exists when the paid Q40 launches. Without it, you launch paid with no baseline and no way to measure conversion.

## How tracking works (the identity model)
1. On first app open, generate an **anonymous ID** and start sending events immediately — before any email exists.
2. When the user gives their email, call `identify(email)` so all earlier anonymous events **merge** onto that person. You keep the full pre-signup history.
3. Mirror the contact and key events into **GHL** through the existing webhook so workflows can fire.

Use one analytics layer (PostHog or Firebase recommended for the free tier) plus GHL for CRM and messaging.

## Naming conventions
- Event names: lowercase, `snake_case`, verb-based. Example: `assessment_completed`.
- Properties: `snake_case`. Keep values short and stable.
- Always attach: `anonymous_id`, `email` (once known), `platform` (ios | android), `app_version`, `timestamp`.
- Never put personally identifying data in the event *name*. Keep it in properties.

---

## Core engagement events (track now)
| Event | When it fires | Key properties |
|-------|---------------|----------------|
| `app_opened` | App launches or returns to foreground | `source` (cold, push, deep_link) |
| `assessment_started` | User answers question 1 | — |
| `question_answered` | Each question answered | `question_number`, `answer_value` |
| `assessment_completed` | All 12 answered | `score`, `band`, `weakest_domain` |
| `email_captured` | Email submitted | `consent_marketing` (true/false), `source_screen` |
| `result_viewed` | Results screen shown | `score`, `band`, `weakest_domain` |
| `day_opened` | A daily action card is opened | `day_number` (1–7) |
| `day_completed` | Daily action marked done | `day_number` |
| `plan_completed` | Day 7 finished | `days_completed_count` |
| `reminder_opened` | App opened from a push reminder | `day_number`, `notification_id` |
| `pdf_exported` | Optional PDF export used | `document_type` |
| `book_call_clicked` | Book-a-call CTA tapped | `placement` |

## Monetization events (add now, before paid launch)
| Event | When it fires | Key properties |
|-------|---------------|----------------|
| `upgrade_prompt_shown` | Any upsell message displayed | `placement`, `offer_id` |
| `upgrade_clicked` | User taps an upgrade CTA | `placement`, `offer_id` |
| `paywall_viewed` | Paywall / pricing screen shown | `offer_id`, `price`, `currency` |
| `purchase_started` | Checkout begins (IAP or web) | `product_id`, `channel` (iap_ios, iap_android, web_stripe) |
| `purchase_completed` | Payment confirmed | `product_id`, `channel`, `amount`, `currency`, `order_id` |
| `purchase_failed` | Payment failed or cancelled | `product_id`, `channel`, `reason` |
| `purchase_restored` | Existing purchase restored | `product_id`, `channel` |
| `entitlement_granted` | Server unlocks paid access | `product_id`, `channel` |
| `q40_started` | User begins the 40-question assessment | — |
| `q40_completed` | Q40 finished | `score`, `band`, `weakest_domain` |
| `digital_product_viewed` | A paid PDF / resource detail viewed | `product_id` |
| `digital_product_unlocked` | Paid resource opened after purchase | `product_id` |

## Property reference values
- `placement`: `day7_summary`, `result_screen`, `email`, `push`, `home_banner`, `dormant_winback`.
- `channel`: `iap_ios`, `iap_android`, `web_stripe`.
- `offer_id` / `product_id`: stable SKUs, e.g. `q40_unlock`, `q40_sub_monthly`, `pdf_deep_dive_finance`.
- `band`: the score band label (do not use the word "tier" in any user-facing surface; "band" here is an internal property value).

## Funnels to build once data flows
1. **Activation:** `assessment_started` → `assessment_completed` → `email_captured` → `day_opened (1)`.
2. **Engagement:** `day_completed (1)` → ... → `plan_completed`.
3. **Monetization:** `upgrade_prompt_shown` → `upgrade_clicked` → `paywall_viewed` → `purchase_completed`.
4. **Q40 value:** `purchase_completed` → `q40_started` → `q40_completed`.

## What to send to GHL
You do not need every event in GHL — only the ones that drive messaging and tagging:
- `assessment_completed` (carry `band` + `weakest_domain` for segmentation)
- `email_captured` (creates / updates the contact)
- `plan_completed`
- `upgrade_clicked`
- `purchase_completed`
- Engagement-drop signal (no `day_opened` for N days — derived in GHL or analytics)

See [q12-mobile-ghl-upsell-workflow.md](q12-mobile-ghl-upsell-workflow.md) for how these map to tags and workflows, and [q12-mobile-payments-architecture.md](q12-mobile-payments-architecture.md) for how purchase events tie to entitlements.
