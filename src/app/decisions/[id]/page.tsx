import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface Decision {
  id: string;
  created_at: string;
  project: string;
  context: string;
  decision: string;
  reasoning: string;
  options_considered?: string[];
  trade_offs?: string;
  outcome?: string;
  tags?: string[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function deleteDecision(id: string) {
  "use server";
  const { auth } = await import('@clerk/nextjs/server')
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from("decisions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  redirect("/");
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Section({ label, number, children }: { label: string; number: string; children: React.ReactNode }) {
  return (
    <div
      className="grid py-10 border-b"
      style={{ gridTemplateColumns: "3rem 1fr", gap: "1.5rem", borderColor: "#D6CFC4" }}
    >
      <div className="pt-0.5">
        <span
          className="text-2xl font-bold leading-none"
          style={{ fontFamily: "var(--font-playfair)", color: "#EDE8E0", fontWeight: 900 }}
        >
          {number}
        </span>
      </div>
      <div>
        <p
          className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-4"
          style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
        >
          {label}
        </p>
        <div
          className="text-base leading-relaxed"
          style={{ color: "#1A1A1A", fontFamily: "var(--font-inter)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default async function DecisionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return notFound();

  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) notFound();

  const decision = data as Decision;
  const deleteDecisionWithId = deleteDecision.bind(null, decision.id);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>

      {/* Masthead */}
      <div style={{ borderBottom: "3px solid #1A1A1A" }}>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className="text-[10px] tracking-[0.3em] uppercase font-semibold"
                  style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
                >
                  {decision.project}
                </span>
                <span style={{ color: "#D6CFC4" }}>—</span>
                <span
                  className="text-[10px]"
                  style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}
                >
                  {formatDate(decision.created_at)}
                </span>
                {decision.outcome && (
                  <span
                    className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 font-semibold"
                    style={{ backgroundColor: "#8C7B6B", color: "#FAFAF8", fontFamily: "var(--font-inter)" }}
                  >
                    Resolved
                  </span>
                )}
              </div>
              <h1
                className="text-4xl md:text-5xl leading-tight"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "#1A1A1A",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                {decision.decision}
              </h1>
              {decision.tags && decision.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {decision.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-[0.15em] uppercase px-3 py-1"
                      style={{ backgroundColor: "#EDE8E0", color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-4 shrink-0">
              <Link
                href="/"
                className="text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 transition-opacity duration-200 hover:opacity-60"
                style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All Decisions
              </Link>
              <Link
                href={`/decisions/${decision.id}/edit`}
                className="px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase border-2 font-semibold transition-all duration-200 hover:bg-[#1A1A1A] hover:text-[#FAFAF8]"
                style={{ borderColor: "#1A1A1A", color: "#1A1A1A", fontFamily: "var(--font-inter)" }}
              >
                Edit →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        <article>
          <Section number="01" label="Context">{decision.context}</Section>
          <Section number="02" label="Reasoning">{decision.reasoning}</Section>

          {decision.options_considered && decision.options_considered.length > 0 && (
            <div
              className="grid py-10 border-b"
              style={{ gridTemplateColumns: "3rem 1fr", gap: "1.5rem", borderColor: "#D6CFC4" }}
            >
              <div className="pt-0.5">
                <span
                  className="text-2xl font-bold leading-none"
                  style={{ fontFamily: "var(--font-playfair)", color: "#EDE8E0", fontWeight: 900 }}
                >
                  03
                </span>
              </div>
              <div>
                <p
                  className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-4"
                  style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
                >
                  Options Considered
                </p>
                <ol className="space-y-4">
                  {decision.options_considered.map((opt, i) => (
                    <li key={i} className="flex gap-4 text-base leading-relaxed" style={{ color: "#1A1A1A" }}>
                      <span
                        className="shrink-0 tabular-nums text-sm pt-0.5"
                        style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}
                      >
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      <span style={{ fontFamily: "var(--font-inter)" }}>{opt}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {decision.trade_offs && (
            <Section number="04" label="Trade-offs">{decision.trade_offs}</Section>
          )}

          {decision.outcome ? (
            <div
              className="mt-12 p-8 border-2"
              style={{ borderColor: "#1A1A1A", backgroundColor: "#FAFAF8" }}
            >
              <div className="flex items-center justify-between mb-6">
                <p
                  className="text-[10px] tracking-[0.25em] uppercase font-semibold"
                  style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
                >
                  Outcome
                </p>
                <span
                  className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 font-semibold"
                  style={{ backgroundColor: "#8C7B6B", color: "#FAFAF8", fontFamily: "var(--font-inter)" }}
                >
                  Resolved
                </span>
              </div>
              <p
                className="text-lg leading-relaxed"
                style={{ fontFamily: "var(--font-playfair)", color: "#1A1A1A" }}
              >
                {decision.outcome}
              </p>
            </div>
          ) : (
            <div
              className="mt-12 p-8 border-2 border-dashed flex flex-col md:flex-row md:items-center justify-between gap-6"
              style={{ borderColor: "#D6CFC4" }}
            >
              <div>
                <p
                  className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-2"
                  style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
                >
                  Outcome
                </p>
                <p className="text-sm" style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}>
                  Not yet recorded — this decision is still open.
                </p>
              </div>
              <Link
                href={`/decisions/${decision.id}/edit`}
                className="shrink-0 px-6 py-3 text-[10px] tracking-[0.2em] uppercase border-2 font-semibold transition-all duration-200 hover:bg-[#8C7B6B] hover:text-[#FAFAF8]"
                style={{ borderColor: "#8C7B6B", color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
              >
                Record Outcome →
              </Link>
            </div>
          )}
        </article>

        <footer
          className="mt-16 pt-8 border-t flex justify-between items-center"
          style={{ borderColor: "#D6CFC4" }}
        >
          <span
            className="text-[10px] tracking-wide"
            style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}
          >
            {decision.id}
          </span>
          <div className="flex items-center gap-6">
            <form action={deleteDecisionWithId}>
              <button
                type="submit"
                className="text-[10px] tracking-[0.2em] uppercase transition-opacity duration-200 hover:opacity-60"
                style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}
                onClick={(e) => {
                  if (!confirm("Delete this decision? This cannot be undone.")) {
                    e.preventDefault();
                  }
                }}
              >
                Delete
              </button>
            </form>
            <Link
              href="/"
              className="text-[10px] tracking-[0.2em] uppercase transition-opacity duration-200 hover:opacity-60"
              style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
            >
              ← All Decisions
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}