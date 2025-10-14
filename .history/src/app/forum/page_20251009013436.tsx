import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function ForumCategories() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const { data } = await supabase
    .from("forum_categories")
    .select("id, slug, title, description")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Forum</h1>
      <div className="grid gap-3">
        {(data || []).map((c) => (
          <a key={c.id} href={`/forum/c/${c.slug}`} className="card block">
            <h2 className="font-medium">{c.title}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{c.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}


