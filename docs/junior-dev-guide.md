# Junior Developer Guide — MyFinalPlaybook

**For:** Junior mobile developer onboarding to this project
**Stack:** Expo ~52 + React Native 0.76 + TypeScript (strict) + Expo Router v4
**Brand:** "Live Fully. Die Ready." — ENDevo / My Final Playbook

---

## 1. Project Overview (Read First)

This is a **free funnel app**. Users answer 12 questions, get a readiness score, and work through a 7-day daily action plan. That's it. No backend, no auth, no payments, no AI.

The paid product (Q40 assessment) lives on a separate website. This app's job: get the user to complete 7 actions and then hand them off to the SaaS via a deep link.

---

## 2. Repo Setup

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Protected. Never commit directly. |
| `feature/your-feature-name` | New features. Branch off `main`. |
| `fix/short-description` | Bug fixes. Branch off `main`. |

**Always branch off `main`, never `master`.**

```bash
# Start any new piece of work like this:
git checkout main
git pull origin main
git checkout -b feature/step-persistence   # or fix/streak-display-bug
```

**Never push directly to `main`.** Open a PR. Get it reviewed.

**Never add a "Co-authored-by: Claude" trailer or "Generated with Claude Code" to commits.**

### First-time setup

```bash
git clone <repo-url>
cd FinalplaybookApp
npm install
cp .env.example .env.local     # fill in GHL webhook URL if you have it
npm start                       # Expo dev server — scan QR with Expo Go
```

---

## 3. Project Structure — What Lives Where

```
app/                     ← Screens (Expo Router file-based routing)
  _layout.tsx            ← Root navigator, font loading, redirect logic
  index.tsx              ← Welcome screen (video + CTA)
  (quiz)/
    name.tsx             ← Captures user's name
    question.tsx         ← One-at-a-time quiz (12 questions)
    email.tsx            ← Captures email, fires GHL webhook
    results.tsx          ← Score + band + domain breakdown
  (plan)/
    plan.tsx             ← 7-day plan overview (list of day cards)
    day.tsx              ← Individual day screen (steps + CTA)

src/
  lib/
    engine.ts            ← LOCKED. Q12 scoring, band assignment, plan builder
    ghl.ts               ← GoHighLevel webhook (CRM contact upsert)
    analytics.ts         ← Event stubs (wire to PostHog later)
    notifications.ts     ← Expo push notification helpers
  hooks/
    useAssessmentStore.ts← AsyncStorage state — the single source of truth
  constants/
    theme.ts             ← Colors, fonts, spacing, shadows
  components/
    JesseAvatar.tsx      ← Jesse character image with skeleton loader
    LoadingScreen.tsx    ← Splash/font loading
    Skeleton.tsx         ← Shimmer placeholder
    VideoPlayer.tsx      ← Expo AV video wrapper
```

**Rule of thumb:** if it's user-facing copy or scoring logic, it's probably in `engine.ts` and it's locked. Don't change it without the product owner's sign-off.

---

## 4. How Persistence Works

There is **no backend database**. Everything is stored on the user's device using `AsyncStorage`.

### The store hook: `useAssessmentStore`

File: [src/hooks/useAssessmentStore.ts](../src/hooks/useAssessmentStore.ts)

This hook is the **single source of truth** for all user data. Every screen that needs data reads from it. Nothing is passed through navigation params (except `day` number).

```typescript
const store = useAssessmentStore();

// What you get back:
store.result          // AssessmentResult | null  — scores, plan, band, domains
store.answers         // Answer[]                 — raw quiz answers
store.email           // string                   — user's email
store.name            // string                   — user's first name
store.completedDays   // number[]                 — e.g. [1, 2, 3]
store.loading         // boolean                  — true while AsyncStorage is reading
```

### AsyncStorage keys

| Key | Stores |
|-----|--------|
| `@mfp/result` | Full AssessmentResult (JSON) |
| `@mfp/answers` | Raw quiz answers (JSON) |
| `@mfp/email` | User email (string) |
| `@mfp/name` | User name (string) |
| `@mfp/completedDays` | Array of completed day numbers (JSON) |

