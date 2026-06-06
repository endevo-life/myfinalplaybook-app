# Q12 Mobile Payments & Entitlement Architecture

## Purpose
Define how the paid Q40 assessment and digital products (PDFs) are sold in a way that is compliant with Apple and Google rules, keeps margins where possible, and works whether the user pays in-app or on the web.

## Architecture decision: Q40 lives in the SaaS, not the app
Q40, the personalized project plan, and the course / learning modules live in the **SaaS web app** (`direct.enterprise.endevo.life`). The mobile app is a free funnel that hands warm users to the SaaS — it does not rebuild Q40 natively. See [q12-mobile-saas-handoff-roadmap.md](q12-mobile-saas-handoff-roadmap.md) for the full rationale and phasing.

Consequence for payments: **web Stripe (via the SaaS) is the primary purchase path** (full margin). RevenueCat in-app purchase is an **optional Phase 4** convenience path, only if data shows iOS users drop at the app→web handoff. The server-side entitlement flag below is the bridge between the two.

---

## ⚠️ The rule that shapes everything
Apple App Store and Google Play **require their in-app purchase (IAP) systems for digital goods consumed inside the app**, and take **15–30%** (15% under the small-business program / first $1M of revenue).

You **cannot** use Stripe directly inside the app to sell the Q40 unlock or a PDF — Apple will reject it and Google restricts it.

What this means for each thing we sell:
| Item | Classification | Payment path |
|------|----------------|--------------|
| Q40 unlock (one-time) | Digital good, used in app | **IAP required** in-app; web Stripe allowed for web purchase |
| Q40 subscription | Digital good | **IAP required** in-app; web Stripe allowed for web purchase |
| Deep-dive PDFs | Digital good, delivered in app | **IAP required** in-app; or sell/deliver via web + email |
| Book a coaching call | Service consumed **outside** the app | External payment allowed (Stripe/GHL) — no IAP needed |

> Recent change: post *Epic v. Apple* in the US, apps may now link out to external web purchase. Android is more lenient. Treat external links as a margin optimization, not the default, and keep iOS in-app steering language careful.

---

## Recommended approach: two compliant payment paths, one source of truth

### Path 1 — Web purchase via Stripe + SaaS (PRIMARY)
- User buys Q40 on the SaaS web app (Stripe), GHL records the order.
- They log into the mobile app and Q40 access unlocks via their account entitlement.
- Avoids the 15–30% cut → full margin. Fits email-driven and desktop sales (Sequences B/D in the GHL doc) and the SaaS-handoff model.
- This is the default at launch.

### Path 2 — In-app purchase via RevenueCat (OPTIONAL, Phase 4)
- **RevenueCat** wraps Apple StoreKit + Google Play Billing in one SDK. Handles receipts, restore-purchases, cross-platform entitlements.
- Free up to ~$2.5k/mo revenue — fits the early stage.
- Standard choice for Expo / React Native.
- Add only if data shows iOS users drop at the app→web handoff and the convenience is worth the cut.

### The unifier: a server-side entitlement flag
Do **not** unlock purely on-device. Keep a server record per account:

```
account
 ├─ id
 ├─ email
 ├─ entitlements: { q40_access: bool, expires_at, source }
 └─ purchase_history: [ { product_id, channel, order_id, amount, ts } ]
```

The app simply asks the server: **"Does this account have `q40_access`?"** It does not care whether they paid via Apple, Google, or web. This:
- Lets web and in-app purchases unlock the same content.
- Survives reinstalls and device switches.
- Fits the plan that **Q40 is database-backed** (unlike stateless Q12 / Q4), which a paid product needs anyway for accounts and purchase history.

---

## Purchase flow (in-app)
1. User taps upgrade → `paywall_viewed`.
2. RevenueCat presents the native purchase sheet → `purchase_started`.
3. Apple/Google confirm payment → RevenueCat webhook hits our server.
4. Server verifies the receipt, writes `entitlements.q40_access = true` → `entitlement_granted`.
5. Server notifies GHL (`purchase_completed`, tag `q40_customer`) → Sequence E fires.
6. App re-checks entitlement → Q40 unlocks.

## Purchase flow (web)
1. User buys on website (Stripe checkout from a GHL email link).
2. Stripe webhook → server writes the same `entitlements.q40_access = true`.
3. GHL tags `q40_customer`, suppresses upsell sequences.
4. User opens app, logs in, entitlement check unlocks Q40.

---

## Identity & accounts
- Free Q12 tier can stay **email + magic link** (low friction).
- Paid Q40 needs a **real account** so entitlements persist and purchases can be restored. Upgrade is the natural moment to ask the user to create/confirm an account.
- Tie the account to the same `email` already captured, so analytics identity and GHL contact stay unified (see [q12-mobile-monetization-events.md](q12-mobile-monetization-events.md)).

## Restore purchases
- Required by Apple: include a visible "Restore purchases" action. RevenueCat handles the mechanics.
- Web purchasers restore by logging in (entitlement is server-side).

## Security notes
- Always verify receipts **server-side** (via RevenueCat / Stripe webhooks). Never trust the client's claim of purchase.
- Idempotent webhook handling — the same purchase event may arrive more than once.
- Store `order_id` to de-duplicate and to support refunds (revoke entitlement on refund webhook).

---

## Phasing
1. **MVP:** Free Q12 app, anonymous tracking, email capture, entitlement table stubbed (everyone free). No payments in-app.
2. **Paid launch:** Web Stripe purchase on the SaaS + server entitlement + GHL purchase events. Q40 (on the SaaS) behind `q40_access`; mobile app reads the entitlement and unlocks the handoff / suppresses upsells.
3. **Catalog:** add deep-dive PDFs as additional products against the same entitlement model (sold on web, or delivered via email).
4. **Optional in-app convenience:** add RevenueCat IAP as a second purchase path *only if* data shows iOS users drop at the app→web handoff.

> Open decision — iOS purchase handling at launch is **not yet locked**: (1) web-only login-to-access *(recommended default)*, (2) web + US external link, or (3) add RevenueCat IAP too. See [q12-mobile-saas-handoff-roadmap.md](q12-mobile-saas-handoff-roadmap.md).

## Related docs
- Events: [q12-mobile-monetization-events.md](q12-mobile-monetization-events.md)
- Upsell messaging: [q12-mobile-ghl-upsell-workflow.md](q12-mobile-ghl-upsell-workflow.md)
- Product context: [q12-mobile-product-plan.md](q12-mobile-product-plan.md)
