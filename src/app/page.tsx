import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Suspense } from "react";
import SearchControls from "./SearchControls";

interface Decision {
  id: string;
  created_at: string;
  project: string;
  decision: string;
  tags?: string[];
  outcome?: string;
}

interface PageProps {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getAllTags(): Promise<string[]> {
  const { data } = await supabase.from("decisions").select("tags");
  if (!data) return [];
  const tagSet = new Set<string>();
  for (const row of data) {
    for (const tag of row.tags ?? []) tagSet.add(tag);
  }
  return Array.from(tagSet).sort();
}

async function getDecisions(
  q: string,
  tag: string
): Promise<{ decisions: Decision[]; error: string | null }> {
  // When searching, use the rpc function that hits the GIN index expression directly.
  // When not searching, query the table directly.
  if (q) {
    const { data, error } = await supabase
      .rpc("search_decisions", { search_query: q })
      .select("id, created_at, project, decision, tags, outcome")
      .order("created_at", { ascending: false })
      .then((res) => {
        // Apply tag filter client-side on rpc results if needed
        if (tag && res.data) {
          return { ...res, data: res.data.filter((d: Decision) => d.tags?.includes(tag)) };
        }
        return res;
      });
    return {
      decisions: (data as Decision[]) ?? [],
      error: error?.message ?? null,
    };
  }

  // No search query — use regular table query
  let query = supabase
    .from("decisions")
    .select("id, created_at, project, decision, tags, outcome")
    .order("created_at", { ascending: false });

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, error } = await query;
  return {
    decisions: (data as Decision[]) ?? [],
    error: error?.message ?? null,
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const { q = "", tag = "" } = await searchParams;

  const [allTags, { decisions, error }] = await Promise.all([
    getAllTags(),
    getDecisions(q, tag),
  ]);

  const hasFilters = !!q || !!tag;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#F5F0E8", fontFamily: "var(--font-inter)" }}
    >
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">

        {/* Masthead */}
        <header className="mb-16 md:mb-20">
          <div className="flex items-end justify-between border-b pb-8" style={{ borderColor: "#D6CFC4" }}>
            <div>
              <p
                className="text-xs tracking-[0.2em] uppercase mb-3"
                style={{ color: "#8C7B6B" }}
              >
                Engineering
              </p>
              <h1
                className="text-5xl md:text-6xl leading-none"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "#1A1A1A",
                  fontWeight: 700,
                }}
              >
                Decision Log
              </h1>
            </div>
            <div className="flex items-center gap-4 pb-1">
              <span className="text-sm" style={{ color: "#8C7B6B" }}>
                {decisions.length} {decisions.length === 1 ? "record" : "records"}
                {hasFilters ? " found" : ""}
              </span>
              <Link
                href="/decisions/new"
                className="px-5 py-2.5 text-sm border transition-all duration-200 hover:bg-[#1A1A1A] hover:text-[#FAFAF8] hover:border-[#1A1A1A]"
                style={{ borderColor: "#1A1A1A", color: "#1A1A1A" }}
              >
                New Decision
              </Link>
            </div>
          </div>
        </header>

        {/* Search + filters */}
        <section className="mb-12">
          <Suspense fallback={null}>
            <SearchControls
              allTags={allTags}
              currentQuery={q}
              currentTag={tag}
            />
          </Suspense>
        </section>

        {/* Error */}
        {error && (
          <div
            className="border p-5 text-sm mb-8"
            style={{ borderColor: "#C9A9A6", backgroundColor: "#F9EFEE", color: "#8B3A3A" }}
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!error && decisions.length === 0 && (
          <div className="py-24 text-center">
            <p
              className="text-xl mb-4"
              style={{ fontFamily: "var(--font-playfair)", color: "#8C7B6B" }}
            >
              {hasFilters ? "No decisions match your filters." : "No decisions yet."}
            </p>
            {hasFilters ? (
              <Link
                href="/"
                className="text-sm underline underline-offset-4"
                style={{ color: "#8C7B6B" }}
              >
                Clear filters
              </Link>
            ) : (
              <Link
                href="/decisions/new"
                className="text-sm underline underline-offset-4"
                style={{ color: "#8C7B6B" }}
              >
                Record your first decision
              </Link>
            )}
          </div>
        )}

        {/* Decision list */}
        <ul className="divide-y" style={{ borderColor: "#D6CFC4" }}>
          {decisions.map((d, i) => (
            <li key={d.id}>
              <Link
                href={`/decisions/${d.id}`}
                className="group flex flex-col md:flex-row md:items-start gap-4 md:gap-8 py-8 transition-all duration-200"
              >
                {/* Index number */}
                <span
                  className="hidden md:block text-xs pt-1 w-8 shrink-0 tabular-nums"
                  style={{ color: "#C4B9AE" }}
                >
                  {String(decisions.length - i).padStart(2, "0")}
                </span>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <span
                      className="text-xs tracking-[0.15em] uppercase"
                      style={{ color: "#8C7B6B" }}
                    >
                      {d.project}
                    </span>
                    <span className="text-xs" style={{ color: "#C4B9AE" }}>
                      {formatDate(d.created_at)}
                    </span>
                    {d.outcome && (
                      <span
                        className="text-[10px] tracking-wider uppercase px-2 py-0.5 border"
                        style={{ borderColor: "#8C7B6B", color: "#8C7B6B" }}
                      >
                        Resolved
                      </span>
                    )}
                  </div>

                  <p
                    className="text-lg leading-snug mb-3 group-hover:opacity-70 transition-opacity duration-200"
                    style={{ color: "#1A1A1A" }}
                  >
                    {d.decision}
                  </p>

                  {/* Tags */}
                  {d.tags && d.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {d.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] tracking-wide px-2 py-0.5"
                          style={{
                            backgroundColor: t === tag ? "#8C7B6B" : "#EDE8E0",
                            color: t === tag ? "#FAFAF8" : "#8C7B6B",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <span
                  className="hidden md:block text-sm pt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: "#8C7B6B" }}
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}