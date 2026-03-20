"use client";

import { deleteDecision } from "./actions";

export default function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm("Delete this decision? This cannot be undone.")) return;
    await deleteDecision(id);
  }

  return (
    <button
      onClick={handleDelete}
      className="text-[10px] tracking-[0.2em] uppercase transition-opacity duration-200 hover:opacity-60"
      style={{ color: "#C4B9AE", fontFamily: "var(--font-inter)" }}
    >
      Delete
    </button>
  );
}