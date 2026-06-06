# MyFinalPlaybook

> **"Live Fully. Die Ready."** — ENDevo

A free mobile app by [ENDevo](https://endevo.life) that helps people take the first steps toward legacy readiness. Users answer 12 questions across 4 domains, receive a readiness score, and work through a personalized 7-day daily action plan.

---

## What it does

1. **Q12 Assessment** — 12 questions across Digital, Legal, Financial, and Physical domains
2. **Score + Band** — AT RISK / SOMEWHAT PREPARED / PREPARED, with domain breakdown
3. **7-Day Action Plan** — one actionable task per day, personalized to the user's weakest domain
4. **Habit loop** — daily push reminders, XP, streak tracking
5. **Upsell handoff** — Day 7 links to the Q40 deep-dive assessment on the ENDevo SaaS

This app is the **free funnel**. No payments are processed in-app. The paid Q40 assessment lives at [direct.enterprise.endevo.life](https://direct.enterprise.endevo.life).

---

## Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.76 + Expo SDK 52 |
| Navigation | Expo Router v4 (file-based) |
| Language | TypeScript (strict) |
| Storage | AsyncStorage (on-device, no backend) |
| CRM | GoHighLevel webhook |
| Analytics | PostHog (stubs — ready to wire) |
| Push | expo-notifications |

---

## Getting started

```bash
npm install
cp .env.example .env.local    # add your GHL webhook URL
npm start                      # scan QR with Expo Go
```

```bash
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run typecheck  # TypeScript check
npx jest           # run tests
```

---

## Project structure

```
app/
  _layout.tsx          Root navigator
  index.tsx            Welcome screen
  (quiz)/
    name.tsx           Name capture
    question.tsx       12-question quiz
    email.tsx          Email capture + GHL webhook
    results.tsx        Score + band + domain breakdown
  (plan)/
    plan.tsx           7-day plan overview
    day.tsx            Individual daily action screen
src/
  lib/
    engine.ts          Q12 scoring engine (locked)
    ghl.ts             GoHighLevel CRM webhook
    analytics.ts       PostHog event stubs
    notifications.ts   Push notification helpers
  hooks/
    useAssessmentStore.ts  AsyncStorage state (single source of truth)
  constants/
    theme.ts           Design system (colors, fonts, spacing)
docs/                  Product plans, roadmap, GHL workflow, payments architecture
```

---

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready. Never commit directly. |
| `feature/name` | New features — branch off main, open PR |
| `fix/name` | Bug fixes — branch off main, open PR |

---

## Environment variables

See [.env.example](.env.example) for all required vars.

| Variable | Required | Purpose |
|----------|----------|---------|
| `EXPO_PUBLIC_GHL_WEBHOOK_URL` | Yes | GoHighLevel contact upsert |
| `EXPO_PUBLIC_POSTHOG_KEY` | No | PostHog analytics (optional) |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | For builds | Expo Application Services |

---

## For developers

See [docs/junior-dev-guide.md](docs/junior-dev-guide.md) for a full onboarding guide covering persistence, the day screen, branch workflow, and what's locked vs safe to change.

**Engine is locked** — do not change questions, scoring, band thresholds, or action pool copy in `src/lib/engine.ts` without product owner sign-off.

---

## Product owner

Niki Weiss — [niki@finalplaybook.com](mailto:niki@finalplaybook.com)
