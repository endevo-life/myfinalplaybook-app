# CLAUDE.md — ENDevo MyFinalPlaybook Mobile App

Project instructions for Claude Code. These override default behavior.

## What this is
**MyFinalPlaybook** — a React Native (Expo) mobile app for ENDevo / My Final Playbook (Niki Weiss, Product Owner). Users answer 12 questions across 4 domains (Digital, Legal, Financial, Physical), get a score + band + weakest domain, and work through a personalized 7-day daily action plan in-app. Brand tagline: **"Live Fully. Die Ready."**

This is the **free top-of-funnel** product. The paid Q40 assessment lives in the SaaS (`direct.enterprise.endevo.life`). This app's job: acquisition, habit loop, email capture, and handing warm users to the SaaS.

## Stack
- **Mobile:** Expo ~52 + React Native 0.76 + TypeScript. Expo Router v4 for file-based navigation.
- **State/Storage:** `@react-native-async-storage/async-storage` for persisted quiz progress.
- **CRM:** GoHighLevel inbound webhook (`src/lib/ghl.ts`).
- **Analytics:** Event stubs in `src/lib/analytics.ts` — wire to PostHog or Firebase.
- **Push notifications:** `expo-notifications` (`src/lib/notifications.ts`).
- **Bundle ID:** `endevo.life.finalplaybook` (iOS) / `endevo.life.finalplaybook` (Android).

## Commands
```bash
npm start          # Expo dev server (scan QR with Expo Go)
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run typecheck  # tsc --noEmit
```

## Project structure
```
app/                    ← Expo Router screens (file-based routing)
  _layout.tsx           ← Root navigator
  index.tsx             ← Welcome screen
  (quiz)/
    name.tsx            ← Name capture
    question.tsx        ← One-question-at-a-time quiz (all 12)
    email.tsx           ← Email capture + GHL webhook fire
    results.tsx         ← Score, band, domain breakdown
  (plan)/
    index.tsx           ← 7-day plan overview + progress
    day.tsx             ← Individual daily action screen
src/
  lib/
    engine.ts           ← Q12 scoring engine (LOCKED — see rules below)
    ghl.ts              ← GHL webhook
    analytics.ts        ← Event stubs
    notifications.ts    ← Push notification helpers
  hooks/
    useAssessmentStore.ts ← AsyncStorage-backed state
  constants/
    theme.ts            ← Colors, fonts, spacing
docs/                   ← Planning docs (roadmap, product plan, etc.)
```

## Architecture rules (locked)
- **100% deterministic. NO Claude API / NO AI generation.** All personalization comes from score calc, band assignment, weakness ranking, and the locked Action Pool. The "Jesse voice" is static band-specific copy via `getJesseWrapper()`. Do not introduce live LLM calls without explicit approval from Niki.
- **Tie-break order is critical:** Digital → Legal → Financial → Physical. Don't change it.
- **Engine copy is locked.** The canonical spec is `src/lib/engine.ts`. Do not change questions, options, points, action pool copy, or band thresholds without PO sign-off.
- **No payments in the app.** Q40 is sold on the web (Stripe). The app deep-links out; it does not process payments.

## Copy rules (user-facing) — STRICT
- **Never use "tier"** in user-facing copy. Use **"Band"**.
- **Never use "Americans."** Use "people", "adults", or "families".

## Env vars
See [.env.example](.env.example). Copy to `.env.local` (gitignored). Key var: `EXPO_PUBLIC_GHL_WEBHOOK_URL`.

## Git rules — STRICT
- **Do not commit or push without explicit approval** ("commit this" / "push").
- **Never add a Claude co-author trailer** or "Generated with Claude Code" to commits or PRs.

## Product direction (context)
- This app = free funnel. Q12 + daily actions + email capture + push reminders.
- **Q40** + project plan + courses live in the SaaS — not rebuilt here.
- Upgrade path: Day 7 screen shows upsell teaser → links to SaaS web → user logs in → entitlement unlocks Q40.
- See [docs/](docs/) for full product plans, GHL workflow, payments architecture, and monetization event taxonomy.