### Always check `store.loading` before rendering

AsyncStorage reads are async. On app open, there's a brief moment where `store.loading === true` and all values are null/empty. If you render before it's done, you'll get a flash redirect or crash.

```typescript
// Correct pattern — used in day.tsx and plan.tsx
if (store.loading || !result) return null;
```

### How days get marked complete

```typescript
// In day.tsx — called when user taps "Complete Day X"
await store.markDayComplete(day);
// This appends the day number to completedDays in state AND AsyncStorage
// Survives app restarts
```

### How to reset everything (dev/testing)

```typescript
await store.reset();
// Clears all AsyncStorage keys + resets in-memory state
// Redirects to welcome screen automatically (plan.tsx has this logic)
```

---

## 5. The Day Screen — Deep Dive

File: [app/(plan)/day.tsx](../app/(plan)/day.tsx)

This is the most complex screen. Here's how it works top to bottom.

### Navigation to this screen

From the plan overview (`plan.tsx`), tapping a day card does:
```typescript
router.push({ pathname: "/day", params: { day: String(assignment.day) } });
```

The day screen receives `day` as a URL param and reads everything else from the store — **not from nav params**.

### Screen data flow

```
URL param: ?day=3
     ↓
store.result.plan[day - 1]     ← DayAssignment (title, domain, howTo, time)
store.completedDays            ← [1, 2] (which days are done)
getJesseWrapper(result)        ← Static motivational copy for each day
```

### The checklist steps

The `howTo` string in each action is parsed into individual steps by `parseSteps()`:

```typescript
// Input (from engine.ts ACTION_POOL):
"(1) Log into one retirement account. (2) Check beneficiary page. (3) Update or confirm."

// Output after parseSteps():
["Log into one retirement account", "Check beneficiary page", "Update or confirm"]
```

