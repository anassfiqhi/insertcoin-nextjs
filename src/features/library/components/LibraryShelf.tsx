"use client";

import Link from "next/link";

import { selectGamesBySlugs } from "@/features/catalog/catalogSlice";
import { GameCard, GameGrid } from "@/features/catalog/components/GameCard";
import { selectSystems } from "@/features/systems/systemsSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/lib/store/hooks";

import {
  selectFavorites,
  selectLibraryLoaded,
  selectRecent,
} from "../librarySlice";

interface LibraryShelfProps {
  source: "recent" | "favorites";
  title: string;
  limit?: number;
  /** Shown when the list is empty. Leave it out to hide the whole shelf instead. */
  emptyMessage?: string;
}

export function LibraryShelf({
  source,
  title,
  limit,
  emptyMessage,
}: LibraryShelfProps) {
  const loaded = useAppSelector(selectLibraryLoaded);
  const slugs = useAppSelector(
    source === "recent" ? selectRecent : selectFavorites,
  );
  const games = useAppSelector((state) => selectGamesBySlugs(state, slugs));
  const systems = useAppSelector(selectSystems);

  if (!loaded) {
    return emptyMessage ? (
      <section className="space-y-4">
        <h2 className="font-pixel text-sm">{title}</h2>
        <GameGrid>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3.9] rounded-xl" />
          ))}
        </GameGrid>
      </section>
    ) : null;
  }

  if (games.length === 0 && !emptyMessage) return null;

  const visible = limit ? games.slice(0, limit) : games;

  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-pixel text-sm">{title}</h2>
        {limit && games.length > limit && source === "favorites" && (
          <Link
            href="/favorites"
            className="text-sm text-primary hover:underline"
          >
            See all {games.length}
          </Link>
        )}
      </div>
      {visible.length > 0 ? (
        <GameGrid>
          {visible.map((game) => (
            <GameCard
              key={game.slug}
              game={game}
              system={systems.find((s) => s.id === game.system)}
            />
          ))}
        </GameGrid>
      ) : (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
