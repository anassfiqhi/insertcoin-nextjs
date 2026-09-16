import { all, call, put, select, take, takeEvery } from "redux-saga/effects";

import { appStarted } from "@/lib/store/appActions";
import { readList, writeList, type LibraryKey } from "@/lib/db";

import {
  favoriteToggled,
  gamePlayed,
  libraryLoaded,
  selectFavorites,
  selectLibraryLoaded,
  selectRecent,
} from "./librarySlice";

export function* loadLibrary() {
  yield take(appStarted.type);
  try {
    const [favorites, recent]: [string[], string[]] = yield all([
      call(readList, "favorites"),
      call(readList, "recent"),
    ]);
    yield put(libraryLoaded({ favorites, recent }));
  } catch (error) {
    console.error("Could not read the library from IndexedDB", error);
    yield put(libraryLoaded({ favorites: [], recent: [] }));
  }
}

function persist(key: LibraryKey, selector: typeof selectFavorites) {
  return function* () {
    const loaded: boolean = yield select(selectLibraryLoaded);
    if (!loaded) return;
    const value: string[] = yield select(selector);
    try {
      yield call(writeList, key, value);
    } catch (error) {
      console.error(`Could not save ${key}`, error);
    }
  };
}

export function* librarySaga() {
  yield all([
    call(loadLibrary),
    takeEvery(favoriteToggled.type, persist("favorites", selectFavorites)),
    takeEvery(gamePlayed.type, persist("recent", selectRecent)),
  ]);
}
