"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface SearchControlsProps {
  allTags: string[];
  currentQuery: string;
  currentTag: string;
}

export default function SearchControls({
  allTags,
  currentQuery,
  currentTag,
}: SearchControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const pushParams = useCallback(
    (q: string, tag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q); else params.delete("q");
      if (tag) params.set("tag", tag); else params.delete("tag");
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
      pushParams(q, currentTag);
    },
    [currentTag, pushParams]
  );

  const handleTagClick = useCallback(
    (tag: string) => {
      pushParams(currentQuery, currentTag === tag ? "" : tag);
    },
    [currentQuery, currentTag, pushParams]
  );

  const hasFilters = !!currentQuery || !!currentTag;

  return (
    <div
      className="space-y-4 transition-opacity duration-300"
      style={{ opacity: isPending ? 0.5 : 1 }}
    >
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "#8C7B6B" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            name="q"
            defaultValue={currentQuery}
            placeholder="Search decisions…"
            className="w-full pl-11 pr-4 py-2.5 text-sm border bg-white/60 focus:outline-none focus:bg-white transition-all duration-200"
            style={{
              borderColor: "#D6CFC4",
              color: "#1A1A1A",
              fontFamily: "var(--font-inter)",
            }}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm border transition-all duration-200 hover:bg-[#8C7B6B] hover:text-white hover:border-[#8C7B6B]"
          style={{
            borderColor: "#8C7B6B",
            color: "#8C7B6B",
            fontFamily: "var(--font-inter)",
          }}
        >
          Search
        </button>
      </form>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-xs tracking-wider uppercase mr-1"
            style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
          >
            Filter by tag
          </span>
          {allTags.map((tag) => {
            const active = currentTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1 text-xs tracking-wide border transition-all duration-200 focus:outline-none"
                style={{
                  fontFamily: "var(--font-inter)",
                  borderColor: active ? "#8C7B6B" : "#D6CFC4",
                  backgroundColor: active ? "#8C7B6B" : "transparent",
                  color: active ? "#FAFAF8" : "#8C7B6B",
                }}
              >
                {tag}
              </button>
            );
          })}

          {hasFilters && (
            <button
              type="button"
              onClick={() => pushParams("", "")}
              className="ml-auto text-xs underline underline-offset-2 transition-colors duration-200"
              style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Active filter summary */}
      {hasFilters && (
        <p className="text-xs" style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}>
          {currentQuery && <>Searching for &ldquo;<em>{currentQuery}</em>&rdquo;</>}
          {currentQuery && currentTag && <span className="mx-1">·</span>}
          {currentTag && <>tagged &ldquo;<em>{currentTag}</em>&rdquo;</>}
          {!allTags.length && (
            <>
              {" — "}
              <button
                onClick={() => pushParams("", "")}
                className="underline underline-offset-2"
              >
                clear
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}