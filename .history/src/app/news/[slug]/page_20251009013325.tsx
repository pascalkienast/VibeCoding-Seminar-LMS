import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

interface Params { params: { slug: string } }

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: Params) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const { data } = await supabase
    .from("news")
    .select("title, body, is_public, published_at")
    .eq("slug", params.slug)
    .single();

  if (!data) return <div className="prose dark:prose-invert">Not found</div>;

  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>{data.title}</h1>
      <ReactMarkdown>{data.body}</ReactMarkdown>
      {data.is_public && (
        <div className="mt-6 p-4 border rounded-lg">
          <p>Enjoyed this article? Register to get access to the course.</p>
          <a className="btn mt-2 inline-block" href="/register">Register</a>
        </div>
      )}
    </article>
  );
}


