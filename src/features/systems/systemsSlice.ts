import { createSlice } from "@reduxjs/toolkit";

import type { System } from "./schemas";

export interface SystemsState {
  items: System[];
}

const initialState: SystemsState = { items: [] };

export const systemsSlice = createSlice({
  name: "systems",
  initialState,
  reducers: {},
  selectors: {
    selectSystems: (state) => state.items,
    selectSystemById: (state, id: string) =>
      state.items.find((system) => system.id === id),
  },
});

export const { selectSystems, selectSystemById } = systemsSlice.selectors;
