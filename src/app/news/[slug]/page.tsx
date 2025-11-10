import { createClient } from "@supabase/supabase-js";
import MarkdownWithSurveys from "@/components/MarkdownWithSurveys";
import ShowWhenLoggedOut from "@/components/ShowWhenLoggedOut";
import YouTubeEmbed from "@/components/YouTubeEmbed";

interface Params { params: { slug: string } }

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: Params) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const { data } = await supabase
    .from("news")
    .select("title, body, is_public, published_at, is_html, youtube_url")
    .eq("slug", params.slug)
    .single();

  if (!data) return <div className="prose dark:prose-invert">Nicht gefunden</div>;

  // If content is HTML, render it directly in an iframe or as HTML
  if (data.is_html && data.body) {
    return (
      <article className="w-full">
        <div className="mb-4">
          <a href="/news" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Zurück zu News</a>
        </div>
        <div 
          className="w-full" 
          dangerouslySetInnerHTML={{ __html: data.body }} 
        />
        {data.is_public && (
          <ShowWhenLoggedOut>
            <div className="mt-6 p-4 border rounded-lg">
              <p className="text-sm">Hat dir dieser Artikel gefallen? Registriere dich, um Zugang zum Kurs zu erhalten.</p>
              <a className="btn mt-2 inline-block" href="/register">Registrieren</a>
            </div>
          </ShowWhenLoggedOut>
        )}
      </article>
    );
  }

  // Default markdown rendering
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>{data.title}</h1>
      {data.youtube_url && <YouTubeEmbed url={data.youtube_url} title={data.title} />}
      <MarkdownWithSurveys markdown={data.body || ""} />
      {data.is_public && (
        <ShowWhenLoggedOut>
          <div className="not-prose mt-6 p-4 border rounded-lg">
            <p className="text-sm">Hat dir dieser Artikel gefallen? Registriere dich, um Zugang zum Kurs zu erhalten.</p>
            <a className="btn mt-2 inline-block" href="/register">Registrieren</a>
          </div>
        </ShowWhenLoggedOut>
      )}
    </article>
  );
}