Steps are rendered as tappable check items. State is held in local component state — **step checks are NOT persisted**. They reset if the user leaves and comes back. This is intentional (they're a UI affordance, not tracked data).

### What IS persisted: day completion

When the user taps "Complete Day X":
1. `handleMarkDone()` fires
2. `store.markDayComplete(day)` writes to AsyncStorage
3. Day number added to `completedDays` — survives restarts
4. Analytics event fires (`analytics.dayCompleted(day)`)
5. Next day's push notification is scheduled
6. After 1.4s delay, redirects to plan overview

### Step check persistence — the current gap

Right now, `checkedSteps` is `useState<number[]>([])` — local only. If you need to persist which steps were checked within a day session, you'd add a new key to `useAssessmentStore`:

```typescript
// In useAssessmentStore.ts — example extension
const KEYS = {
  ...existing keys...
  stepProgress: "@mfp/stepProgress",  // { [day: number]: number[] }
};
```

But check with the product owner before adding this — it may be intentionally ephemeral.

---

## 6. The Plan Overview Screen

File: [app/(plan)/plan.tsx](../app/(plan)/plan.tsx)

This screen shows all 7 days as a list. Here's what to know:

- **Progress bar** at the top shows `completedDays.length / 7`
- **Day cards** show domain color, title, time, and a checkmark if done
- **Completed cards** get `opacity: 0.7` — still tappable (user can re-read a completed day)
- **Day 7 upsell** renders only when `doneCount === 7`
- **Redirect logic:** if `store.result` is null after loading, user is sent to welcome screen

---

## 7. Analytics — What's Wired (and What's Not)

File: [src/lib/analytics.ts](../src/lib/analytics.ts)

All event calls exist but fire into a no-op until PostHog is wired. Key events already called in the screens:

| Event | Called in | When |
|-------|-----------|------|
| `dayOpened(day)` | plan.tsx | User taps a day card |
| `dayCompleted(day)` | day.tsx | User taps "Complete Day" |
| `planCompleted(streak)` | day.tsx | Day 7 marked complete |
| `upgradeClicked(source, target)` | plan.tsx | User taps "Learn More" on Day 7 upsell |

To wire PostHog (when ready):
1. `npx expo install posthog-react-native`
2. Add `EXPO_PUBLIC_POSTHOG_KEY` to `.env.local`
3. Replace the stub body in `analytics.ts` with PostHog calls

---

## 8. Engine — What Is Locked

File: [src/lib/engine.ts](../src/lib/engine.ts)

**Do not change any of the following without product owner (Niki) sign-off:**
- The 12 questions and their answer options (`QUESTIONS`)
- Points assigned to each answer option
- Band thresholds: 0–11 = AT RISK, 12–19 = SOMEWHAT PREPARED, 20–24 = PREPARED
- Tie-break order for domains: Digital → Legal → Financial → Physical
- The action pool copy (`ACTION_POOL`) — all titles, socialProof, howTo strings
- Jesse's motivational copy (`getJesseWrapper`)

**Safe to change:**
- Anything in `theme.ts` (colors, spacing, fonts)
- Screen layout and component styles
- Animation timing/values
- Adding new analytics events

---

## 9. Copy Rules — Memorize These

These are non-negotiable brand rules:

| Never use | Use instead |
|-----------|-------------|
| "tier" | "Band" |
| "Americans" | "people", "adults", or "families" |

If you see either of those words in user-facing strings (not code), flag it.

---

## 10. Feature Branch Workflow — Step by Step

### Starting a feature

```bash
git checkout main
git pull origin main
git checkout -b feature/persist-step-checks
```

### During development

```bash
# Run the app
npm start

# Type-check (run this before every commit)
npm run typecheck

# Run tests
npx jest
```

### Committing

```bash
git add src/hooks/useAssessmentStore.ts app/(plan)/day.tsx
git commit -m "persist step checks per day in AsyncStorage"
# DO NOT add Claude co-author trailers
```

### Opening a PR

```bash
git push -u origin feature/persist-step-checks
# Then open PR on GitHub against main (not master)
```

**Get approval before merging.** Never self-merge.

---

## 11. Common Tasks — Quick Reference

### Add a new field to persistent storage

1. Add the key to `KEYS` in [useAssessmentStore.ts](../src/hooks/useAssessmentStore.ts)
2. Add state + loader in the `useEffect` block
3. Add a setter function
4. Export it from the `AssessmentStore` interface

### Add a new screen to the plan flow

1. Create `app/(plan)/my-screen.tsx`
2. Export a default React component
3. Navigate to it with `router.push("/my-screen")`
4. Expo Router picks it up automatically — no route registration needed

### Fix a bug on the day screen

Branch: `fix/short-description-of-bug`
File: [app/(plan)/day.tsx](../app/(plan)/day.tsx)

### Check what's in storage during development

Add this temporarily to any screen for debugging:
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
AsyncStorage.getAllKeys().then(keys => console.log(keys));
AsyncStorage.getItem("@mfp/completedDays").then(v => console.log(v));
```

Remove before committing.

---

## 12. What's Missing / Next Up

These are known gaps (from the tech stack evaluation) that will need to be built:

| Task | Why | Files to touch |
|------|-----|----------------|
| Wire PostHog analytics | Currently all events are no-ops | `src/lib/analytics.ts` |
| Add Sentry crash tracking | No visibility into crashes | `app/_layout.tsx` |
| Schedule push notifications from plan screen | Habit loop isn't wired | `app/(plan)/plan.tsx`, `src/lib/notifications.ts` |
| GHL webhook retry queue | Flaky connections silently drop contacts | `src/lib/ghl.ts`, `useAssessmentStore.ts` |
| Persist step checks across sessions (optional) | UX quality | `useAssessmentStore.ts`, `app/(plan)/day.tsx` |

Each of these is its own `feature/` branch. Do not combine them.

---

## 13. Questions?

- Product Owner: Niki Weiss — niki@finalplaybook.com
- Engine changes need PO sign-off before PR is opened
- UI/UX changes can be reviewed by any senior developer
