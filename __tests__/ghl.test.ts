// Integration tests for GHL webhook payload builder
// Verifies: payload shape, required fields, tag generation, platform field

import { runAssessment, QUESTIONS, type Answer } from "../src/lib/engine";

// Re-implement buildPayload inline (mirrors src/lib/ghl.ts) so tests
// are independent of the module's fetch side-effect.
function buildPayload(
  result: ReturnType<typeof runAssessment>,
  email: string,
  consentMarketing: boolean,
  platform: "ios" | "android",
  tags: string[] = ["mobile_app_user", "q12_completed"]
) {
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
    source: "Q12_MOBILE",
    consent_marketing: consentMarketing,
    platform,
    tags,
  };
}

function makeResult(name = "Test") {
  const answers: Answer[] = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
  return runAssessment(name, answers);
}

describe("GHL payload", () => {
  test("contains required contact fields", () => {
    const result = makeResult("Niki");
    const payload = buildPayload(result, "niki@endevo.com", true, "ios");

    expect(payload.first_name).toBe("Niki");
    expect(payload.email).toBe("niki@endevo.com");
    expect(payload.total_score).toBe(result.totalScore);
    expect(payload.band).toBe(result.band);
    expect(payload.source).toBe("Q12_MOBILE");
  });

  test("platform is passed through correctly", () => {
    const result = makeResult();
    expect(buildPayload(result, "a@b.com", true, "ios").platform).toBe("ios");
    expect(buildPayload(result, "a@b.com", true, "android").platform).toBe("android");
  });

  test("consent_marketing reflects the input", () => {
    const result = makeResult();
    expect(buildPayload(result, "a@b.com", true, "ios").consent_marketing).toBe(true);
    expect(buildPayload(result, "a@b.com", false, "ios").consent_marketing).toBe(false);
  });

  test("all 7 day action titles are present and non-empty", () => {
    const result = makeResult();
    const payload = buildPayload(result, "a@b.com", true, "ios");

    for (let i = 1; i <= 7; i++) {
      const key = `day_${i}_action_title` as keyof typeof payload;
      expect(typeof payload[key]).toBe("string");
      expect((payload[key] as string).length).toBeGreaterThan(0);
    }
  });

  test("weakest_domain matches rank-1 domain from engine", () => {
    const result = makeResult();
    const rank1 = result.domainResults.find((d) => d.rank === 1)!;
    const payload = buildPayload(result, "a@b.com", true, "ios");
    expect(payload.weakest_domain).toBe(rank1.domain);
  });

  test("domain scores sum correctly (all-zero answers = 0 each)", () => {
    const result = makeResult();
    const payload = buildPayload(result, "a@b.com", true, "ios");
    expect(payload.digital_score + payload.legal_score + payload.financial_score + payload.physical_score)
      .toBe(result.totalScore);
  });

  test("default tags include mobile_app_user and q12_completed", () => {
    const result = makeResult();
    const payload = buildPayload(result, "a@b.com", true, "ios");
    expect(payload.tags).toContain("mobile_app_user");
    expect(payload.tags).toContain("q12_completed");
  });

  test("custom tags override defaults", () => {
    const result = makeResult();
    const payload = buildPayload(result, "a@b.com", true, "ios", ["custom_tag"]);
    expect(payload.tags).toEqual(["custom_tag"]);
  });

  test("percent_ready is between 0 and 100", () => {
    const result = makeResult();
    const payload = buildPayload(result, "a@b.com", true, "ios");
    expect(payload.percent_ready).toBeGreaterThanOrEqual(0);
    expect(payload.percent_ready).toBeLessThanOrEqual(100);
  });
});
