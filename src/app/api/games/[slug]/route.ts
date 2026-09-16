import { getGame } from "@/lib/data";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/games/[slug]">,
) {
  const game = getGame((await ctx.params).slug);
  if (!game) return Response.json({ error: "Game not found" }, { status: 404 });
  return Response.json(game);
}
