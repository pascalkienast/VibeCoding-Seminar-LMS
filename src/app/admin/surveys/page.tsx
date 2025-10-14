"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Survey = {
  id: number;
  token: string;
  title: string;
  description: string | null;
  is_anonymous: boolean;
  is_active: boolean;
};

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

export default function AdminSurveysPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [questionResults, setQuestionResults] = useState<Record<number, any>>({});

  // Create survey form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Question form state
  const [qType, setQType] = useState<Question["type"]>("short_text");
  const [qLabel, setQLabel] = useState("");
  const [qDesc, setQDesc] = useState("");
  const [qRequired, setQRequired] = useState(false);
  const [qOptions, setQOptions] = useState("");
  const [qOther, setQOther] = useState(false);
  const [qMin, setQMin] = useState<number>(1);
  const [qMax, setQMax] = useState<number>(10);

  const refreshSurveys = async () => {
    const { data } = await supabase
      .from("surveys")
      .select("id, token, title, description, is_anonymous, is_active")
      .order("id", { ascending: false })
      .limit(50);
    setSurveys(data || []);
  };

  const refreshQuestions = async (surveyId: number) => {
    const { data } = await supabase
      .from("survey_questions")
      .select("id, survey_id, order_index, type, label, description, required, options, min_value, max_value, allow_other")
      .eq("survey_id", surveyId)
      .order("order_index", { ascending: true });
    setQuestions(data || []);
  };

  useEffect(() => { refreshSurveys(); }, []);
  useEffect(() => { if (selectedId) { refreshQuestions(selectedId); fetchResults(selectedId); } else { setQuestions([]); setQuestionResults({}); setTotalResponses(0); } }, [selectedId]);

  const createSurvey = async () => {
    if (!title.trim()) return alert("Title required");
    const { data, error } = await supabase
      .from("surveys")
      .insert({ title, description: description || null, is_anonymous: isAnonymous, is_active: isActive })
      .select("id")
      .single();
    if (error) return alert(error.message);
    setTitle("");
    setDescription("");
    setIsAnonymous(false);
    setIsActive(true);
    await refreshSurveys();
    setSelectedId(data?.id ?? null);
  };

  const toggleActive = async (survey: Survey) => {
    const { error } = await supabase
      .from("surveys")
      .update({ is_active: !survey.is_active })
      .eq("id", survey.id);
    if (error) return alert(error.message);
    await refreshSurveys();
  };

  const deleteSurvey = async (survey: Survey) => {
    if (!confirm("Delete survey and its questions/responses?")) return;
    const { error } = await supabase.from("surveys").delete().eq("id", survey.id);
    if (error) return alert(error.message);
    if (selectedId === survey.id) setSelectedId(null);
    await refreshSurveys();
  };

  const addQuestion = async () => {
    if (!selectedId) return alert("Select a survey first");
    if (!qLabel.trim()) return alert("Label required");
    const order_index = (questions[questions.length - 1]?.order_index ?? 0) + 1;
    const options = qType === "single_choice" || qType === "multiple_choice"
      ? qOptions.split("\n").map((s) => s.trim()).filter(Boolean)
      : null;
    const min_value = qType === "scale" ? qMin : null;
    const max_value = qType === "scale" ? qMax : null;
    const allow_other = qType === "single_choice" || qType === "multiple_choice" ? qOther : false;
    const { error } = await supabase
      .from("survey_questions")
      .insert({
        survey_id: selectedId,
        order_index,
        type: qType,
        label: qLabel,
        description: qDesc || null,
        required: qRequired,
        options,
        min_value,
        max_value,
        allow_other,
      });
    if (error) return alert(error.message);
    setQLabel("");
    setQDesc("");
    setQRequired(false);
    setQOptions("");
    setQOther(false);
    setQMin(1);
    setQMax(10);
    await refreshQuestions(selectedId);
  };

  const removeQuestion = async (q: Question) => {
    if (!confirm("Delete this question?")) return;
    const { error } = await supabase.from("survey_questions").delete().eq("id", q.id);
    if (error) return alert(error.message);
    if (selectedId) await refreshQuestions(selectedId);
  };

  const fetchResults = async (surveyId: number) => {
    setResultsLoading(true);
    try {
      const { data: responses } = await supabase
        .from("survey_responses")
        .select("id, user_id, created_at")
        .eq("survey_id", surveyId)
        .order("created_at", { ascending: true });
      const responseIds = (responses || []).map((r) => r.id);
      setTotalResponses(responseIds.length);
      if (responseIds.length === 0) {
        setQuestionResults({});
        return;
      }
      const { data: answers } = await supabase
        .from("survey_answers")
        .select("response_id, question_id, answer")
        .in("response_id", responseIds);

      const byQ: Record<number, any> = {};
      for (const q of questions) {
        if (q.type === "single_choice" || q.type === "multiple_choice") {
          byQ[q.id] = { counts: new Map<string, number>(), otherTexts: [] as string[], otherCount: 0, answered: 0 };
        } else if (q.type === "scale") {
          byQ[q.id] = { counts: new Map<number, number>(), min: q.min_value ?? 1, max: q.max_value ?? 10, answered: 0, sum: 0 };
        } else {
          byQ[q.id] = { texts: [] as string[], answered: 0 };
        }
      }

      for (const a of answers || []) {
        const bucket = byQ[a.question_id];
        if (!bucket) continue;
        const ans = a.answer as any;
        if (bucket.counts instanceof Map && typeof ans === "object" && ans) {
          // single_choice or multiple_choice
          if (ans.type === "option") {
            const key = String(ans.value ?? "");
            const prev = bucket.counts.get(key) || 0;
            bucket.counts.set(key, prev + 1);
            bucket.answered += 1;
          } else if (ans.type === "other") {
            const text = (ans.value ?? "").toString().trim();
            if (text) bucket.otherTexts.push(text);
            bucket.otherCount += 1;
            bucket.answered += 1;
          } else if (Array.isArray(ans.values)) {
            // multiple_choice
            for (const v of ans.values) {
              const key = String(v);
              const prev = bucket.counts.get(key) || 0;
              bucket.counts.set(key, prev + 1);
            }
            if (ans.otherText) {
              const text = String(ans.otherText);
              bucket.otherTexts.push(text);
              bucket.otherCount += 1;
            }
            bucket.answered += 1;
          }
        } else if (bucket.counts instanceof Map && typeof ans?.value === "number") {
          // scale
          const v = ans.value as number;
          const prev = bucket.counts.get(v) || 0;
          bucket.counts.set(v, prev + 1);
          bucket.sum += v;
          bucket.answered += 1;
        } else if (typeof ans?.value === "string") {
          // text
          const t = ans.value.toString();
          bucket.texts.push(t);
          bucket.answered += 1;
        }
      }

      // serialize Maps to arrays for rendering
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
      setResultsLoading(false);
    }
  };

  const exportCSV = async () => {
    if (!selectedId) return;
    // Fetch responses and answers, build wide CSV
    const { data: responses } = await supabase
      .from("survey_responses")
      .select("id, user_id, created_at")
      .eq("survey_id", selectedId)
      .order("created_at", { ascending: true });
    const responseIds = (responses || []).map((r) => r.id);
    if (responseIds.length === 0) return alert("No responses");
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
      <h1 className="text-2xl font-semibold">Admin · Surveys</h1>

      <div className="card space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
            <span className="text-sm">Anonymous</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="text-sm">Active</span>
          </label>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <button className="btn w-fit" onClick={createSurvey}>Create Survey</button>
      </div>

      <div className="grid gap-3">
        {surveys.map((s) => (
          <div key={s.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{s.title}</div>
              <div className="flex items-center gap-2">
                <button className="btn-outline-sm" onClick={() => setSelectedId(s.id)}>
                  {selectedId === s.id ? "Selected" : "Edit"}
                </button>
                <button className="btn-outline-sm" onClick={() => toggleActive(s)}>
                  {s.is_active ? "Deactivate" : "Activate"}
                </button>
                <button className="btn-outline-sm" onClick={() => deleteSurvey(s)}>Delete</button>
              </div>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Token: &lt;Umfrage{s.token}&gt; · {s.is_anonymous ? "Anonymous" : "Non-anonymous"} · {s.is_active ? "Active" : "Inactive"}
            </div>

            {selectedId === s.id && (
              <div className="border-t pt-3 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm mb-1">Type</label>
                    <select className="input" value={qType} onChange={(e) => setQType(e.target.value as any)}>
                      <option value="short_text">Kurztext</option>
                      <option value="long_text">Langtext</option>
                      <option value="single_choice">Single Choice</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="scale">Skala</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Label</label>
                    <input className="input" value={qLabel} onChange={(e) => setQLabel(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Description</label>
                    <input className="input" value={qDesc} onChange={(e) => setQDesc(e.target.value)} />
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={qRequired} onChange={(e) => setQRequired(e.target.checked)} />
                    <span className="text-sm">Required</span>
                  </label>
                  {(qType === "single_choice" || qType === "multiple_choice") && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm mb-1">Options (one per line)</label>
                      <textarea className="textarea" value={qOptions} onChange={(e) => setQOptions(e.target.value)} />
                      <label className="inline-flex items-center gap-2 mt-2">
                        <input type="checkbox" checked={qOther} onChange={(e) => setQOther(e.target.checked)} />
                        <span className="text-sm">Allow "Other" free text</span>
                      </label>
                    </div>
                  )}
                  {qType === "scale" && (
                    <>
                      <div>
                        <label className="block text-sm mb-1">Min</label>
                        <input className="input" type="number" value={qMin} onChange={(e) => setQMin(Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Max</label>
                        <input className="input" type="number" value={qMax} onChange={(e) => setQMax(Number(e.target.value))} />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn" onClick={addQuestion}>Add Question</button>
                </div>

                <div className="grid gap-2">
                  {questions.map((q) => (
                    <div key={q.id} className="border p-2 rounded-md flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium">[{q.order_index}] {q.label}</div>
                        <div className="text-neutral-600 dark:text-neutral-400">
                          {q.type} {q.required ? "· required" : ""}
                        </div>
                      </div>
                      <button className="btn-outline-sm" onClick={() => removeQuestion(q)}>Delete</button>
                    </div>
                  ))}
                </div>

                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Results</div>
                    <div className="flex items-center gap-2">
                      <button className="btn-outline-sm" onClick={() => selectedId && fetchResults(selectedId)}>Refresh</button>
                      <button className="btn-outline-sm" onClick={exportCSV}>Export CSV</button>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Total responses: {totalResponses}</div>
                  {resultsLoading ? (
                    <div className="text-sm">Loading results…</div>
                  ) : (
                    <div className="grid gap-3">
                      {questions.map((q) => {
                        const res = questionResults[q.id];
                        return (
                          <div key={`res_${q.id}`} className="border p-2 rounded-md">
                            <div className="font-medium">[{q.order_index}] {q.label}</div>
                            {!res ? (
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">No answers</div>
                            ) : q.type === "scale" ? (
                              <div className="text-sm mt-1 space-y-1">
                                <div>Answered: {res.answered}</div>
                                <div>Average: {res.answered ? (res.sum / res.answered).toFixed(2) : "-"}</div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-1">
                                  {Array.from({ length: (q.max_value ?? 10) - (q.min_value ?? 1) + 1 }).map((_, idx) => {
                                    const v = (q.min_value ?? 1) + idx;
                                    const c = res.counts[String(v)] || res.counts[v] || 0;
                                    return <div key={v} className="text-xs">{v}: {c}</div>;
                                  })}
                                </div>
                              </div>
                            ) : q.type === "single_choice" || q.type === "multiple_choice" ? (
                              <div className="text-sm mt-1 space-y-1">
                                <div>Answered: {res.answered}</div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                  {Object.entries(res.counts as Record<string, number>).map(([opt, c]: any) => (
                                    <div key={opt} className="text-xs">{opt || "—"}: {c}</div>
                                  ))}
                                </div>
                                {res.otherCount > 0 && (
                                  <div className="mt-1">
                                    <div className="text-xs font-medium">Other ({res.otherCount}):</div>
                                    <div className="text-xs whitespace-pre-wrap max-h-40 overflow-auto">{res.otherTexts.slice(0, 20).map((t: string, i: number) => `- ${t}`).join("\n")}</div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm mt-1">
                                <div>Answered: {res.answered}</div>
                                <div className="text-xs whitespace-pre-wrap max-h-60 overflow-auto mt-1">
                                  {res.texts.slice(0, 50).map((t: string, i: number) => `- ${t}`).join("\n")}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


