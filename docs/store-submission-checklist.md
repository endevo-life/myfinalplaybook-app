# Store Submission Checklist — MyFinalPlaybook

_Last updated: 2026-06-25_

This is the complete path from "code on my laptop" to "live in the stores."
It's split into **Android (Google Play)** and **iOS (Apple App Store)** because
they have different requirements. You're on **Windows**, which matters for iOS
(see note).

---

## 0. Do I need Expo? (read this first)

**EAS Build** is Expo's cloud service that compiles your React Native code into
the installable files the stores require (`.aab` for Android, `.ipa` for iOS).

| | Without EAS | With EAS (recommended) |
|---|---|---|
| **Android** | Install Android Studio + JDK locally, run `npx expo run:android --variant release`. Works on Windows. | Free Expo account, one command builds in the cloud. |
| **iOS** | **Impossible on Windows** — Apple builds require macOS + Xcode. | Free Expo account builds the `.ipa` in Expo's cloud (no Mac needed). |

**Bottom line:**
- Android-only → you *can* skip Expo, but EAS is much easier and free.
- iOS on Windows → **you need EAS** (or a Mac). No way around it.
- **Apple Developer Program ($99/yr) is required regardless** to publish to the App Store. This is Apple's fee, separate from Expo.

> Note: `.env.local` already contains `EXPO_PUBLIC_EAS_PROJECT_ID`, so an Expo
> project may already be linked. Run `eas whoami` to check if you're logged in.

---

## 1. One-time accounts & costs

| Account | Cost | Needed for |
|---|---|---|
| Google Play Console | $25 one-time | Android ✅ (you have this) |
| Apple Developer Program | $99/year | iOS |
| Expo (expo.dev) | Free | EAS cloud builds (both platforms) |

---

## 2. Pre-flight: clean up the project (do this once, before any build)

```bash
# Align dependency versions with Expo SDK 52 (fixes the expo-doctor warnings)
npx expo install --check

# Confirm config resolves and assets exist
npx expo config --type public
npx expo-doctor
```

Optional cleanup (not blocking):
- `jspdf` is in package.json but unused (PDFs now use `expo-print`). Safe to remove: `npm uninstall jspdf`.
- `expo-av` shows "unmaintained" — still works; replace with `expo-video` only if you hit issues.

---

## 3. Install & log into EAS

```bash
npm install -g eas-cli      # or use: npx eas-cli@latest <command>
eas login                   # log into your Expo account (interactive — you type it)
eas whoami                  # confirm you're logged in
eas build:configure         # links the project, fills in eas.json (already present)
```

---

## 4. ANDROID — Google Play

### Build
```bash
eas build --platform android --profile production
```
This produces an **`.aab`** (Android App Bundle). Download link appears when done.

### First-time Play Console setup
1. Go to https://play.google.com/console → **Create app**.
2. App name: **My Final Playbook** · Default language · Free · App (not game).
3. Complete these required sections (Play won't let you publish until all are green):
   - [ ] **App access** — if any content is behind login, give test credentials (your quiz is open, so "all functionality available without restrictions").
   - [ ] **Ads** — declare whether the app shows ads (No).
   - [ ] **Content rating** — fill the questionnaire (this app = Everyone / low).
   - [ ] **Target audience** — adults; **not** directed at children.
   - [ ] **Data safety** — declare what you collect. **You collect email** (sent to GoHighLevel) and analytics → disclose: Email address, App activity. Mark whether it's encrypted in transit (yes) and if users can request deletion.
   - [ ] **Privacy policy URL** — **REQUIRED**. You must host one (see §6).
4. **Store listing:**
   - [ ] Short description (≤80 chars)
   - [ ] Full description (≤4000 chars)
   - [ ] App icon (512×512 PNG — I can generate from jesse.png)
   - [ ] Feature graphic (1024×500)
   - [ ] Phone screenshots (min 2, up to 8 — 1080×1920 or similar)
5. Upload the `.aab` under **Production → Create release** (or **Internal testing** first — recommended).
6. Submit for review (Google review: hours to a few days).

### Or submit via EAS
```bash
eas submit --platform android --profile production
# needs a Google service-account JSON key — Play Console → Setup → API access
```

---

## 5. iOS — Apple App Store

> Requires the $99/yr Apple Developer account. On Windows, EAS does the build.

### Build
```bash
eas build --platform ios --profile production
# First run asks for your Apple ID — EAS manages signing certs & provisioning for you.
```
Produces an **`.ipa`**.

### App Store Connect setup
1. https://appstoreconnect.apple.com → **My Apps → +** → New App.
2. Bundle ID: **endevo.life.finalplaybook** (must match app.json — it does).
3. Required:
   - [ ] **Privacy policy URL** (same as Android — REQUIRED)
   - [ ] **App privacy** questionnaire (email collection, analytics — same disclosures as Play Data Safety)
   - [ ] **Age rating** questionnaire
   - [ ] **Screenshots** — 6.7" (1290×2796) **and** 6.5" (1242×2688) iPhone sizes required
   - [ ] App icon is pulled from the build (1024×1024 — already in assets/icon.png ✅)
   - [ ] Description, keywords, support URL, marketing URL
4. Submit via EAS:
   ```bash
   eas submit --platform ios --profile production
   ```
5. Apple review: typically 1–3 days. They reject more aggressively than Google — common catches: broken links, missing privacy policy, placeholder content.

---

## 6. Privacy policy — REQUIRED by BOTH stores (do not skip)

Both stores reject apps without a hosted privacy-policy URL. Because this app
**captures email and fires it to GoHighLevel** + runs analytics, you legally
need one. Options:
- Host a page at endevo.life/privacy (preferred — on-brand).
- Or a free generator (e.g. termly, freeprivacypolicy) and host the link.

Must disclose: email collection, how it's used (CRM/marketing), analytics,
and how users can request deletion.

---

## 7. Screenshots & graphics — what I can generate for you

I can produce from your existing assets:
- [ ] Android 512×512 icon, 1024×500 feature graphic
- [ ] Device-frame screenshots of welcome / quiz / results / PDF screens (run the app, capture, frame)

Just ask and I'll generate them.

---

## Quick status (as of this checklist)

- ✅ App icon (1024², no-alpha, Apple-safe)
- ✅ Adaptive icon, splash (teal Jesse), skull notification icon
- ✅ app.json has bundleIdentifier, package, buildNumber, versionCode
- ✅ eas.json present (production + submit profiles)
- ✅ Config resolves, PDF verified, typecheck clean
- ⬜ `npx expo install --check` to fix version drift
- ⬜ Expo login confirmed
- ⬜ Privacy policy hosted
- ⬜ Store listings + screenshots
- ⬜ Apple Developer account (for iOS)
