import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
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

async function getAllTags(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("decisions")
    .select("tags")
    .eq("user_id", userId);
  if (!data) return [];
  const tagSet = new Set<string>();
  for (const row of data) {
    for (const tag of row.tags ?? []) tagSet.add(tag);
  }
  return Array.from(tagSet).sort();
}

async function getDecisions(
  q: string,
  tag: string,
  userId: string
): Promise<{ decisions: Decision[]; error: string | null }> {
  if (q) {
    const { data, error } = await supabase
      .rpc("search_decisions", { search_query: q })
      .select("id, created_at, project, decision, tags, outcome")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then((res) => {
        if (tag && res.data) {
          const dataArray = Array.isArray(res.data) ? res.data : [res.data];
          return { ...res, data: dataArray.filter((d: Decision) => d.tags?.includes(tag)) };
        }
        return res;
      });
    return {
      decisions: (data as Decision[]) ?? [],
      error: error?.message ?? null,
    };
  }

  let query = supabase
    .from("decisions")
    .select("id, created_at, project, decision, tags, outcome")
    .eq("user_id", userId)
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
  const { userId } = await auth();
  if (!userId) return null;

  const { q = "", tag = "" } = await searchParams;

  const [allTags, { decisions, error }] = await Promise.all([
    getAllTags(userId),
    getDecisions(q, tag, userId),
  ]);

  const hasFilters = !!q || !!tag;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>

      {/* Editorial masthead */}
      <div style={{ borderBottom: "3px solid #1A1A1A" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-6 mb-4">
                <span
                  className="text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
                >
                  Engineering
                </span>
                <span style={{ color: "#D6CFC4", fontSize: "10px" }}>—</span>
                <span
                  className="text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
                >
                  {decisions.length} {decisions.length === 1 ? "Record" : "Records"}
                  {hasFilters ? " Found" : ""}
                </span>
              </div>
              <h1
                className="text-6xl md:text-8xl leading-none tracking-tight"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "#1A1A1A",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Decision
                <br />
                Log
              </h1>
            </div>
            <div className="flex flex-col items-end justify-between h-full gap-6 pt-1">
              <Link
                href="/decisions/new"
                className="px-6 py-3 text-xs tracking-[0.15em] uppercase border-2 transition-all duration-200 hover:bg-[#1A1A1A] hover:text-[#FAFAF8]"
                style={{
                  borderColor: "#1A1A1A",
                  color: "#1A1A1A",
                  fontFamily: "var(--font-inter)",
                }}
              >
                + New Entry
              </Link>
              <p
                className="text-xs text-right leading-relaxed max-w-[180px]"
                style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
              >
                A personal record of architectural decisions and their outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">

        {/* Search + filters */}
        <div
          className="py-6"
          style={{ borderBottom: "1px solid #D6CFC4" }}
        >
          <Suspense fallback={null}>
            <SearchControls allTags={allTags} currentQuery={q} currentTag={tag} />
          </Suspense>
        </div>

        {/* Error */}
        {error && (
          <div
            className="border p-5 text-sm my-8"
            style={{ borderColor: "#C9A9A6", backgroundColor: "#F9EFEE", color: "#8B3A3A" }}
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!error && decisions.length === 0 && (
          <div className="py-32 text-center">
            <p
              className="text-3xl mb-6"
              style={{ fontFamily: "var(--font-playfair)", color: "#C4B9AE", fontWeight: 700 }}
            >
              {hasFilters ? "No matching records." : "Nothing logged yet."}
            </p>
            <p className="text-sm mb-8" style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}>
              {hasFilters ? "Try adjusting your filters." : "Start documenting your thinking."}
            </p>
            {hasFilters ? (
              <Link href="/" className="text-xs tracking-[0.15em] uppercase underline underline-offset-4" style={{ color: "#8C7B6B" }}>
                Clear filters
              </Link>
            ) : (
              <Link
                href="/decisions/new"
                className="px-6 py-3 text-xs tracking-[0.15em] uppercase border-2 transition-all duration-200 hover:bg-[#1A1A1A] hover:text-[#FAFAF8]"
                style={{ borderColor: "#1A1A1A", color: "#1A1A1A", fontFamily: "var(--font-inter)" }}
              >
                + New Entry
              </Link>
            )}
          </div>
        )}

        {/* Decision list */}
        <ul>
          {decisions.map((d, i) => (
            <li
              key={d.id}
              style={{ borderBottom: "1px solid #D6CFC4" }}
            >
              <Link
                href={`/decisions/${d.id}`}
                className="group grid py-10 transition-all duration-200"
                style={{ gridTemplateColumns: "4rem 1fr auto" }}
              >
                {/* Large index number */}
                <div className="pt-1">
                  <span
                    className="text-4xl font-bold leading-none tabular-nums"
                    style={{
                      fontFamily: "var(--font-playfair)",
                      color: "#EDE8E0",
                      fontWeight: 900,
                    }}
                  >
                    {String(decisions.length - i).padStart(2, "0")}
                  </span>
                </div>

                {/* Main content */}
                <div className="pr-8">
                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className="text-[10px] tracking-[0.25em] uppercase font-semibold"
                      style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
                    >
                      {d.project}
                    </span>
                    <span style={{ color: "#D6CFC4", fontSize: "10px" }}>·</span>
                    <span
                      className="text-[11px]"
                      style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}
                    >
                      {formatDate(d.created_at)}
                    </span>
                    {d.outcome && (
                      <span
                        className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 font-semibold"
                        style={{
                          backgroundColor: "#8C7B6B",
                          color: "#FAFAF8",
                          fontFamily: "var(--font-inter)",
                        }}
                      >
                        Resolved
                      </span>
                    )}
                  </div>

                  {/* Decision title */}
                  <p
                    className="text-2xl md:text-3xl leading-tight mb-4 group-hover:opacity-60 transition-opacity duration-200"
                    style={{
                      fontFamily: "var(--font-playfair)",
                      color: "#1A1A1A",
                      fontWeight: 700,
                    }}
                  >
                    {d.decision}
                  </p>

                  {/* Tags */}
                  {d.tags && d.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {d.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] tracking-[0.15em] uppercase px-3 py-1"
                          style={{
                            backgroundColor: t === tag ? "#1A1A1A" : "#EDE8E0",
                            color: t === tag ? "#FAFAF8" : "#8C7B6B",
                            fontFamily: "var(--font-inter)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex items-center">
                  <span
                    className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1"
                    style={{ color: "#8C7B6B" }}
                  >
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}