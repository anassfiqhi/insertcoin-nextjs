import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { RequiredFile } from "./buildEjsConfig";

export type EmulatorStatus =
  "idle" | "checking" | "missing-files" | "loading" | "running" | "error";

export interface EmulatorState {
  slug: string | null;
  status: EmulatorStatus;
  missingFiles: RequiredFile[];
  error: string | null;
}

const initialState: EmulatorState = {
  slug: null,
  status: "idle",
  missingFiles: [],
  error: null,
};

export const emulatorSlice = createSlice({
  name: "emulator",
  initialState,
  reducers: {
    sessionStarted(
      state,
      action: PayloadAction<{ slug: string; player: string }>,
    ) {
      state.slug = action.payload.slug;
      state.status = "checking";
      state.missingFiles = [];
      state.error = null;
    },
    filesMissing(state, action: PayloadAction<RequiredFile[]>) {
      state.status = "missing-files";
      state.missingFiles = action.payload;
    },
    emulatorLoading(state) {
      state.status = "loading";
    },
    gameStarted(state) {
      state.status = "running";
    },
    sessionFailed(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    sessionEnded() {
      return initialState;
    },
  },
  selectors: {
    selectEmulator: (state) => state,
  },
});

export const {
  sessionStarted,
  filesMissing,
  emulatorLoading,
  gameStarted,
  sessionFailed,
  sessionEnded,
} = emulatorSlice.actions;
export const { selectEmulator } = emulatorSlice.selectors;
