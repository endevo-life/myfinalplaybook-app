# Q12 Mobile → Q40 Upsell Workflow (GHL)

## Purpose
Define the GHL tags, triggers, and message sequences that turn free Q12 app users into paid Q40 buyers — and re-engage the existing 197 users. The app sends events; GHL turns them into tagged contacts and automated email + push sequences.

## Principle: the daily actions are the marketing
Do not pitch paid early. The free 7-day plan builds trust and proves value. The upgrade ask lands at Day 7, when the user has felt a result. Everything before that is value delivery.

---

## Tags (set by app events via webhook)
| Tag | Set when |
|-----|----------|
| `q12_started` | `assessment_started` |
| `q12_completed` | `assessment_completed` |
| `band_low` / `band_mid` / `band_high` | from `band` on completion |
| `weakest_<domain>` | from `weakest_domain` on completion |
| `email_captured` | `email_captured` with marketing consent |
| `engaged_plan` | reached `day_completed` ≥ 4 |
| `plan_completed` | `plan_completed` |
| `dormant` | no `day_opened` for 3+ days mid-plan |
| `upgrade_interested` | `upgrade_clicked` |
| `q40_customer` | `purchase_completed` for a Q40 product |
| `winback_197` | imported from the existing user list |

Carry `band` and `weakest_domain` as contact fields too, so email copy can be personalized ("Your weakest area was {{weakest_domain}}").

---

## Lifecycle sequences

### Sequence A — Onboarding & value (Day 0–6)
Goal: deliver wins, build the habit. No selling.
- **Day 0 (instant):** "Here's your result and your Day 1 action." Email + push.
- **Days 2–6 (daily):** one push per day linked to that day's action (deep link). One light email mid-week if no app open in 24h.
- Trigger: `email_captured`. Exit if `dormant` (move to Sequence C).

### Sequence B — Soft pitch → offer (Day 7+)
Goal: convert engaged users to Q40.
- **Day 7 — summary + soft pitch:** "You've completed the basics. The 40-question assessment shows your full picture in {{weakest_domain}} and 5 more areas." CTA → paywall.
- **Day 8 — value framing:** what Q40 unlocks vs the free Q12 (depth, full domain breakdown, the deep-dive PDFs).
- **Day 10 — launch offer:** time-limited price or bonus PDF. Strongest CTA.
- **Day 13 — last call:** offer ends. Final nudge.
- Trigger: `plan_completed` OR `engaged_plan`. Exit immediately on `q40_customer`.

### Sequence C — Win-back (dormant free users)
Goal: re-open the loop before pitching paid.
- **+1 day dormant:** "Your next action is waiting — 2 minutes." Push + email, deep link to the exact day.
- **+4 days:** quick-win reminder, lower the bar.
- **+10 days:** soft re-introduction, then route back into Sequence B if they re-engage.
- Trigger: `dormant`. Exit on any `day_opened`.

### Sequence D — Re-engage the 197 existing users
Goal: bring prior users into the app and the new offer.
- **Email 1:** "Q12 is now an app — get one action a day on your phone." Link to install.
- **Email 2:** quick first win, easy resume path (no long re-onboarding).
- **Email 3:** introduce Q40 as the deeper next step.
- Trigger: `winback_197`. Move into Sequence A/B based on app behavior once they install.

### Sequence E — Post-purchase (new Q40 customers)
Goal: deliver, retain, set up the next offer.
- **Instant:** access confirmation + how to start Q40.
- **After `q40_completed`:** results recap + relevant deep-dive PDF or coaching call CTA (`book_call_clicked`).
- Trigger: `q40_customer`. Suppress all upsell sequences.

---

## Segmentation rules
- Personalize by `weakest_domain` and `band` in every Q40 pitch.
- `band_high` users → frame Q40 as "go deeper / optimize." `band_low` users → frame as "fix the foundation."
- Never send a paid pitch to `q40_customer`. Always suppress on purchase.
- Combine **push + email** for time-sensitive steps (Day 7, offer deadline); email-only for longer-form value.

## Email copy guardrails
- Use "Band" (not "tier") for score language in any user-facing copy.
- Use "people / families / adults" — not "Americans."
- Every email: one clear CTA, deep link into the app where possible.

## What the app must send for this to work
See [q12-mobile-monetization-events.md](q12-mobile-monetization-events.md) for the event list. The minimum GHL needs: `assessment_completed` (with `band` + `weakest_domain`), `email_captured`, `plan_completed`, `upgrade_clicked`, `purchase_completed`, and a dormancy signal. Purchase fulfillment and access are handled by the entitlement system in [q12-mobile-payments-architecture.md](q12-mobile-payments-architecture.md).
