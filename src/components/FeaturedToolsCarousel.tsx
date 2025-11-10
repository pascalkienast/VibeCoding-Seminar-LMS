"use client";

import { useState, useEffect } from "react";
import YouTubeEmbed from "./YouTubeEmbed";

type FeaturedTool = {
  id: number;
  title: string;
  description: string;
  long_description: string | null;
  youtube_url: string | null;
  links: Array<{ label: string; url: string }>;
  image_url: string | null;
  sort_order: number;
};

type Props = {
  tools: FeaturedTool[];
};

export default function FeaturedToolsCarousel({ tools }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || tools.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tools.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, tools.length]);

  if (tools.length === 0) return null;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tools.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Hervorgehobene Tools</h2>
      
      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
        {/* Render all slides at once, but only show the current one */}
        {tools.map((tool, idx) => (
          <div
            key={tool.id}
            className={`transition-opacity duration-500 ${
              idx === currentIndex ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
            }`}
          >
            <div className="p-6 md:p-8 lg:p-10">
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {/* Left side: Image/Video */}
                <div className="space-y-4">
                  {tool.image_url && (
                    <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                      <img
                        src={tool.image_url}
                        alt={tool.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {tool.youtube_url && (
                    <div className="rounded-lg overflow-hidden">
                      <YouTubeEmbed url={tool.youtube_url} />
                    </div>
                  )}
                </div>

                {/* Right side: Content */}
                <div className="flex flex-col justify-center space-y-4">
                  <h3 className="text-3xl font-bold">{tool.title}</h3>
                  
                  <p className="text-lg text-neutral-700 dark:text-neutral-300">
                    {tool.description}
                  </p>

                  {tool.long_description && (
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {tool.long_description}
                      </p>
                    </div>
                  )}

                  {tool.links && tool.links.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {tool.links.map((link, linkIdx) => (
                        <a
                          key={linkIdx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls */}
        {tools.length > 1 && (
          <>
            {/* Arrow buttons */}
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-900 rounded-full p-2 shadow-lg transition-all z-10"
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-900 rounded-full p-2 shadow-lg transition-all z-10"
              aria-label="Next"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {tools.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-blue-600 dark:bg-blue-400 w-8"
                      : "bg-neutral-400 dark:bg-neutral-600 hover:bg-neutral-500 dark:hover:bg-neutral-500"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

