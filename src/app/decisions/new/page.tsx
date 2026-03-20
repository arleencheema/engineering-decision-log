import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { redirect } from "next/navigation";

async function createDecision(formData: FormData) {
  "use server";

  const { auth } = await import('@clerk/nextjs/server')
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const raw = (key: string) => (formData.get(key) as string | null) ?? "";
  const splitLines = (key: string): string[] =>
    raw(key)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const { data, error } = await supabase
    .from("decisions")
    .insert({
      user_id: userId,
      project: raw("project"),
      context: raw("context"),
      decision: raw("decision"),
      reasoning: raw("reasoning"),
      options_considered: splitLines("options_considered"),
      trade_offs: raw("trade_offs") || null,
      outcome: raw("outcome") || null,
      tags: splitLines("tags"),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/decisions/${data.id}`);
}

const inputClass =
  "w-full px-4 py-3 text-sm border bg-white/60 focus:outline-none focus:bg-white transition-all duration-200 resize-none";
const inputStyle = {
  borderColor: "#D6CFC4",
  color: "#1A1A1A",
  fontFamily: "var(--font-inter)",
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-7 border-b" style={{ borderColor: "#D6CFC4" }}>
      <div className="mb-3">
        <p
          className="text-xs tracking-[0.2em] uppercase"
          style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
        >
          {label}
        </p>
        {hint && (
          <p className="text-xs mt-1" style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}>
            {hint}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function NewDecisionPage() {
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
        </nav>

        {/* Page title */}
        <header className="mb-12 pb-12 border-b" style={{ borderColor: "#D6CFC4" }}>
          <p
            className="text-xs tracking-[0.2em] uppercase mb-3"
            style={{ color: "#8C7B6B" }}
          >
            New Record
          </p>
          <h1
            className="text-4xl md:text-5xl leading-tight"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "#1A1A1A",
              fontWeight: 700,
            }}
          >
            Record a Decision
          </h1>
        </header>

        <form action={createDecision}>
          <Field label="Project">
            <input
              id="project"
              name="project"
              type="text"
              required
              placeholder="e.g. Auth Service"
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Decision" hint="State the decision clearly and directly.">
            <textarea
              id="decision"
              name="decision"
              rows={3}
              required
              placeholder="We will use PostgreSQL for the primary datastore."
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Context" hint="What circumstances led to this decision?">
            <textarea
              id="context"
              name="context"
              rows={5}
              required
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Reasoning" hint="Why this option over the alternatives?">
            <textarea
              id="reasoning"
              name="reasoning"
              rows={5}
              required
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Options Considered" hint="One option per line">
            <textarea
              id="options_considered"
              name="options_considered"
              rows={4}
              className={inputClass}
              style={inputStyle}
              placeholder={"Option A&#10;Option B&#10;Option C"}
            />
          </Field>

          <Field label="Trade-offs" hint="What are the known downsides or risks?">
            <textarea
              id="trade_offs"
              name="trade_offs"
              rows={3}
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Tags" hint="One tag per line">
            <textarea
              id="tags"
              name="tags"
              rows={3}
              className={inputClass}
              style={inputStyle}
              placeholder={"architecture&#10;performance&#10;security"}
            />
          </Field>

          <Field label="Outcome" hint="Optional — fill this in later once the result is known.">
            <textarea
              id="outcome"
              name="outcome"
              rows={3}
              className={inputClass}
              style={inputStyle}
              placeholder="Leave blank for now…"
            />
          </Field>

          {/* Actions */}
          <div className="mt-12 flex items-center justify-between">
            <Link
              href="/"
              className="text-sm transition-opacity duration-200 hover:opacity-60"
              style={{ color: "#8C7B6B" }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-8 py-3 text-sm border transition-all duration-200 hover:bg-[#1A1A1A] hover:text-[#FAFAF8] hover:border-[#1A1A1A]"
              style={{ borderColor: "#1A1A1A", color: "#1A1A1A" }}
            >
              Save Decision
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}