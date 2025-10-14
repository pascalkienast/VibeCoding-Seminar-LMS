"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Survey = { id: number; token: string; title: string; is_anonymous: boolean; is_active: boolean };
type Question = {
  id: number;
  survey_id: number;
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

export default function AdminSurveyResultsPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [questionResults, setQuestionResults] = useState<Record<number, any>>({});

  const loadSurveys = async () => {
    const { data } = await supabase
      .from("surveys")
      .select("id, token, title, is_anonymous, is_active")
      .order("id", { ascending: false })
      .limit(100);
    setSurveys(data || []);
    if (!selectedId && data && data.length) setSelectedId(data[0].id);
  };

  const loadQuestions = async (surveyId: number) => {
    const { data } = await supabase
      .from("survey_questions")
      .select("id, survey_id, order_index, type, label, description, required, options, min_value, max_value, allow_other")
      .eq("survey_id", surveyId)
      .order("order_index", { ascending: true });
    const list = data || [];
    setQuestions(list);
    return list;
  };

  useEffect(() => { loadSurveys(); }, []);
  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const qs = await loadQuestions(selectedId);
      await fetchResults(selectedId, qs);
    })();
  }, [selectedId]);

  const fetchResults = async (surveyId: number, qsArg?: Question[]) => {
    setLoading(true);
    try {
      const { data: responses } = await supabase
        .from("survey_responses")
        .select("id, user_id, created_at")
        .eq("survey_id", surveyId)
        .order("created_at", { ascending: true });
      const responseIds = (responses || []).map((r) => r.id);
      setTotalResponses(responseIds.length);
      if (responseIds.length === 0) { setQuestionResults({}); return; }

      const { data: answers } = await supabase
        .from("survey_answers")
        .select("response_id, question_id, answer")
        .in("response_id", responseIds);

      const qs = qsArg || questions;
      const byQ: Record<number, any> = {};
      for (const q of qs) {
        if (q.type === "single_choice" || q.type === "multiple_choice") {
          byQ[q.id] = { kind: q.type, counts: new Map<string, number>(), otherTexts: [] as string[], otherCount: 0, answered: 0 };
        } else if (q.type === "scale") {
          byQ[q.id] = { kind: q.type, counts: new Map<number, number>(), min: q.min_value ?? 1, max: q.max_value ?? 10, answered: 0, sum: 0 };
        } else {
          byQ[q.id] = { kind: q.type, texts: [] as string[], answered: 0 };
        }
      }

      for (const a of answers || []) {
        const bucket = byQ[a.question_id];
        if (!bucket) continue;
        const ans = a.answer as any;
        if (bucket.kind === "single_choice") {
          if (ans?.type === "option") {
            const key = String(ans.value ?? "");
            const prev = bucket.counts.get(key) || 0;
            bucket.counts.set(key, prev + 1);
            bucket.answered += 1;
          } else if (ans?.type === "other") {
            const text = (ans.value ?? "").toString().trim();
            if (text) bucket.otherTexts.push(text);
            bucket.otherCount += 1;
            bucket.answered += 1;
          }
        } else if (bucket.kind === "multiple_choice") {
          const values: any[] = Array.isArray(ans?.values) ? ans.values : [];
          for (const v of values) {
            const key = String(v);
            const prev = bucket.counts.get(key) || 0;
            bucket.counts.set(key, prev + 1);
          }
          if (ans?.otherText) {
            const text = String(ans.otherText);
            bucket.otherTexts.push(text);
            bucket.otherCount += 1;
          }
          if (values.length || ans?.otherText) bucket.answered += 1;
        } else if (bucket.kind === "scale") {
          const v = typeof ans?.value === "number" ? ans.value : null;
          if (v !== null) {
            const prev = bucket.counts.get(v) || 0;
            bucket.counts.set(v, prev + 1);
            bucket.sum += v;
            bucket.answered += 1;
          }
        } else {
          const t = (ans?.value ?? "").toString();
          if (t.length) {
            bucket.texts.push(t);
            bucket.answered += 1;
          }
        }
      }

      const serializable: Record<number, any> = {};
      for (const [qid, data] of Object.entries(byQ)) {
        if (data.counts instanceof Map) {
          const obj: Record<string, number> = {};
          for (const [k, v] of data.counts.entries()) obj[k] = v;
          serializable[Number(qid)] = { ...data, counts: obj };
        } else {
          serializable[Number(qid)] = data;
        }
      }
      setQuestionResults(serializable);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    if (!selectedId) return;
    const { data: responses } = await supabase
      .from("survey_responses")
      .select("id, user_id, created_at")
      .eq("survey_id", selectedId)
      .order("created_at", { ascending: true });
    const responseIds = (responses || []).map((r) => r.id);
    if (!responseIds.length) return alert("No responses");
    const { data: answers } = await supabase
      .from("survey_answers")
      .select("response_id, question_id, answer")
      .in("response_id", responseIds);

    const header = ["response_id", "user_id", "created_at", ...questions.map((q) => q.label.replace(/\s+/g, " "))];
    const byResponse: Record<number, any> = {};
    for (const r of responses || []) byResponse[r.id] = { response_id: r.id, user_id: r.user_id || "", created_at: r.created_at };
    for (const a of answers || []) {
      const q = questions.find((qq) => qq.id === a.question_id);
      if (!q) continue;
      const row = byResponse[a.response_id];
      const v = a.answer as any;
      switch (q.type) {
        case "short_text":
        case "long_text":
          row[q.label] = (v?.value ?? "").toString();
          break;
        case "single_choice":
          row[q.label] = v?.type === "other" ? (v?.value ?? "").toString() : (v?.value ?? "").toString();
          break;
        case "multiple_choice":
          row[q.label] = JSON.stringify({ values: v?.values ?? [], otherText: v?.otherText ?? null });
          break;
        case "scale":
          row[q.label] = String(v?.value ?? "");
          break;
      }
    }
    const rows = Object.values(byResponse);
    const csv = [header.join(",")].concat(
      rows.map((r) => header.map((h) => {
        const raw = (r as any)[h] ?? "";
        const s = String(raw);
        const needsQuote = s.includes(",") || s.includes("\n") || s.includes("\"");
        return needsQuote ? `"${s.replace(/\"/g, '""')}"` : s;
      }).join(","))
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "survey_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Umfrageergebnisse</h1>
        <div className="flex items-center gap-2">
          <a className="btn-outline-sm" href="/admin/surveys">Umfragen verwalten</a>
        </div>
      </div>

      <div className="card space-y-3">
        <div>
          <label className="block text-sm mb-1">Umfrage auswählen</label>
          <select className="input" value={selectedId || ""} onChange={(e) => setSelectedId(Number(e.target.value))}>
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Antworten gesamt: {totalResponses}</div>
        <div className="flex items-center gap-2">
          <button className="btn-outline-sm" onClick={() => selectedId && fetchResults(selectedId)}>Aktualisieren</button>
          <button className="btn-outline-sm" onClick={exportCSV}>CSV exportieren</button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm">Ergebnisse laden…</div>
      ) : (
        <div className="grid gap-3">
          {questions.map((q) => {
            const res = questionResults[q.id];
            return (
              <div key={`res_${q.id}`} className="card space-y-2">
                <div className="font-medium">[{q.order_index}] {q.label}</div>
                {!res ? (
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Keine Antworten</div>
                ) : q.type === "scale" ? (
                  <div className="text-sm space-y-1">
                    <div>Beantwortet: {res.answered}</div>
                    <div>Durchschnitt: {res.answered ? (res.sum / res.answered).toFixed(2) : "-"}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      {Array.from({ length: (q.max_value ?? 10) - (q.min_value ?? 1) + 1 }).map((_, idx) => {
                        const v = (q.min_value ?? 1) + idx;
                        const c = res.counts[String(v)] || res.counts[v] || 0;
                        return <div key={v} className="text-xs">{v}: {c}</div>;
                      })}
                    </div>
                  </div>
                ) : q.type === "single_choice" || q.type === "multiple_choice" ? (
                  <div className="text-sm space-y-1">
                    <div>Beantwortet: {res.answered}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {Object.entries(res.counts as Record<string, number>).map(([opt, c]: any) => (
                        <div key={opt} className="text-xs">{opt || "—"}: {c}</div>
                      ))}
                    </div>
                    {res.otherCount > 0 && (
                      <div>
                        <div className="text-xs font-medium">Anderes ({res.otherCount}):</div>
                        <div className="text-xs whitespace-pre-wrap max-h-40 overflow-auto">{res.otherTexts.slice(0, 50).map((t: string, i: number) => `- ${t}`).join("\n")}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">
                    <div>Beantwortet: {res.answered}</div>
                    <div className="text-xs whitespace-pre-wrap max-h-60 overflow-auto mt-1">
                      {res.texts.slice(0, 100).map((t: string, i: number) => `- ${t}`).join("\n")}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


