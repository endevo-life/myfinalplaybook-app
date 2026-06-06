// Unit tests for the Q12 scoring engine
// Verifies: calculateScore, assignBand, rankDomains, buildPlan, runAssessment
// These are the locked deterministic rules — any test failure means the spec changed.

import {
  calculateScore,
  calculateDomainScores,
  assignBand,
  rankDomains,
  buildPlan,
  runAssessment,
  QUESTIONS,
  ACTION_POOL,
  type Answer,
  type Domain,
} from "../src/lib/engine";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function allAnswers(value: string): Answer[] {
  return QUESTIONS.map((q) => ({ questionId: q.id, value }));
}

function answersWith(overrides: Record<string, string>): Answer[] {
  return QUESTIONS.map((q) => ({
    questionId: q.id,
    value: overrides[q.id] ?? "N",
  }));
}

// ─── QUESTIONS ────────────────────────────────────────────────────────────────

describe("QUESTIONS", () => {
  test("has exactly 12 questions", () => {
    expect(QUESTIONS).toHaveLength(12);
  });

  test("has exactly 3 questions per domain", () => {
    const domains: Domain[] = ["Digital", "Legal", "Financial", "Physical"];
    domains.forEach((d) => {
      expect(QUESTIONS.filter((q) => q.domain === d)).toHaveLength(3);
    });
  });

  test("every option has points 0, 1, or 2", () => {
    QUESTIONS.forEach((q) => {
      q.options.forEach((o) => {
        expect([0, 1, 2]).toContain(o.points);
      });
    });
  });

  test("every question has at least 2 options", () => {
    QUESTIONS.forEach((q) => {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    });
  });
});

// ─── ACTION POOL ──────────────────────────────────────────────────────────────

describe("ACTION_POOL", () => {
  test("has one slot-A action per domain", () => {
    const domains: Domain[] = ["Digital", "Legal", "Financial", "Physical"];
    domains.forEach((d) => {
      expect(ACTION_POOL.filter((a) => a.domain === d && a.slot === "A")).toHaveLength(1);
    });
  });

  test("has one slot-B action per domain", () => {
    const domains: Domain[] = ["Digital", "Legal", "Financial", "Physical"];
    domains.forEach((d) => {
      expect(ACTION_POOL.filter((a) => a.domain === d && a.slot === "B")).toHaveLength(1);
    });
  });

  test("has exactly one Day7 action", () => {
    expect(ACTION_POOL.filter((a) => a.slot === "Day7")).toHaveLength(1);
  });
});

// ─── CALCULATE SCORE ──────────────────────────────────────────────────────────

describe("calculateScore", () => {
  test("all correct (max-point answers) = 24", () => {
    // Best answer per question: pick the option with points 2
    const best: Answer[] = QUESTIONS.map((q) => {
      const top = q.options.reduce((a, b) => (b.points > a.points ? b : a));
      return { questionId: q.id, value: top.value };
    });
    expect(calculateScore(best)).toBe(24);
  });

  test("all 'N' answers = 0", () => {
    const worst = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
    expect(calculateScore(worst)).toBe(0);
  });

  test("empty answers = 0", () => {
    expect(calculateScore([])).toBe(0);
  });

  test("unknown questionId is ignored", () => {
    const answers: Answer[] = [{ questionId: "FAKE", value: "Y" }];
    expect(calculateScore(answers)).toBe(0);
  });
});

// ─── ASSIGN BAND ──────────────────────────────────────────────────────────────

describe("assignBand", () => {
  test("score 0 → AT RISK", () => expect(assignBand(0)).toBe("AT RISK"));
  test("score 11 → AT RISK", () => expect(assignBand(11)).toBe("AT RISK"));
  test("score 12 → SOMEWHAT PREPARED", () => expect(assignBand(12)).toBe("SOMEWHAT PREPARED"));
  test("score 19 → SOMEWHAT PREPARED", () => expect(assignBand(19)).toBe("SOMEWHAT PREPARED"));
  test("score 20 → PREPARED", () => expect(assignBand(20)).toBe("PREPARED"));
  test("score 24 → PREPARED", () => expect(assignBand(24)).toBe("PREPARED"));
});

// ─── RANK DOMAINS ─────────────────────────────────────────────────────────────

