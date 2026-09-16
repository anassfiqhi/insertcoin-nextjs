import { expectSaga } from "redux-saga-test-plan";
import { describe, expect, it } from "vitest";

import { readList, writeList } from "@/lib/db";
import { appStarted } from "@/lib/store/appActions";
import { rootReducer } from "@/lib/store/store";

import { librarySaga } from "./librarySaga";
import { favoriteToggled, libraryLoaded } from "./librarySlice";

// These run against fake-indexeddb (see vitest.setup.ts), so real reads and writes are checked.
describe("librarySaga", () => {
  it("loads favorites and recent games from IndexedDB once the app starts", async () => {
    await writeList("favorites", ["metal-slug-x"]);
    await writeList("recent", ["super-metroid"]);

    await expectSaga(librarySaga)
      .withReducer(rootReducer)
      .dispatch(appStarted())
      .put(
        libraryLoaded({
          favorites: ["metal-slug-x"],
          recent: ["super-metroid"],
        }),
      )
      .silentRun(100);
  });

  it("writes favorites after a toggle, but only once the library has loaded", async () => {
    await writeList("favorites", ["kept"]);

    await expectSaga(librarySaga)
      .withReducer(rootReducer)
      .dispatch(favoriteToggled("too-early"))
      .dispatch(appStarted())
      .delay(50)
      .dispatch(favoriteToggled("pac-man"))
      .silentRun(150);

    expect(await readList("favorites")).toEqual(["pac-man", "kept"]);
  });
});
