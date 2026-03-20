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

async function updateDecision(id: string, formData: FormData) {
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
    .eq("id", id)
    .eq("user_id", userId);

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

export default async function EditDecisionPage({ params }: PageProps) {
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

  const d = data as Decision;
  const updateDecisionWithId = updateDecision.bind(null, id);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>

      {/* Masthead */}
      <div style={{ borderBottom: "3px solid #1A1A1A" }}>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-8">
            <div>
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-4"
                style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
              >
                {d.project}
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
                Edit
                <br />
                Decision
              </h1>
            </div>
            <div className="flex flex-col items-end gap-4 pt-1">
              <Link
                href={`/decisions/${id}`}
                className="text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 transition-opacity duration-200 hover:opacity-60"
                style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Decision
              </Link>
              <span
                className="text-[10px] tracking-[0.2em] uppercase"
                style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}
              >
                Editing
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        <form action={updateDecisionWithId}>
          <Field number="01" label="Project">
            <input id="project" name="project" type="text" defaultValue={d.project} required className={inputClass} style={inputStyle} />
          </Field>

          <Field number="02" label="Decision">
            <textarea id="decision" name="decision" rows={3} defaultValue={d.decision} required className={inputClass} style={inputStyle} />
          </Field>

          <Field number="03" label="Context">
            <textarea id="context" name="context" rows={5} defaultValue={d.context} required className={inputClass} style={inputStyle} />
          </Field>

          <Field number="04" label="Reasoning">
            <textarea id="reasoning" name="reasoning" rows={5} defaultValue={d.reasoning} required className={inputClass} style={inputStyle} />
          </Field>

          <Field number="05" label="Options Considered" hint="One option per line">
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

          <Field number="06" label="Trade-offs">
            <textarea id="trade_offs" name="trade_offs" rows={3} defaultValue={d.trade_offs ?? ""} className={inputClass} style={inputStyle} />
          </Field>

          <Field number="07" label="Tags" hint="One tag per line">
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
            className="grid py-8 border-b"
            style={{ gridTemplateColumns: "3rem 1fr", gap: "1.5rem", borderColor: "#D6CFC4" }}
          >
            <div className="pt-0.5">
              <span
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "var(--font-playfair)", color: "#EDE8E0", fontWeight: 900 }}
              >
                08
              </span>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <p
                  className="text-[10px] tracking-[0.25em] uppercase font-semibold"
                  style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
                >
                  Outcome
                </p>
                <span
                  className="text-[9px] tracking-[0.2em] uppercase font-semibold px-2 py-0.5"
                  style={{ backgroundColor: "#8C7B6B", color: "#FAFAF8", fontFamily: "var(--font-inter)" }}
                >
                  Close the loop
                </span>
              </div>
              <p className="text-xs mb-4" style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}>
                What actually happened? Recording the outcome completes this decision record.
              </p>
              <textarea
                id="outcome"
                name="outcome"
                rows={4}
                defaultValue={d.outcome ?? ""}
                className={inputClass}
                style={{ ...inputStyle, borderColor: d.outcome ? "#8C7B6B" : "#D6CFC4" }}
                placeholder="Describe the real-world result of this decision…"
              />
              {!d.outcome && (
                <p className="mt-2 text-xs italic" style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}>
                  This field is currently empty.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex items-center justify-between pt-10 mt-4"
            style={{ borderTop: "1px solid #D6CFC4" }}
          >
            <Link
              href={`/decisions/${id}`}
              className="text-[10px] tracking-[0.2em] uppercase transition-opacity duration-200 hover:opacity-60"
              style={{ color: "#8C7B6B", fontFamily: "var(--font-inter)" }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-8 py-3 text-[10px] tracking-[0.2em] uppercase border-2 font-semibold transition-all duration-200 hover:bg-[#1A1A1A] hover:text-[#FAFAF8]"
              style={{ borderColor: "#1A1A1A", color: "#1A1A1A", fontFamily: "var(--font-inter)" }}
            >
              Save Changes →
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}