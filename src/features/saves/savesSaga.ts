import type { PayloadAction } from "@reduxjs/toolkit";
import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
  takeLeading,
} from "redux-saga/effects";
import { toast } from "sonner";

import {
  captureScreenshot,
  getEmulatorState,
  loadEmulatorState,
} from "@/features/emulator/ejs";
import {
  selectEmulator,
  type EmulatorState,
} from "@/features/emulator/emulatorSlice";
import {
  deleteSave,
  getSave,
  listSaves,
  putSave,
  type SaveRecord,
} from "@/lib/db";
import { errorMessage } from "@/lib/errors";

import {
  saveAdded,
  saveDeleted,
  saveDeleteRequested,
  saveFailed,
  saveLoadRequested,
  saveRequested,
  savesLoaded,
  savesRequested,
  toSaveMeta,
} from "./savesSlice";

/** Stores a state in IndexedDB. Called from the save button and from EmulatorJS's own save button. */
export function* persistSave(gameSlug: string, state: Uint8Array) {
  try {
    const screenshot: string | undefined = yield call(captureScreenshot);
    const record: SaveRecord = {
      id: crypto.randomUUID(),
      gameSlug,
      createdAt: Date.now(),
      state,
      screenshot,
    };
    yield call(putSave, record);
    yield put(saveAdded(toSaveMeta(record)));
    yield call(toast.success, "State saved");
  } catch (error) {
    yield put(saveFailed());
    yield call(toast.error, `Could not save state: ${errorMessage(error)}`);
  }
}

export function* restoreSave(record: SaveRecord) {
  try {
    yield call(loadEmulatorState, record.state);
    yield call(toast.success, "State loaded");
  } catch (error) {
    yield call(toast.error, `Could not load state: ${errorMessage(error)}`);
  }
}

/** EmulatorJS's own "load state" button loads the newest save. */
export function* restoreLatestSave(gameSlug: string) {
  const [latest]: SaveRecord[] = yield call(listSaves, gameSlug);
  if (!latest) {
    yield call(toast.info, "No saved states for this game yet");
    return;
  }
  yield call(restoreSave, latest);
}

function* handleSavesRequested(action: PayloadAction<string>) {
  try {
    const records: SaveRecord[] = yield call(listSaves, action.payload);
    yield put(savesLoaded(records.map(toSaveMeta)));
  } catch (error) {
    console.error("Could not list saves", error);
    yield put(savesLoaded([]));
  }
}

function* handleSaveRequested() {
  const { slug }: EmulatorState = yield select(selectEmulator);
  try {
    if (!slug) throw new Error("No game is running");
    const state: Uint8Array = yield call(getEmulatorState);
    yield call(persistSave, slug, state);
  } catch (error) {
    yield put(saveFailed());
    yield call(toast.error, errorMessage(error));
  }
}

function* handleLoadRequested(action: PayloadAction<string>) {
  const record: SaveRecord | undefined = yield call(getSave, action.payload);
  if (!record) {
    yield call(toast.error, "That save no longer exists");
    return;
  }
  yield call(restoreSave, record);
}

function* handleDeleteRequested(action: PayloadAction<string>) {
  try {
    yield call(deleteSave, action.payload);
    yield put(saveDeleted(action.payload));
  } catch (error) {
    yield call(toast.error, `Could not delete save: ${errorMessage(error)}`);
  }
}

export function* savesSaga() {
  yield all([
    takeLatest(savesRequested.type, handleSavesRequested),
    takeLeading(saveRequested.type, handleSaveRequested),
    takeLatest(saveLoadRequested.type, handleLoadRequested),
    takeEvery(saveDeleteRequested.type, handleDeleteRequested),
  ]);
}
