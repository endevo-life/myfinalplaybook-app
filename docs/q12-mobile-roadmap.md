# Q12 Mobile App Roadmap

## Goal
Turn the current Q12 web quiz into a React Native app for iPhone and Android that can be published to the Apple App Store and Google Play Store.

## What stays the same
- The Q12 assessment logic.
- The 12-question flow.
- The 7-day action plan logic.
- The GHL workflow and email capture.
- The score bands and weakest-domain ranking.

## What changes in mobile
- Replace the PDF-first experience with an in-app daily action experience.
- Make the app one question per screen.
- Add push notifications and reminders.
- Track completion and return visits in the app.
- Keep PDF export as an optional backup, not the main delivery.

## Recommended stack
- Expo + React Native for the app.
- TypeScript for shared logic and safety.
- Existing Q12 engine logic reused where possible.
- GHL webhook for CRM and automation.
- Analytics tool for event tracking.

## Beginner-friendly roadmap

### Phase 1: Learn the basics
- Learn React Native screen structure.
- Learn Expo project setup.
- Learn navigation, forms, and basic state.
- Learn how app store builds work.

### Phase 2: Rebuild the core experience
- Build landing screen.
- Build quiz screen with one question at a time.
- Build results screen.
- Build daily action screen.
- Build capture and consent flow.

### Phase 3: Connect backend and tracking
- Reuse the scoring and plan logic.
- Send quiz completion and contact data to GHL.
- Add analytics events for every important user action.
- Add push notification registration.

### Phase 4: Retention and engagement
- Show one action per day.
- Add streaks or completion progress.
- Use reminders to bring users back.
- Add optional PDF export for people who want a printable version.

### Phase 5: Store launch
- Test on iPhone and Android devices.
- Prepare screenshots and store copy.
- Submit to TestFlight and Google internal testing.
- Fix store review issues.
- Publish.

## Suggested build order for a new developer
1. Set up Expo and run the app locally.
2. Build the quiz flow.
3. Add the scoring engine.
4. Add the results screen.
5. Add the daily action screen.
6. Add GHL webhook integration.
7. Add analytics.
8. Add push notifications.
9. Test on real phones.
10. Prepare store listing assets.
11. Publish.

## Effort estimate
- MVP: 3 to 6 weeks.
- Store-ready version with push and analytics: 6 to 10 weeks.
- Full polished version with deeper automation: 10 to 14+ weeks.

## Cost notes
- Apple Developer Program: $99 per year.
- Google Play Console: $25 one time.
- Expo can keep development costs low.
- Keep the first release simple to avoid unnecessary spend.