describe("rankDomains — tie-break order: Digital > Legal > Financial > Physical", () => {
  test("weakest domain (score 0) is rank 1", () => {
    const scores = { Digital: 0, Legal: 6, Financial: 6, Physical: 6 };
    const ranked = rankDomains(scores);
    expect(ranked[0].domain).toBe("Digital");
    expect(ranked[0].rank).toBe(1);
  });

  test("strongest domain (score 6) is rank 4", () => {
    const scores = { Digital: 0, Legal: 2, Financial: 4, Physical: 6 };
    const ranked = rankDomains(scores);
    expect(ranked[3].domain).toBe("Physical");
    expect(ranked[3].rank).toBe(4);
  });

  test("tie-break: Digital beats Legal when scores equal", () => {
    const scores = { Digital: 3, Legal: 3, Financial: 6, Physical: 6 };
    const ranked = rankDomains(scores);
    expect(ranked[0].domain).toBe("Digital");
    expect(ranked[1].domain).toBe("Legal");
  });

  test("tie-break: Legal beats Financial when scores equal", () => {
    const scores = { Digital: 6, Legal: 3, Financial: 3, Physical: 6 };
    const ranked = rankDomains(scores);
    expect(ranked[0].domain).toBe("Legal");
    expect(ranked[1].domain).toBe("Financial");
  });

  test("tie-break: Financial beats Physical when scores equal", () => {
    const scores = { Digital: 6, Legal: 6, Financial: 3, Physical: 3 };
    const ranked = rankDomains(scores);
    expect(ranked[0].domain).toBe("Financial");
    expect(ranked[1].domain).toBe("Physical");
  });

  test("percent = Math.round(score / 6 * 100)", () => {
    const scores = { Digital: 3, Legal: 0, Financial: 6, Physical: 2 };
    const ranked = rankDomains(scores);
    const digital = ranked.find((r) => r.domain === "Digital")!;
    expect(digital.percent).toBe(50);
    const legal = ranked.find((r) => r.domain === "Legal")!;
    expect(legal.percent).toBe(0);
  });

  test("returns all 4 domains", () => {
    const scores = { Digital: 1, Legal: 2, Financial: 3, Physical: 4 };
    const ranked = rankDomains(scores);
    expect(ranked).toHaveLength(4);
    expect(ranked.map((r) => r.rank).sort()).toEqual([1, 2, 3, 4]);
  });
});

// ─── BUILD PLAN ───────────────────────────────────────────────────────────────

describe("buildPlan", () => {
  function getRanked(scores: Record<Domain, number>) {
    return rankDomains(scores);
  }

  test("returns 7 day assignments", () => {
    const ranked = getRanked({ Digital: 0, Legal: 2, Financial: 4, Physical: 6 });
    expect(buildPlan(ranked)).toHaveLength(7);
  });

  test("Day 1 = weakest domain slot A", () => {
    const ranked = getRanked({ Digital: 0, Legal: 6, Financial: 6, Physical: 6 });
    const plan = buildPlan(ranked);
    expect(plan[0].day).toBe(1);
    expect(plan[0].domain).toBe("Digital");
    expect(plan[0].action.slot).toBe("A");
  });

  test("Day 7 = ALL domain (the wrap-up action)", () => {
    const ranked = getRanked({ Digital: 1, Legal: 2, Financial: 3, Physical: 4 });
    const plan = buildPlan(ranked);
    expect(plan[6].day).toBe(7);
    expect(plan[6].domain).toBe("ALL");
    expect(plan[6].action.slot).toBe("Day7");
  });

  test("Days 1-4 cover all 4 domains (one each, slot A)", () => {
    const ranked = getRanked({ Digital: 0, Legal: 1, Financial: 2, Physical: 3 });
    const plan = buildPlan(ranked);
    const days1to4Domains = plan.slice(0, 4).map((p) => p.domain);
    const domains: Domain[] = ["Digital", "Legal", "Financial", "Physical"];
    domains.forEach((d) => expect(days1to4Domains).toContain(d));
  });

  test("Day 5 = weakest domain slot B", () => {
    const ranked = getRanked({ Digital: 0, Legal: 6, Financial: 6, Physical: 6 });
    const plan = buildPlan(ranked);
    expect(plan[4].day).toBe(5);
    expect(plan[4].domain).toBe("Digital");
    expect(plan[4].action.slot).toBe("B");
  });

  test("same inputs always produce same plan (deterministic)", () => {
    const ranked = getRanked({ Digital: 2, Legal: 4, Financial: 1, Physical: 5 });
    const plan1 = buildPlan(ranked);
    const plan2 = buildPlan(ranked);
    expect(plan1.map((p) => p.action.id)).toEqual(plan2.map((p) => p.action.id));
  });
});

// ─── RUN ASSESSMENT ───────────────────────────────────────────────────────────

describe("runAssessment", () => {
  test("all-zero answers → AT RISK, score 0, percentReady 0", () => {
    const answers = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
    const result = runAssessment("Test", answers);
    expect(result.totalScore).toBe(0);
    expect(result.percentReady).toBe(0);
    expect(result.band).toBe("AT RISK");
  });

  test("preserves the provided name", () => {
    const answers = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
    const result = runAssessment("Niki", answers);
    expect(result.name).toBe("Niki");
  });

  test("percentReady = Math.round(totalScore / 24 * 100)", () => {
    const answers = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
    const result = runAssessment("Test", answers);
    expect(result.percentReady).toBe(Math.round((result.totalScore / 24) * 100));
  });

  test("result includes 7-day plan with correct days", () => {
    const answers = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
    const result = runAssessment("Test", answers);
    expect(result.plan).toHaveLength(7);
    expect(result.plan.map((p) => p.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("weakestDomain = rank-1 domain", () => {
    const answers = QUESTIONS.map((q) => ({ questionId: q.id, value: "N" }));
    const result = runAssessment("Test", answers);
    const rank1 = result.domainResults.find((d) => d.rank === 1)!;
    expect(result.weakestDomain).toBe(rank1.domain);
  });

  // Worked example from docs/Q12_React_Developer_Notes.md §14
  test("worked example: all Y answers → PREPARED, max score", () => {
    const best: Answer[] = QUESTIONS.map((q) => {
      const top = q.options.reduce((a, b) => (b.points > a.points ? b : a));
      return { questionId: q.id, value: top.value };
    });
    const result = runAssessment("Jesse", best);
    expect(result.totalScore).toBe(24);
    expect(result.band).toBe("PREPARED");
    expect(result.percentReady).toBe(100);
  });
});
