import { describe, expect, it } from "vitest";

import { kof2002, kof2002Clone, makeGame, superMetroid } from "@/test/fixtures";

import { defaultQuery } from "./catalogSlice";
import { collectGenres, filterGames } from "./filterGames";
import type { GameQuery } from "./schemas";

const pokemon = makeGame({
  slug: "pokemon-crystal",
  title: "Pokémon Crystal",
  system: "gbc",
  rom: "pokemon-crystal.gbc",
  year: 2000,
  publisher: "Nintendo",
  genres: ["RPG"],
});
const games = [superMetroid, kof2002Clone, pokemon, kof2002];

const slugs = (query: Partial<GameQuery>) =>
  filterGames(games, { ...defaultQuery, ...query }).map((game) => game.slug);

describe("filterGames", () => {
  it("sorts by title by default", () => {
    expect(slugs({})).toEqual([
      "pokemon-crystal",
      "super-metroid",
      "the-king-of-fighters-2002",
      "kof2002-plus",
    ]);
  });

  it("filters by system and genre", () => {
    expect(slugs({ system: "neogeo", genre: "Fighting" })).toEqual([
      "the-king-of-fighters-2002",
      "kof2002-plus",
    ]);
    expect(slugs({ system: "snes", genre: "Fighting" })).toEqual([]);
  });

  it("matches title or publisher, ignoring case and accents", () => {
    expect(slugs({ q: "POKEMON" })).toEqual(["pokemon-crystal"]);
    expect(slugs({ q: "playmore" })).toEqual(["the-king-of-fighters-2002"]);
  });

  it("sorts by year in both directions, breaking ties by title", () => {
    expect(slugs({ sort: "year-desc" })).toEqual([
      "the-king-of-fighters-2002",
      "kof2002-plus",
      "pokemon-crystal",
      "super-metroid",
    ]);
    expect(slugs({ sort: "year-asc" })).toEqual([
      "super-metroid",
      "pokemon-crystal",
      "the-king-of-fighters-2002",
      "kof2002-plus",
    ]);
  });
});

describe("collectGenres", () => {
  it("returns unique genres in alphabetical order", () => {
    expect(collectGenres(games)).toEqual([
      "Action-adventure",
      "Fighting",
      "RPG",
    ]);
  });
});
