# Q12 Mobile Launch Checklist

## App store readiness
- Apple Developer account created.
- Google Play Console account created.
- App name finalized.
- Privacy policy linked.
- Terms and support contact ready.
- Screenshots prepared for both stores.

## Product readiness
- Quiz works on small screens.
- Results screen is clear on mobile.
- Daily action screen is usable with one hand.
- Push notification flow tested.
- GHL webhook fires correctly.
- Tracking events are recorded.
- PDF export is optional and tested.

## Technical readiness
- Expo project builds successfully.
- iPhone and Android builds run on real devices.
- No broken deep links.
- No console errors.
- Form validation works.
- Network errors are handled gracefully.

## QA checklist
- Test quiz completion from start to finish.
- Test background and foreground behavior.
- Test push notification open behavior.
- Test resume after app restart.
- Test slow network behavior.
- Test email capture and CRM sync.

## Launch checklist for a new team
1. Decide MVP scope.
2. Build the quiz and results screens.
3. Connect GHL and analytics.
4. Add daily actions and reminders.
5. Test internally.
6. Submit to TestFlight and Google internal testing.
7. Fix review feedback.
8. Publish.

## Team questions to answer before build
- Should the app require login or stay email-based?
- Should Day 1 be visible immediately after the quiz?
- Should PDF export stay in the app or move to email only?
- Which analytics tool will be used?
- What exact GHL tags or workflows should fire?

## Suggested launch order
1. Private internal test build.
2. Small user beta.
3. Re-engagement to the 197 existing users.
4. Public launch.
