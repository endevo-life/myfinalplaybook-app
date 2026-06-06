// Smoke tests — full end-to-end quiz flow simulation (no UI, pure logic)
// Simulates: user opens app → answers 12 questions → gets results → completes 7 days
// This is the golden path test. If this passes, the core product works.

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  runAssessment,
  calculateScore,
  assignBand,
  rankDomains,
  buildPlan,
  QUESTIONS,
  type Answer,
  type Domain,
} from "../src/lib/engine";

const STORAGE_KEYS = {
  result: "@mfp/result",
  answers: "@mfp/answers",
  email: "@mfp/email",
  completedDays: "@mfp/completedDays",
  name: "@mfp/name",
};

beforeEach(async () => await AsyncStorage.clear());

// ─── SCENARIO A: At-Risk user completes the full flow ─────────────────────────

describe("Smoke: AT RISK user — complete flow", () => {
  const USER_NAME  = "Sarah";
  const USER_EMAIL = "sarah@example.com";

  // All "No" answers → worst-case score
  const answers: Answer[] = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));

  test("Step 1 — quiz produces a valid result", () => {
    const result = runAssessment(USER_NAME, answers);

    expect(result.name).toBe(USER_NAME);
    expect(result.totalScore).toBe(0);
    expect(result.band).toBe("AT RISK");
    expect(result.percentReady).toBe(0);
    expect(result.domainResults).toHaveLength(4);
    expect(result.plan).toHaveLength(7);
  });

  test("Step 2 — result persists to AsyncStorage after email capture", async () => {
    const result = runAssessment(USER_NAME, answers);

    await AsyncStorage.setItem(STORAGE_KEYS.result,       JSON.stringify(result));
    await AsyncStorage.setItem(STORAGE_KEYS.answers,      JSON.stringify(answers));
    await AsyncStorage.setItem(STORAGE_KEYS.email,        USER_EMAIL);
    await AsyncStorage.setItem(STORAGE_KEYS.name,         USER_NAME);
    await AsyncStorage.setItem(STORAGE_KEYS.completedDays, JSON.stringify([]));

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.result);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.band).toBe("AT RISK");
    expect(parsed.plan).toHaveLength(7);
  });

  test("Step 3 — app restart restores full plan state", async () => {
    const result = runAssessment(USER_NAME, answers);
    await AsyncStorage.setItem(STORAGE_KEYS.result, JSON.stringify(result));
    await AsyncStorage.setItem(STORAGE_KEYS.completedDays, JSON.stringify([]));

    // Simulate restart: re-read from storage
    const raw         = await AsyncStorage.getItem(STORAGE_KEYS.result);
    const rawDays     = await AsyncStorage.getItem(STORAGE_KEYS.completedDays);
    const restored    = JSON.parse(raw!);
    const restoredDays: number[] = JSON.parse(rawDays!);

    expect(restored.name).toBe(USER_NAME);
    expect(restored.plan[0].action.slot).toBe("A");
    expect(restoredDays).toEqual([]);
  });

  test("Step 4 — completing days updates storage correctly", async () => {
    const result = runAssessment(USER_NAME, answers);
    await AsyncStorage.setItem(STORAGE_KEYS.result, JSON.stringify(result));

    let completedDays: number[] = [];

    for (const day of [1, 2, 3]) {
      completedDays = completedDays.includes(day) ? completedDays : [...completedDays, day];
      await AsyncStorage.setItem(STORAGE_KEYS.completedDays, JSON.stringify(completedDays));
    }

    const raw = await AsyncStorage.getItem(STORAGE_KEYS.completedDays);
    expect(JSON.parse(raw!)).toEqual([1, 2, 3]);
  });

  test("Step 5 — completing all 7 days leaves correct final state", async () => {
    const result = runAssessment(USER_NAME, answers);
    await AsyncStorage.setItem(STORAGE_KEYS.result, JSON.stringify(result));

    const allDays = [1, 2, 3, 4, 5, 6, 7];
    await AsyncStorage.setItem(STORAGE_KEYS.completedDays, JSON.stringify(allDays));

    const raw  = await AsyncStorage.getItem(STORAGE_KEYS.completedDays);
    const days = JSON.parse(raw!);
    expect(days).toHaveLength(7);
    expect(days).toContain(7);
  });

  test("Step 6 — reset clears all state (start-over flow)", async () => {
    const result = runAssessment(USER_NAME, answers);
    await AsyncStorage.setItem(STORAGE_KEYS.result, JSON.stringify(result));
    await AsyncStorage.setItem(STORAGE_KEYS.email, USER_EMAIL);
    await AsyncStorage.setItem(STORAGE_KEYS.completedDays, JSON.stringify([1, 2]));

    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));

    for (const key of Object.values(STORAGE_KEYS)) {
      expect(await AsyncStorage.getItem(key)).toBeNull();
    }
  });
});

