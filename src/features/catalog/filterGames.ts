import type { Game, GameQuery } from "./schemas";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const comparators: Record<GameQuery["sort"], (a: Game, b: Game) => number> = {
  title: (a, b) => a.title.localeCompare(b.title),
  "year-desc": (a, b) => b.year - a.year || a.title.localeCompare(b.title),
  "year-asc": (a, b) => a.year - b.year || a.title.localeCompare(b.title),
};

/** Pure filter and sort, shared by the API route and the tests. */
export function filterGames(games: readonly Game[], query: GameQuery): Game[] {
  const needle = normalize(query.q);

  return games
    .filter((game) => !query.system || game.system === query.system)
    .filter((game) => !query.genre || game.genres.includes(query.genre))
    .filter(
      (game) =>
        !needle ||
        normalize(game.title).includes(needle) ||
        normalize(game.publisher).includes(needle),
    )
    .sort(comparators[query.sort]);
}

export function collectGenres(games: readonly Game[]): string[] {
  return [...new Set(games.flatMap((game) => game.genres))].sort((a, b) =>
    a.localeCompare(b),
  );
}
