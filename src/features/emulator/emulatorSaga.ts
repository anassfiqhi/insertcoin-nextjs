import type { PayloadAction } from "@reduxjs/toolkit";
import type { EventChannel } from "redux-saga";
import {
  all,
  call,
  cancelled,
  put,
  race,
  select,
  take,
  takeLatest,
} from "redux-saga/effects";

import { selectGameBySlug } from "@/features/catalog/catalogSlice";
import type { Game } from "@/features/catalog/schemas";
import { gamePlayed } from "@/features/library/librarySlice";
import { persistSave, restoreLatestSave } from "@/features/saves/savesSaga";
import type { System } from "@/features/systems/schemas";
import { selectSystemById } from "@/features/systems/systemsSlice";
import { env } from "@/lib/env";
import { errorMessage } from "@/lib/errors";
import type { RootState } from "@/lib/store/store";

import { buildEjsConfig } from "./buildEjsConfig";
import {
  applyEjsGlobals,
  checkFile,
  createEjsChannel,
  injectEjsLoader,
  type EjsMessage,
  type FileCheck,
} from "./ejs";
import {
  emulatorLoading,
  filesMissing,
  gameStarted,
  sessionEnded,
  sessionFailed,
  sessionStarted,
} from "./emulatorSlice";

/** EmulatorJS can't be torn down (WASM module, audio context, global listeners), so a full reload is the only clean exit. */
export const reloadPage = () => {
  setTimeout(() => window.location.reload(), 0);
};

export function* runSession(slug: string, player: string) {
  const game: Game | undefined = yield select((state: RootState) =>
    selectGameBySlug(state, slug),
  );
  const system: System | undefined = game
    ? yield select((state: RootState) => selectSystemById(state, game.system))
    : undefined;

  if (!game || !system) {
    yield put(sessionFailed(`Unknown game "${slug}"`));
    return;
  }

  const { globals, files } = buildEjsConfig({ game, system, env, player });
  const checks: FileCheck[] = yield all(
    files.map((file) => call(checkFile, file.url)),
  );
  const missing = files.filter((_, index) => checks[index] === "missing");
  const missingRequired = missing.filter((file) => file.required);

  if (missingRequired.length > 0) {
    yield put(filesMissing(missingRequired));
    return;
  }

  // An optional BIOS that isn't there is left out so the core can use its built-in fallback.
  if (missing.some((file) => file.kind === "bios")) delete globals.EJS_biosUrl;

  const channel: EventChannel<EjsMessage> = yield call(createEjsChannel);
  let injected = false;

  try {
    yield put(emulatorLoading());
    yield call(applyEjsGlobals, globals);
    injected = true;
    yield call(injectEjsLoader, globals.EJS_pathtodata);
    yield put(gamePlayed(slug));

    while (true) {
      const message: EjsMessage = yield take(channel);
      switch (message.type) {
        case "started":
          yield put(gameStarted());
          break;
        case "save-state":
          yield call(persistSave, slug, message.state);
          break;
        case "load-state":
          yield call(restoreLatestSave, slug);
          break;
      }
    }
  } catch (error) {
    yield put(sessionFailed(errorMessage(error)));
  } finally {
    channel.close();
    if (((yield cancelled()) as boolean) && injected) yield call(reloadPage);
  }
}

function* handleSessionStarted(
  action: PayloadAction<{ slug: string; player: string }>,
) {
  const { slug, player } = action.payload;
  yield race({
    session: call(runSession, slug, player),
    ended: take(sessionEnded.type),
  });
}

export function* emulatorSaga() {
  yield takeLatest(sessionStarted.type, handleSessionStarted);
}