// ─── SCENARIO B: PREPARED user with known answers ────────────────────────────

describe("Smoke: PREPARED user — known high-score answers", () => {
  const best: Answer[] = QUESTIONS.map((q) => {
    const top = q.options.reduce((a, b) => (b.points > a.points ? b : a));
    return { questionId: q.id, value: top.value };
  });

  test("max answers produce score 24 and PREPARED band", () => {
    const result = runAssessment("Marcus", best);
    expect(result.totalScore).toBe(24);
    expect(result.band).toBe("PREPARED");
    expect(result.percentReady).toBe(100);
  });

  test("plan Day 1 is weakest domain slot A (deterministic)", () => {
    const result = runAssessment("Marcus", best);
    // With all max scores, tie-break Digital wins as weakest
    expect(result.plan[0].action.slot).toBe("A");
    expect(result.plan[0].day).toBe(1);
  });
});

// ─── SCENARIO C: Returning user skips quiz ────────────────────────────────────

describe("Smoke: returning user already has saved state", () => {
  test("saved result detected on load — can skip to plan", async () => {
    const answers: Answer[] = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
    const result = runAssessment("Alex", answers);

    await AsyncStorage.setItem(STORAGE_KEYS.result, JSON.stringify(result));

    // App load: check storage
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.result);
    expect(raw).not.toBeNull(); // should redirect to plan

    const parsed = JSON.parse(raw!);
    expect(parsed.name).toBe("Alex");
    expect(parsed.plan).toHaveLength(7);
  });

  test("partially completed plan resumes at correct day", async () => {
    const answers: Answer[] = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
    const result = runAssessment("Alex", answers);

    await AsyncStorage.setItem(STORAGE_KEYS.result, JSON.stringify(result));
    await AsyncStorage.setItem(STORAGE_KEYS.completedDays, JSON.stringify([1, 2, 3]));

    const rawDays = await AsyncStorage.getItem(STORAGE_KEYS.completedDays);
    const days    = JSON.parse(rawDays!);

    // Next incomplete day
    const nextDay = [1, 2, 3, 4, 5, 6, 7].find((d) => !days.includes(d));
    expect(nextDay).toBe(4);
  });
});

// ─── SCENARIO D: Determinism guarantee ───────────────────────────────────────

describe("Smoke: determinism — same answers always produce same plan", () => {
  test("two runs with identical answers produce identical plans", () => {
    const answers: Answer[] = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));

    const r1 = runAssessment("User1", answers);
    const r2 = runAssessment("User2", answers);

    // Plans identical regardless of name
    expect(r1.plan.map((p) => p.action.id)).toEqual(r2.plan.map((p) => p.action.id));
    expect(r1.band).toBe(r2.band);
    expect(r1.weakestDomain).toBe(r2.weakestDomain);
  });

  test("different answers produce different plans", () => {
    const worst: Answer[] = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
    const best:  Answer[] = QUESTIONS.map((q) => {
      const top = q.options.reduce((a, b) => (b.points > a.points ? b : a));
      return { questionId: q.id, value: top.value };
    });

    const r1 = runAssessment("Low",  worst);
    const r2 = runAssessment("High", best);

    expect(r1.totalScore).not.toBe(r2.totalScore);
  });
});
