import {
  createAction,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { SaveRecord } from "@/lib/db";

/** What Redux keeps about a save. The state bytes stay in IndexedDB. */
export type SaveMeta = Omit<SaveRecord, "state">;

export const toSaveMeta = ({ state: _state, ...meta }: SaveRecord): SaveMeta =>
  meta;

export interface SavesState {
  gameSlug: string | null;
  items: SaveMeta[];
  status: "idle" | "loading" | "ready";
  busy: boolean;
}

const initialState: SavesState = {
  gameSlug: null,
  items: [],
  status: "idle",
  busy: false,
};

export const savesSlice = createSlice({
  name: "saves",
  initialState,
  reducers: {
    savesRequested(state, action: PayloadAction<string>) {
      state.gameSlug = action.payload;
      state.items = [];
      state.status = "loading";
    },
    savesLoaded(state, action: PayloadAction<SaveMeta[]>) {
      state.items = action.payload;
      state.status = "ready";
    },
    saveRequested(state) {
      state.busy = true;
    },
    saveAdded(state, action: PayloadAction<SaveMeta>) {
      state.busy = false;
      if (action.payload.gameSlug === state.gameSlug)
        state.items.unshift(action.payload);
    },
    saveDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    saveFailed(state) {
      state.busy = false;
    },
  },
  selectors: {
    selectSaves: (state) => state.items,
    selectSavesStatus: (state) => state.status,
    selectSaveBusy: (state) => state.busy,
  },
});

export const {
  savesRequested,
  savesLoaded,
  saveRequested,
  saveAdded,
  saveDeleted,
  saveFailed,
} = savesSlice.actions;

// Handled only by sagas, so they don't need a reducer.
export const saveLoadRequested = createAction<string>("saves/loadRequested");
export const saveDeleteRequested = createAction<string>(
  "saves/deleteRequested",
);
export const { selectSaves, selectSavesStatus, selectSaveBusy } =
  savesSlice.selectors;
