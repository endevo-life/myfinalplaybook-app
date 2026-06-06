// Analytics event stubs — wire to PostHog or Firebase in production.
// All events match the taxonomy in docs/q12-mobile-monetization-events.md

import type { Band, Domain } from "./engine";

type Platform = "ios" | "android";

interface BaseProps {
  anonymous_id: string;
  email?: string;
  platform: Platform;
  app_version: string;
}

let _base: BaseProps = {
  anonymous_id: "",
  platform: "ios",
  app_version: "1.0.0",
};

export function initAnalytics(base: BaseProps) {
  _base = base;
}

export function identify(email: string) {
  _base = { ..._base, email };
  // TODO: posthog.identify(email, { email })
  console.log("[analytics] identify", email);
}

function track(event: string, props?: Record<string, unknown>) {
  const payload = { ..._base, ...props };
  // TODO: posthog.capture(event, payload) or firebase.logEvent(event, payload)
  console.log("[analytics]", event, payload);
}

// ── Engagement events

export const analytics = {
  appOpened: (source: "cold" | "push" | "deep_link") =>
    track("app_opened", { source }),

  assessmentStarted: () =>
    track("assessment_started"),

  questionAnswered: (question_number: number, answer_value: string) =>
    track("question_answered", { question_number, answer_value }),

  assessmentCompleted: (score: number, band: Band, weakest_domain: Domain) =>
    track("assessment_completed", { score, band, weakest_domain }),

  emailCaptured: (consent_marketing: boolean, source_screen: string) =>
    track("email_captured", { consent_marketing, source_screen }),

  resultViewed: (score: number, band: Band, weakest_domain: Domain) =>
    track("result_viewed", { score, band, weakest_domain }),

  dayOpened: (day_number: number) =>
    track("day_opened", { day_number }),

  dayCompleted: (day_number: number) =>
    track("day_completed", { day_number }),

  planCompleted: (days_completed_count: number) =>
    track("plan_completed", { days_completed_count }),

  reminderOpened: (day_number: number, notification_id: string) =>
    track("reminder_opened", { day_number, notification_id }),

  bookCallClicked: (placement: string) =>
    track("book_call_clicked", { placement }),

  // ── Monetization events

  upgradePromptShown: (placement: string, offer_id: string) =>
    track("upgrade_prompt_shown", { placement, offer_id }),

  upgradeClicked: (placement: string, offer_id: string) =>
    track("upgrade_clicked", { placement, offer_id }),

  paywallViewed: (offer_id: string, price: number, currency: string) =>
    track("paywall_viewed", { offer_id, price, currency }),

  purchaseStarted: (product_id: string, channel: "iap_ios" | "iap_android" | "web_stripe") =>
    track("purchase_started", { product_id, channel }),

  purchaseCompleted: (product_id: string, channel: string, amount: number, currency: string, order_id: string) =>
    track("purchase_completed", { product_id, channel, amount, currency, order_id }),
};
