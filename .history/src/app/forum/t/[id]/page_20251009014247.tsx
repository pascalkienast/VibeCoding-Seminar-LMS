import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

interface Params { params: { id: string } }

export default async function TopicDetail({ params }: Params) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const id = Number(params.id);
  const { data: topic } = await supabase
    .from("forum_topics")
    .select("id, title")
    .eq("id", id)
    .single();
  if (!topic) return <div className="prose dark:prose-invert">Topic not found</div>;

  const { data: posts } = await supabase
    .from("forum_posts")
    .select("id, body, created_at, author_id")
    .eq("topic_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{topic.title}</h1>
      <div className="grid gap-3">
        {(posts || []).map((p) => (
          <div className="card" key={p.id}>
            <div className="text-xs text-neutral-500 mb-2">{new Date(p.created_at).toLocaleString()}</div>
            <div className="prose dark:prose-invert">
              <ReactMarkdown>{p.body}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Login to reply.</p>
      </div>
    </div>
  );
}


