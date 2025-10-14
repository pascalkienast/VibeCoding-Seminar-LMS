import { createClient } from "@supabase/supabase-js";

interface Params { params: { slug: string } }

export default async function CategoryTopics({ params }: Params) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const { data: category } = await supabase
    .from("forum_categories")
    .select("id, title")
    .eq("slug", params.slug)
    .single();

  if (!category) return <div className="prose dark:prose-invert">Not found</div>;

  const { data: topics } = await supabase
    .from("forum_topics")
    .select("id, title, is_locked, is_pinned, last_post_at")
    .eq("category_id", category.id)
    .order("is_pinned", { ascending: false })
    .order("last_post_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{category.title}</h1>
      <div className="grid gap-3">
        {(topics || []).map((t) => (
          <a key={t.id} href={`/forum/t/${t.id}`} className="card block">
            <h2 className="font-medium">{t.title}</h2>
          </a>
        ))}
      </div>
    </div>
  );
}


