# Google Play Submission — MyFinalPlaybook

_Status as of 2026-06-28. Android-first (iOS later)._

You're almost there. The app code is done, tested on a real Pixel 9, and the
EAS build is configured. This is the remaining path to a live Play Store listing.

---

## ✅ Already done
- App code complete + device-tested (PDF, quiz, video, responsive UI)
- All build assets present (icon, splash, adaptive icon, notification icon)
- `app.json`: package `endevo.life.finalplaybook`, versionCode 1, Kotlin pin via `expo-build-properties`
- `eas.json`: production profile builds an Android `.aab`
- EAS project linked (`projectId` in app.json, owner `helloendevos-team`)

## ⏳ In progress
- [ ] **Build the AAB** — `eas build --platform android --profile production`
  - Choose **Yes** to "Generate a new Android Keystore"
  - ⚠️ That keystore (held in your Expo account) signs ALL future updates. Don't lose access to the Expo account.
  - When done, download the `.aab` from the build URL.

---

## 1. Google Play Console — one-time setup
You have a Play Console account already. In https://play.google.com/console:

- [ ] **Create app** → name "My Final Playbook", language, **Free**, App (not game)
- [ ] Complete the **Dashboard setup tasks** (all must be green before publishing):
  - [ ] **App access** — quiz is fully open → "All functionality available without restrictions"
  - [ ] **Ads** — declare: **No ads**
  - [ ] **Content rating** — fill the questionnaire (this app = Everyone / low intensity)
  - [ ] **Target audience** — adults (18+ or 13+), **not** directed at children
  - [ ] **Data safety** — ⚠️ IMPORTANT, you DO collect data:
    - Collected: **Email address** (sent to GoHighLevel CRM), **App activity / analytics**
    - Encrypted in transit: **Yes**
    - Users can request deletion: declare your process
  - [ ] **Privacy policy URL** — **REQUIRED** (see §3)
  - [ ] **Government apps / Financial features** — No (it's educational, not financial advice)

## 2. Store listing (the public page)
- [ ] **Short description** (≤80 chars) — e.g. "Get legacy-ready in 7 days. Free assessment + daily action plan."
- [ ] **Full description** (≤4000 chars) — what the app does, the Q12 assessment, 7-day plan, "Live Fully. Die Ready."
- [ ] **App icon** — 512×512 PNG (I can generate from jesse.png)
- [ ] **Feature graphic** — 1024×500 (I can generate)
- [ ] **Phone screenshots** — min 2, up to 8. Sizes ~1080×1920+. (I can capture from your Pixel 9 / generate framed shots)
- [ ] (Optional) short promo video

## 3. Privacy policy — REQUIRED, do not skip
Because the app captures **email → GoHighLevel** + runs analytics, Play requires a
hosted privacy policy URL. Options:
- Host at **endevo.life/privacy** (preferred, on-brand)
- Or a free generator (termly / freeprivacypolicy) and host the link
Must disclose: email collection, CRM/marketing use, analytics, deletion process.

## 4. Upload & release
- [ ] **Testing track first (recommended):** Play Console → Testing → **Internal testing** → create release → upload the `.aab` → add yourself as a tester → install via the opt-in link. Confirms it works as a signed release before going public.
- [ ] **Production:** Play Console → Production → Create release → upload `.aab` → fill release notes → **Review & roll out**
- [ ] Submit for review (Google review: hours to a few days)

### Submitting via EAS (alternative to manual upload)
```
eas submit --platform android --profile production
```
Needs a Google Play **service-account JSON key** (Play Console → Setup → API access → create service account → grant release permissions → download JSON). One-time setup; after that EAS uploads for you.

---

## What I (Claude) can generate for you on request
- 512×512 Play icon + 1024×500 feature graphic (from jesse.png / logo)
- Framed phone screenshots of welcome / quiz / results / day screens
- Draft short + full store descriptions
- A starter privacy-policy text (you host it)

Just ask and I'll produce them.

---

## iOS / App Store (later)
Same app, but needs: Apple Developer account ($99/yr), `eas build --platform ios`,
App Store Connect listing, 6.7"+6.5" screenshots, and the same privacy disclosures.
Tackle after Android is live.
