import { z } from "zod";

import type { System } from "@/features/systems/schemas";

export const GameSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase kebab-case"),
  title: z.string().min(1),
  system: z.string().min(1),
  rom: z.string().min(1),
  parentRom: z.string().min(1).optional(),
  year: z.number().int().min(1970).max(2030),
  publisher: z.string().min(1),
  genres: z.array(z.string().min(1)).min(1),
  players: z.number().int().min(1).max(8),
  description: z.string().min(1),
  cover: z.string().optional(),
});
export type Game = z.infer<typeof GameSchema>;

const extensionOf = (file: string) => {
  const dot = file.lastIndexOf(".");
  return dot === -1 ? "" : file.slice(dot).toLowerCase();
};

/** Builds the catalog schema, cross-checked against the system registry. */
export function createCatalogSchema(systems: readonly System[]) {
  const byId = new Map(systems.map((system) => [system.id, system]));

  return z.array(GameSchema).superRefine((games, ctx) => {
    const slugs = new Set<string>();

    games.forEach((game, index) => {
      if (slugs.has(game.slug)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "slug"],
          message: `Duplicate slug "${game.slug}"`,
        });
      }
      slugs.add(game.slug);

      const system = byId.get(game.system);
      if (!system) {
        ctx.addIssue({
          code: "custom",
          path: [index, "system"],
          message: `Unknown system "${game.system}"`,
        });
        return;
      }

      for (const [key, file] of [
        ["rom", game.rom],
        ["parentRom", game.parentRom],
      ] as const) {
        if (file && !system.extensions.includes(extensionOf(file))) {
          ctx.addIssue({
            code: "custom",
            path: [index, key],
            message: `"${file}" is not a valid ${system.shortName} file (${system.extensions.join(", ")})`,
          });
        }
      }

      if (game.parentRom && system.kind !== "arcade") {
        ctx.addIssue({
          code: "custom",
          path: [index, "parentRom"],
          message: "Only arcade games can have a parent ROM",
        });
      }
    });
  });
}

export const GameSortSchema = z.enum(["title", "year-desc", "year-asc"]);
export type GameSort = z.infer<typeof GameSortSchema>;

/** Query accepted by `GET /api/games`. Empty strings mean "no filter". */
export const GameQuerySchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  system: z.string().trim().max(40).catch("").default(""),
  genre: z.string().trim().max(40).catch("").default(""),
  sort: GameSortSchema.catch("title").default("title"),
});
export type GameQuery = z.infer<typeof GameQuerySchema>;

export const GamesResponseSchema = z.object({
  games: z.array(GameSchema),
  total: z.number().int().nonnegative(),
});
export type GamesResponse = z.infer<typeof GamesResponseSchema>;
