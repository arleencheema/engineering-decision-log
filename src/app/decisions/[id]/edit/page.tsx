import { supabase } from "@/lib/supabase";
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

async function updateDecision(id: string, formData: FormData) {
  "use server";

  const raw = (key: string) => (formData.get(key) as string | null) ?? "";
  const splitLines = (key: string): string[] =>
    raw(key)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const updates = {
    project: raw("project"),
    context: raw("context"),
    decision: raw("decision"),
    reasoning: raw("reasoning"),
    options_considered: splitLines("options_considered"),
    trade_offs: raw("trade_offs") || null,
    outcome: raw("outcome") || null,
    tags: splitLines("tags"),
  };

  const { error } = await supabase
    .from("decisions")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  redirect(`/decisions/${id}`);
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

export default async function EditDecisionPage({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const d = data as Decision;
  const updateDecisionWithId = updateDecision.bind(null, id);

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#F5F0E8", fontFamily: "var(--font-inter)" }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">

        {/* Nav */}
        <nav className="flex items-center justify-between mb-16">
          <Link
            href={`/decisions/${id}`}
            className="text-sm flex items-center gap-2 transition-opacity duration-200 hover:opacity-60"
            style={{ color: "#8C7B6B" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to decision
          </Link>
          <span className="text-xs tracking-[0.15em] uppercase" style={{ color: "#C4B9AE" }}>
            Editing
          </span>
        </nav>

        {/* Page title */}
        <header className="mb-12 pb-12 border-b" style={{ borderColor: "#D6CFC4" }}>
          <p
            className="text-xs tracking-[0.2em] uppercase mb-3"
            style={{ color: "#8C7B6B" }}
          >
            {d.project}
          </p>
          <h1
            className="text-4xl md:text-5xl leading-tight"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "#1A1A1A",
              fontWeight: 700,
            }}
          >
            Edit Decision
          </h1>
        </header>

        <form action={updateDecisionWithId}>
          <Field label="Project">
            <input
              id="project"
              name="project"
              type="text"
              defaultValue={d.project}
              required
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Decision">
            <textarea
              id="decision"
              name="decision"
              rows={3}
              defaultValue={d.decision}
              required
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Context">
            <textarea
              id="context"
              name="context"
              rows={5}
              defaultValue={d.context}
              required
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Reasoning">
            <textarea
              id="reasoning"
              name="reasoning"
              rows={5}
              defaultValue={d.reasoning}
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
              defaultValue={(d.options_considered ?? []).join("\n")}
              className={inputClass}
              style={inputStyle}
              placeholder={"Option A&#10;Option B&#10;Option C"}
            />
          </Field>

          <Field label="Trade-offs">
            <textarea
              id="trade_offs"
              name="trade_offs"
              rows={3}
              defaultValue={d.trade_offs ?? ""}
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Tags" hint="One tag per line">
            <textarea
              id="tags"
              name="tags"
              rows={3}
              defaultValue={(d.tags ?? []).join("\n")}
              className={inputClass}
              style={inputStyle}
              placeholder={"architecture&#10;performance&#10;security"}
            />
          </Field>

          {/* Outcome — close the loop */}
          <div
            className="mt-2 p-8 border"
            style={{ borderColor: "#8C7B6B", backgroundColor: "#FAFAF8" }}
          >
            <div className="mb-5">
              <div className="flex items-baseline justify-between mb-1">
                <p
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ color: "#8C7B6B" }}
                >
                  Outcome
                </p>
                <span
                  className="text-[10px] tracking-wider uppercase"
                  style={{ color: "#8C7B6B" }}
                >
                  Close the loop
                </span>
              </div>
              <p className="text-xs" style={{ color: "#C4B9AE" }}>
                What actually happened? Recording the outcome completes this decision record.
              </p>
            </div>
            <textarea
              id="outcome"
              name="outcome"
              rows={4}
              defaultValue={d.outcome ?? ""}
              className={inputClass}
              style={{ ...inputStyle, borderColor: "#8C7B6B" }}
              placeholder="Describe the real-world result of this decision…"
            />
            {!d.outcome && (
              <p className="mt-3 text-xs italic" style={{ color: "#C4B9AE" }}>
                This field is currently empty.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-12 flex items-center justify-between">
            <Link
              href={`/decisions/${id}`}
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
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}