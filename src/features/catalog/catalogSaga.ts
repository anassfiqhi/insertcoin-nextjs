import type { Task } from "redux-saga";
import {
  call,
  cancel,
  cancelled,
  delay,
  fork,
  put,
  select,
  take,
} from "redux-saga/effects";

import { errorMessage } from "@/lib/errors";

import { fetchGames } from "./api";
import {
  catalogOpened,
  fetchFailed,
  fetchSucceeded,
  queryChanged,
  selectCatalogQuery,
} from "./catalogSlice";
import type { Game, GameQuery } from "./schemas";

export const SEARCH_DEBOUNCE_MS = 300;

export function* loadGames() {
  const controller = new AbortController();
  try {
    const query: GameQuery = yield select(selectCatalogQuery);
    const games: Game[] = yield call(fetchGames, query, controller.signal);
    yield put(fetchSucceeded(games));
  } catch (error) {
    yield put(fetchFailed(errorMessage(error)));
  } finally {
    if ((yield cancelled()) as boolean) controller.abort();
  }
}

function* debouncedLoadGames() {
  yield delay(SEARCH_DEBOUNCE_MS);
  yield call(loadGames);
}

/**
 * Each new action cancels the previous task, whether it is still waiting out
 * the debounce or has a request in flight, so stale results never land.
 * Opening a catalog fetches right away. Typing is debounced.
 */
export function* catalogSaga() {
  let task: Task | undefined;
  while (true) {
    const action: ReturnType<typeof catalogOpened | typeof queryChanged> =
      yield take([catalogOpened.type, queryChanged.type]);
    if (task) yield cancel(task);
    task = yield fork(
      catalogOpened.match(action) ? loadGames : debouncedLoadGames,
    );
  }
}
