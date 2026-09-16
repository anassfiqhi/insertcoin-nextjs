import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { describe, expect, it } from "vitest";

import { createCatalogState } from "@/features/catalog/catalogSlice";
import { rootReducer, type RootState } from "@/lib/store/store";
import { gba, kof2002Clone, makeGame, neogeo } from "@/test/fixtures";

import {
  applyEjsGlobals,
  checkFile,
  createEjsChannel,
  injectEjsLoader,
} from "./ejs";
import { emulatorSaga, reloadPage, runSession } from "./emulatorSaga";
import {
  emulatorLoading,
  filesMissing,
  sessionEnded,
  sessionFailed,
  sessionStarted,
} from "./emulatorSlice";

const goldenSun = makeGame({
  slug: "golden-sun",
  system: "gba",
  rom: "golden-sun.gba",
});

const state = (): RootState => ({
  ...rootReducer(undefined, { type: "@@init" }),
  systems: { items: [neogeo, gba] },
  catalog: createCatalogState([kof2002Clone, goldenSun]),
});

describe("runSession", () => {
  it("fails for an unknown game", () => {
    return expectSaga(runSession, "nope", "#player")
      .withReducer(rootReducer, state())
      .put(sessionFailed('Unknown game "nope"'))
      .run();
  });

  it("stops and lists the required files that are missing", async () => {
    const { storeState } = await expectSaga(
      runSession,
      kof2002Clone.slug,
      "#player",
    )
      .withReducer(rootReducer, state())
      .provide({
        call(effect, next) {
          if (effect.fn === checkFile) {
            const [url] = effect.args as [string];
            return url.endsWith("kf2k2plc.zip") ? "ok" : "missing";
          }
          return next();
        },
      })
      .not.call.fn(injectEjsLoader)
      .run();

    expect((storeState as RootState).emulator.status).toBe("missing-files");
    expect(
      (storeState as RootState).emulator.missingFiles.map(
        (file) => file.location,
      ),
    ).toEqual([
      "public/roms/neogeo/kof2002.zip",
      "public/bios/neogeo/neogeo.7z",
    ]);
  });

  it("drops a missing optional BIOS and boots anyway", async () => {
    const { effects } = await expectSaga(runSession, goldenSun.slug, "#player")
      .withReducer(rootReducer, state())
      .provide({
        call(effect, next) {
          if (effect.fn === checkFile) {
            const [url] = effect.args as [string];
            return url.includes("/bios/") ? "missing" : "ok";
          }
          if (
            effect.fn === injectEjsLoader ||
            effect.fn === applyEjsGlobals ||
            effect.fn === reloadPage
          ) {
            return undefined;
          }
          return next();
        },
      })
      .put(emulatorLoading())
      .not.put.actionType(filesMissing.type)
      // silentRun cancels the saga after it has injected the loader, which must trigger a reload.
      .call(reloadPage)
      .silentRun(50);

    const applied = effects.call?.find((e) => e.payload.fn === applyEjsGlobals)
      ?.payload.args[0];
    expect(applied).toMatchObject({
      EJS_core: "gba",
      EJS_gameUrl: "/roms/gba/golden-sun.gba",
    });
    expect(applied).not.toHaveProperty("EJS_biosUrl");
  });
});

describe("emulatorSaga", () => {
  it("ends the session when sessionEnded is dispatched before the files are checked", async () => {
    const { storeState } = await expectSaga(emulatorSaga)
      .withReducer(rootReducer, state())
      .provide([[matchers.call.fn(checkFile), new Promise(() => {})]])
      .not.call.fn(createEjsChannel)
      .dispatch(sessionStarted({ slug: kof2002Clone.slug, player: "#player" }))
      .dispatch(sessionEnded())
      .silentRun(50);

    expect((storeState as RootState).emulator.status).toBe("idle");
  });
});
