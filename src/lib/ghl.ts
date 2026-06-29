// GoHighLevel webhook integration
// Contract: docs/q12-mobile-ghl-upsell-workflow.md

import type { AssessmentResult, Answer } from "./engine";

const GHL_WEBHOOK_URL = process.env.EXPO_PUBLIC_GHL_WEBHOOK_URL ?? "";

export interface GHLContactPayload {
  first_name: string;
  email: string;
  total_score: number;
  percent_ready: number;
  band: string;
  weakest_domain: string;
  second_weakest_domain: string;
  digital_score: number;
  legal_score: number;
  financial_score: number;
  physical_score: number;
  day_1_action_title: string;
  day_2_action_title: string;
  day_3_action_title: string;
  day_4_action_title: string;
  day_5_action_title: string;
  day_6_action_title: string;
  day_7_action_title: string;
  source: string;
  consent_marketing: boolean;
  platform: "ios" | "android";
  /**
   * Tags applied to the GHL contact. The workflow upserts by email and applies
   * these tags on every fire, so re-takes will update the score AND keep the
   * tag set. Default tags: ["mobile_app_user", "q12_completed"].
   */
  tags: string[];
}

function buildPayload(
  result: AssessmentResult,
  email: string,
  consentMarketing: boolean,
  platform: "ios" | "android",
  tags: string[]
): GHLContactPayload {
  const byRank = (r: number) => result.domainResults.find((d) => d.rank === r)!.domain;
  const byScore = (d: string) => result.domainResults.find((r) => r.domain === d)!.score;

  return {
    first_name: result.name,
    email,
    total_score: result.totalScore,
    percent_ready: result.percentReady,
    band: result.band,
    weakest_domain: byRank(1),
    second_weakest_domain: byRank(2),
    digital_score: byScore("Digital"),
    legal_score: byScore("Legal"),
    financial_score: byScore("Financial"),
    physical_score: byScore("Physical"),
    day_1_action_title: result.plan[0].action.title,
    day_2_action_title: result.plan[1].action.title,
    day_3_action_title: result.plan[2].action.title,
    day_4_action_title: result.plan[3].action.title,
    day_5_action_title: result.plan[4].action.title,
    day_6_action_title: result.plan[5].action.title,
    day_7_action_title: result.plan[6].action.title,
    source: "q12_mobile_app",
    consent_marketing: consentMarketing,
    platform,
    tags,
  };
}

export async function sendToGHL(
  result: AssessmentResult,
  email: string,
  consentMarketing: boolean,
  platform: "ios" | "android" = "ios",
  tags: string[] = ["mobile_app_user", "q12_completed"]
): Promise<void> {
  if (!GHL_WEBHOOK_URL) {
    console.warn("[ghl] EXPO_PUBLIC_GHL_WEBHOOK_URL not set — skipping webhook");
    return;
  }
  const payload = buildPayload(result, email, consentMarketing, platform, tags);
  try {
    const res = await fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("[ghl] webhook error", res.status, await res.text());
    }
  } catch (err) {
    console.error("[ghl] webhook failed", err);
  }
}
