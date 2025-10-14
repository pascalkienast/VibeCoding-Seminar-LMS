import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const { data } = await supabase
    .from("news")
    .select("id, slug, title, excerpt, is_public, published_at")
    .or("is_public.eq.true,author_id.not.is.null")
    .order("published_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">News</h1>
      <div className="grid gap-3">
        {(data || []).map((n) => (
          <a key={n.id} href={`/news/${n.slug}`} className="card block">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{n.title}</h2>
              {!n.is_public && (
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">members</span>
              )}
            </div>
            {n.excerpt && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{n.excerpt}</p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}


