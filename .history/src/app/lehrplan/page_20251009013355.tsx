import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function WeeksPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);
  const { data } = await supabase
    .from("weeks")
    .select("week_number, title, date, is_published")
    .eq("is_published", true)
    .order("week_number", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Lehrplan</h1>
      <div className="grid gap-3">
        {(data || []).map((w) => (
          <a key={w.week_number} href={`/lehrplan/${w.week_number}`} className="card block">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Woche {w.week_number}: {w.title}</h2>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


