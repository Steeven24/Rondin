"use client";

import { useState, useTransition } from "react";
import { assignPremise } from "./actions";

interface AssignSelectProps {
  premiseId: string;
  assignedTo: string | null;
  members: { id: string; full_name: string }[];
  disabled?: boolean;
}

/** Dropdown to assign a premise; saves as soon as the leader picks a member. */
export function AssignSelect({ premiseId, assignedTo, members, disabled }: AssignSelectProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <span className="flex flex-col gap-1">
      <select
        aria-label="Asignado a"
        defaultValue={assignedTo ?? ""}
        disabled={pending || disabled}
        onChange={(e) =>
          startTransition(async () => {
            const result = await assignPremise(premiseId, e.target.value || null);
            setError(result.error ?? "");
          })
        }
        className="h-9 rounded-lg border border-line-strong bg-white px-2 text-[13px] disabled:opacity-60"
      >
        <option value="">Sin asignar</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.full_name}</option>
        ))}
      </select>
      {error && <span className="text-xs text-bad">{error}</span>}
    </span>
  );
}
