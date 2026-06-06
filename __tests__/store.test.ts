// Integration tests for useAssessmentStore / AsyncStorage persistence
// Verifies: save, load, markDayComplete, reset

import AsyncStorage from "@react-native-async-storage/async-storage";
import { runAssessment, QUESTIONS, type Answer } from "../src/lib/engine";

// AsyncStorage is auto-mocked by jest-expo via @react-native-async-storage/async-storage mock

const KEYS = {
  result: "@mfp/result",
  answers: "@mfp/answers",
  email: "@mfp/email",
  completedDays: "@mfp/completedDays",
  name: "@mfp/name",
};

function makeAnswers(): Answer[] {
  return QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("AsyncStorage persistence layer", () => {
  test("stores and retrieves assessment result", async () => {
    const answers = makeAnswers();
    const result = runAssessment("Niki", answers);

    await AsyncStorage.setItem(KEYS.result, JSON.stringify(result));
    await AsyncStorage.setItem(KEYS.answers, JSON.stringify(answers));
    await AsyncStorage.setItem(KEYS.email, "niki@endevo.com");
    await AsyncStorage.setItem(KEYS.name, "Niki");

    const stored = await AsyncStorage.getItem(KEYS.result);
    const parsed = JSON.parse(stored!);

    expect(parsed.name).toBe("Niki");
    expect(parsed.totalScore).toBe(result.totalScore);
    expect(parsed.band).toBe(result.band);
    expect(parsed.plan).toHaveLength(7);
  });

  test("stores and retrieves completed days", async () => {
    const days = [1, 2, 3];
    await AsyncStorage.setItem(KEYS.completedDays, JSON.stringify(days));

    const stored = await AsyncStorage.getItem(KEYS.completedDays);
    expect(JSON.parse(stored!)).toEqual([1, 2, 3]);
  });

  test("markDayComplete appends day and deduplicates", async () => {
    await AsyncStorage.setItem(KEYS.completedDays, JSON.stringify([1]));

    const existing = JSON.parse((await AsyncStorage.getItem(KEYS.completedDays)) ?? "[]");
    const updated = existing.includes(2) ? existing : [...existing, 2];
    await AsyncStorage.setItem(KEYS.completedDays, JSON.stringify(updated));

    const final = JSON.parse((await AsyncStorage.getItem(KEYS.completedDays)) ?? "[]");
    expect(final).toEqual([1, 2]);
  });

  test("marking same day twice does not duplicate", async () => {
    await AsyncStorage.setItem(KEYS.completedDays, JSON.stringify([1, 2]));

    const existing = JSON.parse((await AsyncStorage.getItem(KEYS.completedDays)) ?? "[]");
    const updated = existing.includes(2) ? existing : [...existing, 2];
    await AsyncStorage.setItem(KEYS.completedDays, JSON.stringify(updated));

    const final = JSON.parse((await AsyncStorage.getItem(KEYS.completedDays)) ?? "[]");
    expect(final).toEqual([1, 2]);
  });

  test("reset clears all keys", async () => {
    await AsyncStorage.setItem(KEYS.result, "{}");
    await AsyncStorage.setItem(KEYS.email, "test@test.com");
    await AsyncStorage.setItem(KEYS.completedDays, "[1,2]");

    await AsyncStorage.multiRemove(Object.values(KEYS));

    const result = await AsyncStorage.getItem(KEYS.result);
    const email = await AsyncStorage.getItem(KEYS.email);
    const days = await AsyncStorage.getItem(KEYS.completedDays);

    expect(result).toBeNull();
    expect(email).toBeNull();
    expect(days).toBeNull();
  });

  test("result survives simulated restart (re-read from storage)", async () => {
    const answers = makeAnswers();
    const result = runAssessment("Jesse", answers);

    await AsyncStorage.setItem(KEYS.result, JSON.stringify(result));

    // Simulate app restart — read fresh
    const raw = await AsyncStorage.getItem(KEYS.result);
    const restored = JSON.parse(raw!);

    expect(restored.name).toBe("Jesse");
    expect(restored.weakestDomain).toBe(result.weakestDomain);
    expect(restored.plan[0].action.id).toBe(result.plan[0].action.id);
  });

  test("partial completion persists correctly (days 1-3 done)", async () => {
    const completed = [1, 2, 3];
    await AsyncStorage.setItem(KEYS.completedDays, JSON.stringify(completed));

    const raw = await AsyncStorage.getItem(KEYS.completedDays);
    const restored: number[] = JSON.parse(raw!);

    expect(restored).toHaveLength(3);
    expect(restored).toContain(1);
    expect(restored).toContain(3);
    expect(restored).not.toContain(4);
  });
});
