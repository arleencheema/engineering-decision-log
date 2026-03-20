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
  number,
  children,
}: {
  label: string;
  hint?: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid py-8 border-b"
      style={{
        gridTemplateColumns: "3rem 1fr",
        gap: "1.5rem",
        borderColor: "#D6CFC4",
      }}
    >
      <div className="pt-0.5">
        <span
          className="text-2xl font-bold leading-none"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "#EDE8E0",
            fontWeight: 900,
          }}
        >
          {number}
        </span>
      </div>
      <div>
        <div className="mb-3">
          <p
            className="text-[10px] tracking-[0.25em] uppercase font-semibold"
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
    </div>
  );
}

export default function NewDecisionPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>

      {/* Masthead */}
      <div style={{ borderBottom: "3px solid #1A1A1A" }}>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-4"
                style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
              >
                New Record
              </p>
              <h1
                className="text-5xl md:text-6xl leading-none tracking-tight"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "#1A1A1A",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Record a
                <br />
                Decision
              </h1>
            </div>
            <Link
              href="/"
              className="text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 transition-opacity duration-200 hover:opacity-60 pt-1"
              style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              All Decisions
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        <form action={createDecision}>
          <Field number="01" label="Project">
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

          <Field number="02" label="Decision" hint="State the decision clearly and directly.">
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

          <Field number="03" label="Context" hint="What circumstances led to this decision?">
            <textarea
              id="context"
              name="context"
              rows={5}
              required
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field number="04" label="Reasoning" hint="Why this option over the alternatives?">
            <textarea
              id="reasoning"
              name="reasoning"
              rows={5}
              required
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field number="05" label="Options Considered" hint="One option per line">
            <textarea
              id="options_considered"
              name="options_considered"
              rows={4}
              className={inputClass}
              style={inputStyle}
              placeholder={"Option A&#10;Option B&#10;Option C"}
            />
          </Field>

          <Field number="06" label="Trade-offs" hint="What are the known downsides or risks?">
            <textarea
              id="trade_offs"
              name="trade_offs"
              rows={3}
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field number="07" label="Tags" hint="One tag per line">
            <textarea
              id="tags"
              name="tags"
              rows={3}
              className={inputClass}
              style={inputStyle}
              placeholder={"architecture&#10;performance&#10;security"}
            />
          </Field>

          <Field number="08" label="Outcome" hint="Optional — fill this in later once the result is known.">
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
          <div
            className="flex items-center justify-between pt-10 mt-4"
            style={{ borderTop: "1px solid #D6CFC4" }}
          >
            <Link
              href="/"
              className="text-[10px] tracking-[0.2em] uppercase transition-opacity duration-200 hover:opacity-60"
              style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-8 py-3 text-[10px] tracking-[0.2em] uppercase border-2 font-semibold transition-all duration-200 hover:bg-[#1A1A1A] hover:text-[#FAFAF8]"
              style={{
                borderColor: "#1A1A1A",
                color: "#1A1A1A",
                fontFamily: "var(--font-inter)",
              }}
            >
              Save Decision →
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}