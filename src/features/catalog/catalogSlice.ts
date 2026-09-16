import {
  createEntityAdapter,
  createSelector,
  createSlice,
  type EntityState,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { Game, GameQuery } from "./schemas";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export const gamesAdapter = createEntityAdapter<Game, string>({
  selectId: (game) => game.slug,
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

export interface CatalogState {
  games: EntityState<Game, string>;
  query: GameQuery;
  resultSlugs: string[];
  status: RequestStatus;
  error: string | null;
}

export const defaultQuery: GameQuery = {
  q: "",
  system: "",
  genre: "",
  sort: "title",
};

export function createCatalogState(games: readonly Game[] = []): CatalogState {
  return {
    games: gamesAdapter.setAll(gamesAdapter.getInitialState(), games),
    query: defaultQuery,
    resultSlugs: [],
    status: "idle",
    error: null,
  };
}

export const catalogSlice = createSlice({
  name: "catalog",
  initialState: createCatalogState(),
  reducers: {
    /** A system catalog page mounted. Resets the filters and shows cached games right away. */
    catalogOpened(state, action: PayloadAction<{ system: string }>) {
      const { system } = action.payload;
      state.query = { ...defaultQuery, system };
      state.resultSlugs = Object.values(state.games.entities)
        .filter((game) => game.system === system)
        .map((game) => game.slug);
      state.status = "loading";
      state.error = null;
    },
    queryChanged(
      state,
      action: PayloadAction<Partial<Omit<GameQuery, "system">>>,
    ) {
      state.query = { ...state.query, ...action.payload };
      state.status = "loading";
      state.error = null;
    },
    fetchSucceeded(state, action: PayloadAction<Game[]>) {
      gamesAdapter.upsertMany(state.games, action.payload);
      state.resultSlugs = action.payload.map((game) => game.slug);
      state.status = "succeeded";
    },
    fetchFailed(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
  selectors: {
    selectCatalogQuery: (state) => state.query,
    selectCatalogStatus: (state) => state.status,
    selectCatalogError: (state) => state.error,
  },
});

export const { catalogOpened, queryChanged, fetchSucceeded, fetchFailed } =
  catalogSlice.actions;
export const { selectCatalogQuery, selectCatalogStatus, selectCatalogError } =
  catalogSlice.selectors;

type WithCatalog = { catalog: CatalogState };

const gameSelectors = gamesAdapter.getSelectors(
  (state: WithCatalog) => state.catalog.games,
);

export const selectAllGames = gameSelectors.selectAll;
export const selectGameBySlug = gameSelectors.selectById;
export const selectGameEntities = gameSelectors.selectEntities;

export const selectCatalogResults = createSelector(
  [selectGameEntities, (state: WithCatalog) => state.catalog.resultSlugs],
  (entities, slugs) => slugs.flatMap((slug) => entities[slug] ?? []),
);

/** Resolves a list of slugs to games, dropping any slug that no longer exists. */
export const selectGamesBySlugs = createSelector(
  [
    selectGameEntities,
    (_state: WithCatalog, slugs: readonly string[]) => slugs,
  ],
  (entities, slugs) => slugs.flatMap((slug) => entities[slug] ?? []),
);
