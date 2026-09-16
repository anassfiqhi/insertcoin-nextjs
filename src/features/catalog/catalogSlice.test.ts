import { describe, expect, it } from "vitest";

import { kof2002, kof2002Clone, superMetroid } from "@/test/fixtures";

import {
  catalogOpened,
  catalogSlice,
  createCatalogState,
  fetchFailed,
  fetchSucceeded,
  queryChanged,
  selectCatalogResults,
} from "./catalogSlice";

const reducer = catalogSlice.reducer;

describe("catalogSlice", () => {
  it("catalogOpened resets the query and shows cached games for that system right away", () => {
    const state = reducer(
      {
        ...createCatalogState([kof2002, superMetroid]),
        query: { q: "old", system: "snes", genre: "RPG", sort: "year-asc" },
      },
      catalogOpened({ system: "neogeo" }),
    );

    expect(state.query).toEqual({
      q: "",
      system: "neogeo",
      genre: "",
      sort: "title",
    });
    expect(state.resultSlugs).toEqual([kof2002.slug]);
    expect(state.status).toBe("loading");
  });

  it("queryChanged merges into the current query and keeps the system", () => {
    const opened = reducer(
      createCatalogState(),
      catalogOpened({ system: "neogeo" }),
    );
    const state = reducer(
      opened,
      queryChanged({ q: "kof", sort: "year-desc" }),
    );

    expect(state.query).toEqual({
      q: "kof",
      system: "neogeo",
      genre: "",
      sort: "year-desc",
    });
  });

  it("fetchSucceeded stores games and keeps the server's result order", () => {
    const state = reducer(
      createCatalogState(),
      fetchSucceeded([kof2002Clone, kof2002]),
    );

    expect(state.status).toBe("succeeded");
    expect(
      selectCatalogResults({ catalog: state }).map((game) => game.slug),
    ).toEqual([kof2002Clone.slug, kof2002.slug]);
  });

  it("fetchFailed records the error", () => {
    const state = reducer(createCatalogState(), fetchFailed("boom"));
    expect(state).toMatchObject({ status: "failed", error: "boom" });
  });
});
