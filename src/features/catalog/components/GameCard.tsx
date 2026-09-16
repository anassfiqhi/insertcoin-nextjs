import Link from "next/link";

import { FavoriteButton } from "@/features/library/components/FavoriteButton";
import type { System } from "@/features/systems/schemas";

import type { Game } from "../schemas";
import { GameCover } from "./GameCover";

interface GameCardProps {
  game: Game;
  system: System | undefined;
}

export function GameCard({ game, system }: GameCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:ring-primary/60">
      <Link
        href={`/games/${game.slug}`}
        className="block focus-visible:outline-none"
        data-testid="game-card"
      >
        <GameCover
          title={game.title}
          accent={system?.accent ?? "#6366f1"}
          label={system?.shortName ?? game.system}
        />
        <div className="space-y-1 p-3">
          <h3 className="line-clamp-1 font-medium" title={game.title}>
            {game.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {game.year} · {game.publisher}
          </p>
        </div>
        <span
          className="absolute inset-0 rounded-xl ring-primary group-focus-within:ring-2"
          aria-hidden
        />
      </Link>
      <FavoriteButton
        slug={game.slug}
        title={game.title}
        className="absolute top-2 right-2 z-10"
      />
    </article>
  );
}

export function GameGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </div>
  );
}
