import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const RECENT_LIMIT = 12;

export interface LibraryState {
  favorites: string[];
  recent: string[];
  /** False until IndexedDB has been read. Writes are skipped before that so stored data isn't overwritten. */
  loaded: boolean;
}

const initialState: LibraryState = { favorites: [], recent: [], loaded: false };

export const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    libraryLoaded(
      state,
      action: PayloadAction<{ favorites: string[]; recent: string[] }>,
    ) {
      state.favorites = action.payload.favorites;
      state.recent = action.payload.recent.slice(0, RECENT_LIMIT);
      state.loaded = true;
    },
    favoriteToggled(state, action: PayloadAction<string>) {
      const slug = action.payload;
      state.favorites = state.favorites.includes(slug)
        ? state.favorites.filter((s) => s !== slug)
        : [slug, ...state.favorites];
    },
    gamePlayed(state, action: PayloadAction<string>) {
      const slug = action.payload;
      state.recent = [slug, ...state.recent.filter((s) => s !== slug)].slice(
        0,
        RECENT_LIMIT,
      );
    },
  },
  selectors: {
    selectFavorites: (state) => state.favorites,
    selectRecent: (state) => state.recent,
    selectLibraryLoaded: (state) => state.loaded,
    selectIsFavorite: (state, slug: string) => state.favorites.includes(slug),
  },
});

export const { libraryLoaded, favoriteToggled, gamePlayed } =
  librarySlice.actions;
export const {
  selectFavorites,
  selectRecent,
  selectLibraryLoaded,
  selectIsFavorite,
} = librarySlice.selectors;
