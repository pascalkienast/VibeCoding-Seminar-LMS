"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type SurveyQuestion = {
  id: number;
  order_index: number;
  type: "short_text" | "long_text" | "single_choice" | "multiple_choice" | "scale";
  label: string;
  description: string | null;
  required: boolean;
  options: any | null;
  min_value: number | null;
  max_value: number | null;
  allow_other: boolean;
};

type Survey = {
  id: number;
  token: string;
  title: string;
  description: string | null;
  is_anonymous: boolean;
  is_active: boolean;
  survey_questions: SurveyQuestion[];
};

type FormValue =
  | { kind: "short_text" | "long_text"; value: string }
  | { kind: "single_choice"; value: string | null; otherText?: string }
  | { kind: "multiple_choice"; values: string[]; otherText?: string }
  | { kind: "scale"; value: number | null };

export default function SurveyEmbed({ token }: { token: string }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [values, setValues] = useState<Record<number, FormValue>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (mounted) setUserId(auth.user?.id ?? null);
      } catch (_) {
        if (mounted) setUserId(null);
      }
      const { data, error } = await supabase
        .from("surveys")
        .select(
          `id, token, title, description, is_anonymous, is_active, survey_questions ( id, order_index, type, label, description, required, options, min_value, max_value, allow_other )`
        )
        .eq("token", token)
        .single();
      if (error) {
        if (mounted) setError(error.message);
      }
      if (mounted) {
        const s = data as unknown as Survey | null;
        if (s) {
          s.survey_questions = (s.survey_questions || []).sort(
            (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
          );
        }
        setSurvey(s);
      }
      if (mounted) setLoading(false);
    };
    run();
    return () => {
      mounted = false;
    };
  }, [supabase, token]);

  const onChange = (q: SurveyQuestion, next: FormValue) => {
    setValues((prev) => ({ ...prev, [q.id]: next }));
  };

  const validate = (): string | null => {
    if (!survey) return "Survey missing";
    for (const q of survey.survey_questions) {
      const v = values[q.id];
      if (!q.required) continue;
      if (!v) return `Bitte Frage ausfüllen: ${q.label}`;
      switch (q.type) {
        case "short_text":
        case "long_text":
          if (!("value" in v) || !v.value?.toString().trim()) return `Bitte Frage ausfüllen: ${q.label}`;
          break;
        case "single_choice":
          if (v.kind !== "single_choice" || (v.value === null && !v.otherText)) return `Bitte Frage ausfüllen: ${q.label}`;
          break;
        case "multiple_choice":
          if (v.kind !== "multiple_choice" || ((v.values?.length ?? 0) === 0 && !v.otherText)) return `Bitte Frage ausfüllen: ${q.label}`;
          break;
        case "scale":
          if (v.kind !== "scale" || v.value === null) return `Bitte Frage ausfüllen: ${q.label}`;
          break;
      }
    }
    return null;
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (!survey) throw new Error("Survey not loaded");
      if (!survey.is_anonymous && !userId) {
        throw new Error("Bitte einloggen um an der Umfrage teilzunehmen.");
      }
      const err = validate();
      if (err) throw new Error(err);

      const { data: inserted, error: insertErr } = await supabase
        .from("survey_responses")
        .insert({ survey_id: survey.id, user_id: survey.is_anonymous ? null : userId })
        .select("id")
        .single();
      if (insertErr) throw insertErr;
      const responseId = inserted?.id as number;

      const rows = survey.survey_questions.map((q) => {
        const v = values[q.id];
        let answer: any = null;
        switch (q.type) {
          case "short_text":
          case "long_text":
            answer = { value: (v as any)?.value ?? "" };
            break;
          case "single_choice": {
            const sv = v as Extract<FormValue, { kind: "single_choice" }> | undefined;
            answer = sv?.otherText ? { type: "other", value: sv.otherText } : { type: "option", value: sv?.value ?? null };
            break;
          }
          case "multiple_choice": {
            const mv = v as Extract<FormValue, { kind: "multiple_choice" }> | undefined;
            answer = { values: mv?.values ?? [], otherText: mv?.otherText ?? null };
            break;
          }
          case "scale": {
            const kv = v as Extract<FormValue, { kind: "scale" }> | undefined;
            answer = { value: kv?.value ?? null };
            break;
          }
        }
        return { response_id: responseId, question_id: q.id, answer };
      });

      const { error: ansErr } = await supabase.from("survey_answers").insert(rows);
      if (ansErr) throw ansErr;
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || "Fehler beim Absenden");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="not-prose p-4 border rounded-md">Umfrage lädt…</div>;
  }
  if (error) {
    return <div className="not-prose p-4 border rounded-md text-red-600">{error}</div>;
  }
  if (!survey || !survey.is_active) {
    return <div className="not-prose p-4 border rounded-md">Umfrage nicht verfügbar.</div>;
  }

  if (!survey.is_anonymous && !userId) {
    return (
      <div className="not-prose p-4 border rounded-md">
        <div className="font-medium">{survey.title}</div>
        <div className="text-sm mt-1">Bitte <a href="/login" className="underline">einloggen</a>, um an dieser Umfrage teilzunehmen.</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="not-prose p-4 border rounded-md">
        <div className="font-medium">Vielen Dank!</div>
        <div className="text-sm mt-1">Deine Antworten wurden gespeichert.</div>
      </div>
    );
  }

  return (
    <div className="not-prose p-4 border rounded-md space-y-3">
      <div>
        <div className="font-medium">{survey.title}</div>
        {survey.description && <div className="text-sm text-neutral-600 dark:text-neutral-400">{survey.description}</div>}
        <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          {survey.is_anonymous ? "Anonyme Umfrage (ohne Benutzer-ID)" : "Nicht-anonyme Umfrage (deine Benutzer-ID wird gespeichert)"}
        </div>
      </div>

      <div className="space-y-4">
        {survey.survey_questions.map((q) => {
          const opts: string[] = Array.isArray(q.options) ? q.options : q.options?.options || [];
          const min = q.min_value ?? 1;
          const max = q.max_value ?? 10;
          const v = values[q.id];
          return (
            <div key={q.id} className="space-y-1">
              <label className="font-medium block">{q.label}{q.required ? " *" : ""}</label>
              {q.description && <div className="text-sm text-neutral-600 dark:text-neutral-400">{q.description}</div>}
              {q.type === "short_text" && (
                <input
                  className="input"
                  value={(v as any)?.value ?? ""}
                  onChange={(e) => onChange(q, { kind: "short_text", value: e.target.value })}
                />
              )}
              {q.type === "long_text" && (
                <textarea
                  className="textarea min-h-[120px]"
                  value={(v as any)?.value ?? ""}
                  onChange={(e) => onChange(q, { kind: "long_text", value: e.target.value })}
                />
              )}
              {q.type === "single_choice" && (
                <div className="space-y-2">
                  {opts.map((opt) => (
                    <label key={opt} className="flex items-start gap-2">
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        checked={(v as any)?.value === opt}
                        onChange={() => onChange(q, { kind: "single_choice", value: opt })}
                      />
                      <span className="text-sm break-words leading-snug">{opt}</span>
                    </label>
                  ))}
                  {q.allow_other && (
                    <div className="space-y-1">
                      <label className="flex items-start gap-2">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          checked={Boolean((v as any)?.otherText)}
                          onChange={() => onChange(q, { kind: "single_choice", value: null, otherText: "" })}
                        />
                        <span className="text-sm">Anderes:</span>
                      </label>
                      <input
                        className="input w-full max-w-xl"
                        value={(v as any)?.otherText ?? ""}
                        onChange={(e) => onChange(q, { kind: "single_choice", value: null, otherText: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}
              {q.type === "multiple_choice" && (
                <div className="space-y-2">
                  {opts.map((opt) => {
                    const mv = v as Extract<FormValue, { kind: "multiple_choice" }> | undefined;
                    const current: string[] = Array.isArray(mv?.values) ? mv!.values : [];
                    const checked = current.includes(opt);
                    return (
                      <label key={opt} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set<string>(current);
                            if (e.target.checked) next.add(opt); else next.delete(opt);
                            onChange(q, { kind: "multiple_choice", values: Array.from(next), otherText: mv?.otherText });
                          }}
                        />
                        <span className="text-sm break-words leading-snug">{opt}</span>
                      </label>
                    );
                  })}
                  {q.allow_other && (
                    <div className="space-y-1">
                      <span className="text-sm">Anderes:</span>
                      <input
                        className="input w-full max-w-xl"
                        value={(v as any)?.otherText ?? ""}
                        onChange={(e) => {
                          const mv = v as Extract<FormValue, { kind: "multiple_choice" }> | undefined;
                          const current: string[] = Array.isArray(mv?.values) ? mv!.values : [];
                          onChange(q, { kind: "multiple_choice", values: current, otherText: e.target.value });
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              {q.type === "scale" && (
                <div className="flex items-center gap-3">
                  <div className="text-xs w-6 text-right">{min}</div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={(v as any)?.value ?? Math.round((min + max) / 2)}
                    onChange={(e) => onChange(q, { kind: "scale", value: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="text-xs w-6">{max}</div>
                  <div className="text-sm w-10 text-center">{(v as any)?.value ?? Math.round((min + max) / 2)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button className="btn" disabled={submitting} onClick={onSubmit}>
          {submitting ? "Senden…" : "Absenden"}
        </button>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}


