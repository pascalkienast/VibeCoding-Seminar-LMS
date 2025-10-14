"use client";

import ReactMarkdown from "react-markdown";
import SurveyEmbed from "@/components/SurveyEmbed";

export default function MarkdownWithSurveys({ markdown }: { markdown: string }) {
  const parts: Array<{ type: "md"; content: string } | { type: "survey"; token: string }> = [];

  const regex = /<Umfrage([A-Za-z0-9_-]+)>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const index = match.index;
    const before = markdown.slice(lastIndex, index);
    if (before) parts.push({ type: "md", content: before });
    const token = match[1];
    parts.push({ type: "survey", token });
    lastIndex = index + match[0].length;
  }
  const tail = markdown.slice(lastIndex);
  if (tail) parts.push({ type: "md", content: tail });

  return (
    <div className="space-y-4">
      {parts.map((p, i) =>
        p.type === "md" ? (
          <ReactMarkdown key={`md_${i}`}>{p.content}</ReactMarkdown>
        ) : (
          <SurveyEmbed key={`sv_${i}`} token={p.token} />
        )
      )}
    </div>
  );
}


