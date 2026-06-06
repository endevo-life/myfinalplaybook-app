# Q12 Mobile Shareable Pack

## Purpose
This pack is the shareable team version of the Q12 mobile plan. It combines the roadmap, product decisions, and launch checklist into one document.

## 1. Roadmap
Turn the current Q12 web quiz into a React Native app for iPhone and Android.

- Keep the existing Q12 scoring and 7-day action logic.
- Reuse the GHL workflow and email capture.
- Replace the PDF-first delivery with an in-app daily action experience.
- Use Expo + React Native for the build.

### Build phases
1. Learn the basics of React Native and Expo.
2. Rebuild the landing, quiz, results, and capture screens.
3. Connect scoring, GHL, and analytics.
4. Add push notifications and daily reminders.
5. Test on real devices and publish.

### Effort estimate
- MVP: 3 to 6 weeks.
- Store-ready version: 6 to 10 weeks.
- Polished version: 10 to 14+ weeks.

## 2. Product decisions
The app should not rely on a long PDF as the core experience. On a phone, the best format is a daily action app.

### User flow
1. Start the quiz.
2. Answer one question at a time.
3. See score and weakest domain.
4. Get Day 1 immediately.
5. Come back daily for the next action.

### Engagement model
- Day 1: instant win.
- Days 2 to 6: one action per day.
- Day 7: summary and next-step CTA.
- Use reminders and push notifications to bring people back.

### Tracking
Track these events:
- Assessment started.
- Assessment completed.
- Email captured.
- Result viewed.
- Day opened.
- Day completed.
- Reminder opened.
- PDF exported.
- Book call clicked.

### Re-engaging the previous 197 users
- Announce the app as a simpler mobile experience.
- Promise one action per day.
- Give them a quick first win.
- Use email plus push reminders.
- Reopen the loop without forcing a long re-onboarding.

## 3. Launch checklist

### Store readiness
- Apple Developer account.
- Google Play Console account.
- Privacy policy and support contact.
- Screenshots and store copy.

### Product readiness
- Quiz works on small screens.
- Results are readable on mobile.
- Daily action screen works one-handed.
- Push notifications and GHL webhook are tested.
- PDF export is optional.

### Technical readiness
- Expo builds successfully.
- iPhone and Android builds run on real devices.
- Form validation and network errors are handled.

### Suggested launch order
1. Internal test build.
2. Small beta.
3. Re-engagement to the existing users.
4. Public launch.
