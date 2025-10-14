import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">News</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">Public articles appear here. Tap an article to open its public detail page.</p>
      <div className="grid gap-3">
        <div className="card">
          <h2 className="font-medium">Welcome to Vibe Coding</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">This is a placeholder. Add content from Supabase `news`.</p>
          <a className="underline text-sm" href="/login">Login</a>
          <span className="mx-1">·</span>
          <a className="underline text-sm" href="/register">Register</a>
        </div>
      </div>
    </div>
  );
}
