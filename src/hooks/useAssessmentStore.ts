// Persisted state: assessment result + daily plan progress
// Uses AsyncStorage so data survives app restarts

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AssessmentResult, Answer } from "../lib/engine";

const KEYS = {
  result: "@mfp/result",
  answers: "@mfp/answers",
  email: "@mfp/email",
  completedDays: "@mfp/completedDays",
  name: "@mfp/name",
} as const;

export interface AssessmentStore {
  result: AssessmentResult | null;
  answers: Answer[];
  email: string;
  name: string;
  completedDays: number[];
  loading: boolean;
  saveResult: (result: AssessmentResult, answers: Answer[]) => Promise<void>;
  saveEmail: (email: string) => Promise<void>;
  saveName: (name: string) => Promise<void>;
  markDayComplete: (day: number) => Promise<void>;
  reset: () => Promise<void>;
}

export function useAssessmentStore(): AssessmentStore {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r, a, e, n, d] = await Promise.all([
          AsyncStorage.getItem(KEYS.result),
          AsyncStorage.getItem(KEYS.answers),
          AsyncStorage.getItem(KEYS.email),
          AsyncStorage.getItem(KEYS.name),
          AsyncStorage.getItem(KEYS.completedDays),
        ]);
        if (r) setResult(JSON.parse(r));
        if (a) setAnswers(JSON.parse(a));
        if (e) setEmail(e);
        if (n) setName(n);
        if (d) setCompletedDays(JSON.parse(d));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveResult = async (r: AssessmentResult, a: Answer[]) => {
    setResult(r);
    setAnswers(a);
    await Promise.all([
      AsyncStorage.setItem(KEYS.result, JSON.stringify(r)),
      AsyncStorage.setItem(KEYS.answers, JSON.stringify(a)),
    ]);
  };

  const saveEmail = async (e: string) => {
    setEmail(e);
    await AsyncStorage.setItem(KEYS.email, e);
  };

  const saveName = async (n: string) => {
    setName(n);
    await AsyncStorage.setItem(KEYS.name, n);
  };

  const markDayComplete = async (day: number) => {
    const updated = completedDays.includes(day) ? completedDays : [...completedDays, day];
    setCompletedDays(updated);
    await AsyncStorage.setItem(KEYS.completedDays, JSON.stringify(updated));
  };

  const reset = async () => {
    setResult(null);
    setAnswers([]);
    setEmail("");
    setName("");
    setCompletedDays([]);
    await AsyncStorage.multiRemove(Object.values(KEYS));
  };

  return { result, answers, email, name, completedDays, loading, saveResult, saveEmail, saveName, markDayComplete, reset };
}
