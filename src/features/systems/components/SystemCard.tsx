import { ChevronRight } from "lucide-react";
import Link from "next/link";

import type { System } from "../schemas";

interface SystemCardProps {
  system: System;
  gameCount: number;
}

export function SystemCard({ system, gameCount }: SystemCardProps) {
  return (
    <Link
      href={`/systems/${system.id}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-primary/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      data-testid="system-card"
    >
      <span
        className="grid size-12 shrink-0 place-items-center rounded-lg font-pixel text-[0.6rem] text-white"
        style={{
          background: `linear-gradient(135deg, ${system.accent}, #0b0820)`,
        }}
        aria-hidden
      >
        {system.badge}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{system.name}</span>
        <span className="block text-xs text-muted-foreground">
          {system.manufacturer} · {system.year} · {gameCount}{" "}
          {gameCount === 1 ? "game" : "games"}
        </span>
      </span>
      <ChevronRight
        className="size-4 text-muted-foreground transition group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
