import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { describe, expect, it, vi } from "vitest";

import { rootReducer } from "@/lib/store/store";
import { kof2002, kof2002Clone } from "@/test/fixtures";

import { fetchGames } from "./api";
import { catalogSaga, loadGames } from "./catalogSaga";
import {
  catalogOpened,
  createCatalogState,
  fetchFailed,
  fetchSucceeded,
  queryChanged,
} from "./catalogSlice";

const initialState = () => ({
  ...rootReducer(undefined, { type: "@@init" }),
  catalog: createCatalogState([kof2002, kof2002Clone]),
});

describe("loadGames", () => {
  it("fetches with the current query and stores the results", async () => {
    const { storeState } = await expectSaga(loadGames)
      .withReducer(rootReducer, initialState())
      .provide([[matchers.call.fn(fetchGames), [kof2002]]])
      .put(fetchSucceeded([kof2002]))
      .run();

    expect(storeState.catalog.resultSlugs).toEqual([kof2002.slug]);
  });

  it("puts fetchFailed with the error message", () => {
    return expectSaga(loadGames)
      .withReducer(rootReducer, initialState())
      .provide([
        [matchers.call.fn(fetchGames), throwError(new Error("offline"))],
      ])
      .put(fetchFailed("offline"))
      .run();
  });
});

describe("catalogSaga", () => {
  it("fetches right away when a catalog opens", () => {
    return expectSaga(catalogSaga)
      .withReducer(rootReducer, initialState())
      .provide([[matchers.call.fn(fetchGames), [kof2002]]])
      .dispatch(catalogOpened({ system: "neogeo" }))
      .put(fetchSucceeded([kof2002]))
      .silentRun(50);
  });

  it("debounces typing and only fetches once, with the final query", async () => {
    const fetchSpy = vi.fn(async () => [kof2002Clone]);

    await expectSaga(catalogSaga)
      .withReducer(rootReducer, initialState())
      .provide({
        call(effect, next) {
          if (effect.fn === fetchGames) return fetchSpy(...(effect.args as []));
          return next();
        },
      })
      .dispatch(queryChanged({ q: "k" }))
      .dispatch(queryChanged({ q: "ko" }))
      .dispatch(queryChanged({ q: "kof" }))
      .put(fetchSucceeded([kof2002Clone]))
      .silentRun(500);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ q: "kof" }),
      expect.any(AbortSignal),
    );
  });
});
