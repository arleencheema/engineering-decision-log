import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

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

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-8 border-b" style={{ borderColor: "#D6CFC4" }}>
      <p
        className="text-xs tracking-[0.2em] uppercase mb-4"
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
  );
}

export default async function DecisionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const decision = data as Decision;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#F5F0E8", fontFamily: "var(--font-inter)" }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">

        {/* Nav */}
        <nav className="flex items-center justify-between mb-16">
          <Link
            href="/"
            className="text-sm flex items-center gap-2 transition-opacity duration-200 hover:opacity-60"
            style={{ color: "#8C7B6B" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Decision Log
          </Link>
          <Link
            href={`/decisions/${decision.id}/edit`}
            className="px-4 py-2 text-sm border transition-all duration-200 hover:bg-[#8C7B6B] hover:text-[#FAFAF8] hover:border-[#8C7B6B]"
            style={{ borderColor: "#8C7B6B", color: "#8C7B6B" }}
          >
            Edit
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-12 pb-12 border-b" style={{ borderColor: "#D6CFC4" }}>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: "#8C7B6B" }}
            >
              {decision.project}
            </span>
            <span style={{ color: "#C4B9AE" }}>·</span>
            <span className="text-xs" style={{ color: "#C4B9AE" }}>
              {formatDate(decision.created_at)}
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl leading-tight mb-6"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "#1A1A1A",
              fontWeight: 700,
            }}
          >
            {decision.decision}
          </h1>

          {/* Tags */}
          {decision.tags && decision.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {decision.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs tracking-wide px-3 py-1"
                  style={{ backgroundColor: "#EDE8E0", color: "#8C7B6B" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Body sections */}
        <article>
          <Section label="Context">{decision.context}</Section>
          <Section label="Reasoning">{decision.reasoning}</Section>

          {decision.options_considered && decision.options_considered.length > 0 && (
            <div className="py-8 border-b" style={{ borderColor: "#D6CFC4" }}>
              <p
                className="text-xs tracking-[0.2em] uppercase mb-4"
                style={{ color: "#8C7B6B" }}
              >
                Options Considered
              </p>
              <ol className="space-y-3">
                {decision.options_considered.map((opt, i) => (
                  <li
                    key={i}
                    className="flex gap-4 text-base leading-relaxed"
                    style={{ color: "#1A1A1A" }}
                  >
                    <span
                      className="shrink-0 text-sm tabular-nums pt-0.5"
                      style={{ color: "#C4B9AE" }}
                    >
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {decision.trade_offs && (
            <Section label="Trade-offs">{decision.trade_offs}</Section>
          )}

          {/* Outcome */}
          {decision.outcome ? (
            <div
              className="mt-10 p-8 border"
              style={{ borderColor: "#8C7B6B", backgroundColor: "#FAFAF8" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ color: "#8C7B6B" }}
                >
                  Outcome
                </p>
                <span
                  className="text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 border"
                  style={{ borderColor: "#8C7B6B", color: "#8C7B6B" }}
                >
                  Resolved
                </span>
              </div>
              <p className="text-base leading-relaxed" style={{ color: "#1A1A1A" }}>
                {decision.outcome}
              </p>
            </div>
          ) : (
            <div
              className="mt-10 p-8 border border-dashed flex flex-col md:flex-row md:items-center justify-between gap-6"
              style={{ borderColor: "#C4B9AE" }}
            >
              <div>
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-2"
                  style={{ color: "#8C7B6B" }}
                >
                  Outcome
                </p>
                <p className="text-sm" style={{ color: "#8C7B6B" }}>
                  Not yet recorded — this decision is still open.
                </p>
              </div>
              <Link
                href={`/decisions/${decision.id}/edit`}
                className="shrink-0 px-5 py-2.5 text-sm border transition-all duration-200 hover:bg-[#8C7B6B] hover:text-[#FAFAF8] hover:border-[#8C7B6B]"
                style={{ borderColor: "#8C7B6B", color: "#8C7B6B" }}
              >
                Record Outcome
              </Link>
            </div>
          )}
        </article>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t flex justify-between items-center" style={{ borderColor: "#D6CFC4" }}>
          <span className="text-xs" style={{ color: "#C4B9AE" }}>
            {decision.id}
          </span>
          <Link
            href="/"
            className="text-sm transition-opacity duration-200 hover:opacity-60"
            style={{ color: "#8C7B6B" }}
          >
            ← All decisions
          </Link>
        </footer>

      </div>
    </main>
  );
}