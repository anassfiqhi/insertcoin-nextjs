import { GamesResponseSchema, type Game, type GameQuery } from "./schemas";

export async function fetchGames(
  query: GameQuery,
  signal?: AbortSignal,
): Promise<Game[]> {
  const params = new URLSearchParams(
    Object.entries(query).filter(([, value]) => value !== ""),
  );
  const response = await fetch(`/api/games?${params}`, { signal });
  if (!response.ok)
    throw new Error(`Could not load games (HTTP ${response.status})`);
  return GamesResponseSchema.parse(await response.json()).games;
}
