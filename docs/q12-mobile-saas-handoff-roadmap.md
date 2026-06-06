# Q12 Mobile → Q40 SaaS Handoff Roadmap

## The decision
Q40 (the 40-question assessment), the personalized project plan, and the course / learning modules **live in the SaaS web app** (`direct.enterprise.endevo.life`, React + AWS). The mobile app does **not** rebuild them natively.

- **Mobile app = free top-of-funnel.** Q12 + daily actions + email capture + push. Its job is acquisition, habit, and handing a warm, high-intent user to the SaaS.
- **SaaS web = the paid destination.** Q40 + project plan + courses, with persistent accounts on AWS.

## Why route to SaaS instead of building Q40 in-app
- **No duplicate build.** Rebuilding Q40 + project plan + learning modules in React Native means maintaining the same complex product twice. Reuse the SaaS that already exists.
- **Full margin.** Selling on the web (Stripe) avoids the Apple/Google 15–30% in-app cut on digital goods.
- **Depth belongs on web.** Courses and learning modules are not a good fit squeezed into a phone-native rebuild; the SaaS + AWS is already designed for them.
- **Faster to paid.** The SaaS already exists, so paid launch is not blocked on a native rebuild.
- **One source of truth.** Q40 logic and the project-plan generator are maintained once.

## The model
```
FREE (mobile app)                    PAID (SaaS web)
─────────────────                    ──────────────────────────
Q12 assessment           ──upgrade──▶ Q40 assessment
7-day daily actions                   Personalized project plan
Push reminders                        Course / learning modules
Email capture                         (React + AWS, persistent accounts)
        │                                      ▲
        └──── GHL email/push nurture ──────────┘
              drives signups to SaaS
```

## The handoff
When a user upgrades, the app deep-links to the SaaS carrying their context (email, score `band`, `weakest_domain`) so they land in a **pre-personalized** Q40 — not a cold signup. The shared `email` keeps analytics identity, GHL contact, and SaaS account unified.

## Roadmap

### Phase 0 — SaaS refinement (in parallel, now)
Finish Q40 + project plan + course modules on the web app. This is the paid engine; it must be solid before traffic is pointed at it.

### Phase 1 — Free mobile app ships
Q12 + daily actions + tracking + email capture. Pure acquisition. **No payments in the app** → no App Store rejection risk, fast approval.

### Phase 2 — Connect the funnel
GHL sequences (the Day 7+ pitch) drive users to buy Q40 on the SaaS via Stripe. Mobile deep-links out with user context.

### Phase 3 — Unified login
A paid SaaS user can log into the mobile app; an entitlement check tells the app they're a customer, so it suppresses upsells and can show Q40 status / reminders. Shared account = same email.

### Phase 4 — Optional in-app convenience
*If* data shows iOS users drop at the app→web handoff, add RevenueCat IAP as a second purchase path for impulse buyers (accept the ~30% as a convenience tax). Only if the data justifies it.

## iOS compliance (the one thing to get right)
Apple restricts steering users to outside payment from inside an iOS app. The clean, proven pattern (how Netflix / Spotify operate):
- The iOS app is **free** and does not sell digital goods.
- Users buy on the web and **log into the app to access** what they bought.
- In the US, post *Epic v. Apple*, the app may also link out to web purchase — usable but keep it understated on iOS. Android is lenient.

**Open decision — iOS purchase handling at launch (not yet locked):**
1. **Web-only, login to access** *(recommended default)* — app never sells; full margin; simplest.
2. **Web + US external link** — same, plus a discreet in-app link out to web purchase.
3. **Add RevenueCat IAP too** — also offer in-app purchase for convenience, accepting the 15–30% cut.

## What this means for the other docs
- [q12-mobile-payments-architecture.md](q12-mobile-payments-architecture.md): web Stripe (via SaaS) is the **primary** path; RevenueCat IAP drops to optional Phase 4. The **server-side entitlement flag** is the bridge between the SaaS purchase and the mobile app's "is this user paid?" check.
- [q12-mobile-ghl-upsell-workflow.md](q12-mobile-ghl-upsell-workflow.md): the upsell sequences stay valid — they now point at the SaaS Q40 instead of an in-app paywall.
- [q12-mobile-monetization-events.md](q12-mobile-monetization-events.md): `purchase_*` events now mostly fire from the web/SaaS side; the app still fires `upgrade_prompt_shown` / `upgrade_clicked` and reads entitlement state.
