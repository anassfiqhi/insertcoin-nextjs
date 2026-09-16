import { describe, expect, it } from "vitest";

import {
  favoriteToggled,
  gamePlayed,
  librarySlice,
  libraryLoaded,
  RECENT_LIMIT,
} from "./librarySlice";

const reducer = librarySlice.reducer;
const initial = reducer(undefined, { type: "@@init" });

describe("librarySlice", () => {
  it("toggles favorites on and off, newest first", () => {
    let state = reducer(initial, favoriteToggled("a"));
    state = reducer(state, favoriteToggled("b"));
    expect(state.favorites).toEqual(["b", "a"]);

    state = reducer(state, favoriteToggled("a"));
    expect(state.favorites).toEqual(["b"]);
  });

  it("moves a replayed game to the front of recent without duplicating it", () => {
    let state = reducer(initial, gamePlayed("a"));
    state = reducer(state, gamePlayed("b"));
    state = reducer(state, gamePlayed("a"));
    expect(state.recent).toEqual(["a", "b"]);
  });

  it(`keeps at most ${RECENT_LIMIT} recent games`, () => {
    const state = Array.from(
      { length: RECENT_LIMIT + 3 },
      (_, i) => `game-${i}`,
    ).reduce((acc, slug) => reducer(acc, gamePlayed(slug)), initial);
    expect(state.recent).toHaveLength(RECENT_LIMIT);
    expect(state.recent[0]).toBe(`game-${RECENT_LIMIT + 2}`);
  });

  it("libraryLoaded marks the library as loaded", () => {
    const state = reducer(
      initial,
      libraryLoaded({ favorites: ["x"], recent: ["y"] }),
    );
    expect(state).toEqual({ favorites: ["x"], recent: ["y"], loaded: true });
  });
});
