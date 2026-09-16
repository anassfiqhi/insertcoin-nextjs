import { filterGames } from "@/features/catalog/filterGames";
import {
  GameQuerySchema,
  type GamesResponse,
} from "@/features/catalog/schemas";
import { getGames } from "@/lib/data";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const query = GameQuerySchema.parse(params);
  const games = filterGames(getGames(), query);

  return Response.json({ games, total: games.length } satisfies GamesResponse);
}
