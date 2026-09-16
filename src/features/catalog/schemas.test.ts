import { describe, expect, it } from "vitest";

import { SystemsSchema } from "@/features/systems/schemas";
import { getGames, getSystems } from "@/lib/data";
import {
  kof2002,
  kof2002Clone,
  makeGame,
  neogeo,
  snes,
  superMetroid,
} from "@/test/fixtures";

import { createCatalogSchema, GameQuerySchema } from "./schemas";

const catalog = createCatalogSchema([neogeo, snes]);

const issuesOf = (input: unknown) => {
  const result = catalog.safeParse(input);
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.message);
};

describe("createCatalogSchema", () => {
  it("accepts valid games, including arcade clones with a parent ROM", () => {
    expect(issuesOf([kof2002, kof2002Clone, superMetroid])).toEqual([]);
  });

  it("rejects duplicate slugs", () => {
    expect(issuesOf([kof2002, kof2002])).toContain(
      `Duplicate slug "${kof2002.slug}"`,
    );
  });

  it("rejects games whose system is not in the registry", () => {
    expect(issuesOf([makeGame({ system: "dreamcast" })])).toContain(
      'Unknown system "dreamcast"',
    );
  });

  it("rejects ROM extensions the system can't load", () => {
    expect(issuesOf([makeGame({ system: "snes", rom: "game.nes" })])).toEqual([
      '"game.nes" is not a valid SNES file (.sfc, .smc, .zip)',
    ]);
  });

  it("only allows parent ROMs on arcade systems", () => {
    expect(issuesOf([{ ...superMetroid, parentRom: "base.sfc" }])).toContain(
      "Only arcade games can have a parent ROM",
    );
  });
});

describe("SystemsSchema", () => {
  it("rejects duplicate system ids", () => {
    const result = SystemsSchema.safeParse([neogeo, neogeo]);
    expect(result.success).toBe(false);
  });

  it("rejects unknown EmulatorJS cores", () => {
    expect(
      SystemsSchema.safeParse([{ ...neogeo, core: "fbneo" }]).success,
    ).toBe(false);
  });
});

describe("GameQuerySchema", () => {
  it("falls back to defaults for missing or invalid values", () => {
    expect(GameQuerySchema.parse({ sort: "random", q: "  slug " })).toEqual({
      q: "slug",
      system: "",
      genre: "",
      sort: "title",
    });
  });
});

describe("shipped data", () => {
  it("data/systems.json and data/games.json are valid", () => {
    // lib/data parses both files at import time and throws on any issue.
    expect(getSystems().length).toBeGreaterThan(0);
    expect(getGames().length).toBeGreaterThan(0);
  });

  it("every system has at least one game", () => {
    const withGames = new Set(getGames().map((game) => game.system));
    expect(getSystems().filter((system) => !withGames.has(system.id))).toEqual(
      [],
    );
  });
});
