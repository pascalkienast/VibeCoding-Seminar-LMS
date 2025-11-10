"use client";

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Just VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // If it's already just an ID (11 characters, no special chars)
  if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }

  // Match youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Match youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Match youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

export default function YouTubeEmbed({ url, title = "YouTube video" }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">
          Ungültige YouTube-URL: {url}
        </p>
      </div>
    );
  }

  return (
    <div className="not-prose my-6">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg border-2 border-neutral-300 dark:border-neutral-700"
        />
      </div>
    </div>
  );
}

