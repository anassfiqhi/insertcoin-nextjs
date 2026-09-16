"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { System } from "@/features/systems/schemas";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

import {
  catalogOpened,
  queryChanged,
  selectCatalogError,
  selectCatalogQuery,
  selectCatalogResults,
  selectCatalogStatus,
} from "../catalogSlice";
import type { Game, GameSort } from "../schemas";
import { GameCard, GameGrid } from "./GameCard";

const ALL_GENRES = "__all__";

const sortItems: { value: GameSort; label: string }[] = [
  { value: "title", label: "Title A–Z" },
  { value: "year-desc", label: "Newest first" },
  { value: "year-asc", label: "Oldest first" },
];

interface CatalogViewProps {
  system: System;
  /** Server-rendered list, shown until the store has taken over this system. */
  initialGames: Game[];
  genres: string[];
}

export function CatalogView({
  system,
  initialGames,
  genres,
}: CatalogViewProps) {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectCatalogQuery);
  const status = useAppSelector(selectCatalogStatus);
  const error = useAppSelector(selectCatalogError);
  const results = useAppSelector(selectCatalogResults);

  useEffect(() => {
    dispatch(catalogOpened({ system: system.id }));
  }, [dispatch, system.id]);

  const active = query.system === system.id;
  const games = active ? results : initialGames;
  const genreItems = [
    { value: ALL_GENRES, label: "All genres" },
    ...genres.map((g) => ({ value: g, label: g })),
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search {system.shortName} games</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={`Search ${system.shortName} games or publishers…`}
            value={active ? query.q : ""}
            onChange={(event) =>
              dispatch(queryChanged({ q: event.target.value }))
            }
            className="h-9 pl-8"
          />
        </label>
        <Select
          items={genreItems}
          value={active && query.genre ? query.genre : ALL_GENRES}
          onValueChange={(value) =>
            dispatch(
              queryChanged({
                genre: value === ALL_GENRES ? "" : String(value),
              }),
            )
          }
        >
          <SelectTrigger className="h-9 w-full sm:w-44" aria-label="Genre">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {genreItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={sortItems}
          value={active ? query.sort : "title"}
          onValueChange={(value) =>
            dispatch(queryChanged({ sort: value as GameSort }))
          }
        >
          <SelectTrigger className="h-9 w-full sm:w-40" aria-label="Sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className="flex h-5 items-center gap-2 text-sm text-muted-foreground"
        aria-live="polite"
      >
        {status === "loading" && active ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden /> Searching…
          </>
        ) : (
          <span data-testid="result-count">
            {games.length} {games.length === 1 ? "game" : "games"}
          </span>
        )}
      </div>

      {status === "failed" && active && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {games.length > 0 ? (
        <GameGrid>
          {games.map((game) => (
            <GameCard key={game.slug} game={game} system={system} />
          ))}
        </GameGrid>
      ) : (
        status !== "loading" && (
          <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No games match your search.
          </p>
        )
      )}
    </section>
  );
}
