import { z } from "zod";

import gamesJson from "@data/games.json";
import systemsJson from "@data/systems.json";
import { createCatalogSchema, type Game } from "@/features/catalog/schemas";
import { SystemsSchema, type System } from "@/features/systems/schemas";

function parseOrThrow<T>(
  schema: z.ZodType<T>,
  input: unknown,
  file: string,
): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid ${file}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

// Parsed once per server process. A bad JSON file fails the build with a readable error.
const systems = parseOrThrow(SystemsSchema, systemsJson, "data/systems.json");
const games = parseOrThrow(
  createCatalogSchema(systems),
  gamesJson,
  "data/games.json",
);

export const getSystems = (): readonly System[] => systems;
export const getSystem = (id: string): System | undefined =>
  systems.find((s) => s.id === id);
export const getGames = (): readonly Game[] => games;
export const getGame = (slug: string): Game | undefined =>
  games.find((g) => g.slug === slug);
export const getGamesBySystem = (systemId: string): Game[] =>
  games.filter((game) => game.system === systemId);
