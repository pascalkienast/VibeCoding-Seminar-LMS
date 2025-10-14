import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

interface Params { params: { week_number: string } }

export const dynamic = "force-dynamic";

export default async function WeekDetail({ params }: Params) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);
  const n = Number(params.week_number);
  const { data } = await supabase
    .from("weeks")
    .select("week_number, title, body")
    .eq("week_number", n)
    .single();

  if (!data) return <div className="prose dark:prose-invert">Not found</div>;

  const prev = data.week_number - 1;
  const next = data.week_number + 1;

  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>Woche {data.week_number}: {data.title}</h1>
      <ReactMarkdown>{data.body || ""}</ReactMarkdown>

      <div className="flex gap-2 mt-6">
        <a className="btn-outline" href={`/lehrplan/${prev}`}>← Prev</a>
        <a className="btn-outline" href={`/lehrplan/${next}`}>Next →</a>
      </div>
    </article>
  );
}


