# Google Play — Listing Copy + Data Safety Cheat-Sheet

_For MyFinalPlaybook. Hand this to whoever fills in Google Play Console.
Answers below match what the app actually does (verified against the code)._

> ⚠️ Two quick decisions to confirm before submitting (marked **[CONFIRM]**):
> 1. Is an **analytics provider (PostHog) actually enabled at launch?** In the
>    current code analytics is stubbed (not sending). If it's OFF at launch,
>    use the "analytics OFF" answers. If ON, use the "analytics ON" notes.
> 2. **App category** — recommended below.

---

# PART 1 — Store Listing Copy

### App name
```
My Final Playbook
```

### Short description (max 80 characters)
```
Get legacy-ready in 7 days. Free assessment + a personalized daily plan.
```
_(71 characters)_

Alternatives:
- `A free 7-day plan to get your affairs in order. Live Fully. Die Ready.` (70)
- `Free legacy readiness check + daily action plan. Live Fully. Die Ready.` (71)

### Full description (max 4000 characters)
```
Live Fully. Die Ready.

Most of us never get our affairs in order — not because we don't care, but because no one ever showed us where to start. My Final Playbook makes it simple.

In about 3 minutes, you'll answer 12 quick questions across the four areas that matter most:

• Digital — your phone, passwords, and online accounts
• Legal — wills, executors, and key documents
• Financial — accounts, beneficiaries, and access
• Physical — health wishes and important paperwork

You'll instantly get your Legacy Readiness Score, see exactly where your biggest gaps are, and receive a personalized 7-day action plan — one small, doable step each day. No jargon. No overwhelm. Just clear progress.

WHAT YOU GET
• A free 12-question assessment with your personal readiness score
• A clear breakdown of your 4 domains, weakest area first
• A 7-day plan with one focused action per day (most take 10–15 minutes)
• Daily reminders to keep your momentum going
• A branded PDF of your results and plan you can save or share

WHY IT MATTERS
When the unexpected happens, the people you love are left guessing — about your accounts, your wishes, and where everything is. A few hours of preparation now spares them weeks of stress later. My Final Playbook turns "I should really deal with that" into "done."

100% FREE. No account required to start. No credit card. Just answer 12 questions and get your plan.

Created by ENDevo — Plan. Protect. Peace.

This app is for educational purposes only and is not legal, financial, tax, or medical advice.
```

### Other listing fields
- **App category:** Lifestyle  **[CONFIRM — alternative: Health & Fitness]**
- **Tags / keywords:** estate planning, legacy, will, executor, end of life, preparedness, peace of mind
- **Contact email:** [SUPPORT EMAIL — e.g. support@endevo.life]
- **Website:** https://endevo.life
- **Privacy policy URL:** https://www.endevo.life/myfinalplaybook/app/privacy  ✅ **LIVE (verified 2026-06-30)**

---

# PART 2 — Data Safety Form (the ~15 questions)

Google Play Console → **App content → Data safety**. Copy these answers.

## Section A — Overview questions
| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (data is sent to our CRM over HTTPS) |
| Do you provide a way for users to request that their data is deleted? | **Yes** — via the privacy-policy contact email / unsubscribe. [CONFIRM the deletion process with Niki] |

## Section B — Data types collected
Declare these **collected** data types. For each: collected = **Yes**,
shared with third parties = **Yes** (we use GoHighLevel, a third-party CRM),
processing = not ephemeral, and mark **required** vs optional as noted.

### 1. Personal info → Email address
- Collected: **Yes** · Shared: **Yes** (GoHighLevel CRM)
- Purposes: **App functionality** (deliver results) + **Account management** + **Marketing/promotions** (only if user opts in)
- Required or optional: **Required** (needed to send results)

### 2. Personal info → Name
- Collected: **Yes** · Shared: **Yes** (GoHighLevel)
- Purposes: **App functionality** (personalize the plan)
- Required or optional: **Required**

### 3. App activity → Other user-generated content
_(This covers the assessment answers/scores sent to the CRM.)_
- Collected: **Yes** · Shared: **Yes** (GoHighLevel)
- Purposes: **App functionality** (generate & deliver the plan)
- Required or optional: **Required**

### 4. App activity → App interactions  **[ONLY IF ANALYTICS IS ON]**
- Collected: **Yes** · Shared: **[Yes if analytics provider is third-party, e.g. PostHog cloud]**
- Purposes: **Analytics**
- Required or optional: **Optional**
- ⚠️ **If analytics is OFF at launch (current code), do NOT declare this.**

## Section C — Data NOT collected (for your reference — declare "No")
The app does **not** collect any of these, so leave them unchecked:
- Location (precise or approximate) — **No**
- Financial info (payment info, purchase history) — **No** (no payments in app)
- Health & fitness data — **No**
- Photos / videos / audio files — **No**
- Contacts — **No**
- Calendar — **No**
- Files & docs — **No** (the PDF is saved by the user via the system dialog; the app doesn't read user files)
- Device or other IDs — **No** [CONFIRM — if analytics is ON, an analytics ID may apply]
- Messages (SMS, email content) — **No**
- Web browsing history — **No**

## Section D — Security practices
| Question | Answer |
|---|---|
| Is data encrypted in transit? | **Yes** |
| Can users request data deletion? | **Yes** |
| Committed to Google Play Families Policy? | **No** (app is for adults, not designed for children) |
| Independent security review? | **No** [unless one was done] |

---

# PART 3 — Other Play Console answers

## Content rating questionnaire
The app has no violence, sexual content, profanity, gambling, or drugs. It does
reference death/end-of-life planning in an educational, non-graphic way.
- Expected rating: **Everyone** (or PEGI 3 / equivalent)
- Answer "No" to all the violence/sexual/substance/gambling questions.
- If asked about "sensitive topics": it's educational end-of-life *planning*,
  not graphic content. [CONFIRM phrasing with Niki]

## Target audience & content
- Target age group: **18+ (adults)** — or 18+ recommended. **Do NOT** target children.
- "Is your app designed for children?" → **No**

## App access
- "Is any functionality restricted (login required)?" → **No** — the assessment
  is fully available without an account.

## Ads
- "Does your app contain ads?" → **No**

## Government / financial / health declarations
- Government app? → No
- Financial features? → No (educational only, not financial advice)
- Health app? → No (not a medical app)

---

# PART 4 — Quick submission order (recommended)
1. **Internal testing** track first — upload the `.aab`, add yourself as tester, install via the opt-in link, confirm it runs as a signed release.
2. Fill **Store listing** (Part 1) + upload icon (512), feature graphic (1024×500), and the 4 screenshots from `store-assets/`.
3. Fill **App content**: Privacy policy URL, Data safety (Part 2), Content rating (Part 3), Target audience, Ads, App access.
4. Move the release to **Production** → review → roll out.

---

## Placeholders for Niki to fill
- [SUPPORT EMAIL] — still needed (recommend support@endevo.life, must be a monitored inbox)
- ~~[Confirm: analytics ON or OFF at launch]~~ ✅ **RESOLVED: OFF** — analytics is stubbed in code (src/lib/analytics.ts only console.logs, sends nothing). Use the "analytics OFF" Data Safety answers; Device IDs = No.
- [Confirm: app category — Lifestyle vs Health & Fitness] — recommend **Lifestyle**
- [Confirm: data deletion process wording] — recommend: "Email hello@endevo.life to request deletion; unsubscribe link in any marketing email."
- ~~Privacy policy must be live~~ ✅ **LIVE + verified 2026-06-30:** https://www.endevo.life/myfinalplaybook/app/privacy
