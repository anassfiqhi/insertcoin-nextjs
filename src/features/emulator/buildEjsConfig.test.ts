import { describe, expect, it } from "vitest";

import {
  gba,
  kof2002Clone,
  makeGame,
  neogeo,
  snes,
  superMetroid,
  testEnv,
} from "@/test/fixtures";

import { buildEjsConfig, gameIdFromSlug } from "./buildEjsConfig";

describe("buildEjsConfig", () => {
  it("arcade clone: sets the arcade core, parent ROM and required BIOS", () => {
    const { globals, files } = buildEjsConfig({
      game: kof2002Clone,
      system: neogeo,
      env: testEnv,
      player: "#p",
    });

    expect(globals).toEqual({
      EJS_player: "#p",
      EJS_core: "arcade",
      EJS_gameUrl: "/roms/neogeo/kf2k2plc.zip",
      EJS_externalFiles: { "/kof2002.zip": "/roms/neogeo/kof2002.zip" },
      EJS_biosUrl: "/bios/neogeo/neogeo.7z",
      EJS_gameName: "kof2002-plus",
      EJS_pathtodata: "https://cdn.emulatorjs.org/stable/data/",
      EJS_color: "#e11d48",
      EJS_threads: undefined,
      EJS_DEBUG_XX: undefined,
      EJS_EXPERIMENTAL_NETPLAY: undefined,
      EJS_gameID: undefined,
      EJS_netplayServer: undefined,
      EJS_Buttons: undefined,
    });
    expect(
      files.map(({ kind, location, required }) => ({
        kind,
        location,
        required,
      })),
    ).toEqual([
      {
        kind: "rom",
        location: "public/roms/neogeo/kf2k2plc.zip",
        required: true,
      },
      {
        kind: "parent",
        location: "public/roms/neogeo/kof2002.zip",
        required: true,
      },
      {
        kind: "bios",
        location: "public/bios/neogeo/neogeo.7z",
        required: true,
      },
    ]);
  });

  it("console without BIOS: only needs the ROM", () => {
    const { globals, files } = buildEjsConfig({
      game: superMetroid,
      system: snes,
      env: testEnv,
      player: "#p",
    });

    expect(globals.EJS_core).toBe("snes");
    expect(globals.EJS_externalFiles).toBeUndefined();
    expect(globals.EJS_biosUrl).toBeUndefined();
    expect(files).toHaveLength(1);
  });

  it("handheld with optional BIOS: lists the BIOS as not required", () => {
    const game = makeGame({
      slug: "golden-sun",
      system: "gba",
      rom: "golden sun.gba",
    });
    const { globals, files } = buildEjsConfig({
      game,
      system: gba,
      env: testEnv,
      player: "#p",
    });

    expect(globals.EJS_gameUrl).toBe("/roms/gba/golden%20sun.gba");
    expect(files.find((file) => file.kind === "bios")?.required).toBe(false);
  });

  it("remote base URLs are used as-is and shown as the location", () => {
    const env = {
      ...testEnv,
      NEXT_PUBLIC_ROM_BASE_URL: "https://files.example.com/roms/",
      NEXT_PUBLIC_EJS_THREADS: true,
    };
    const { globals, files } = buildEjsConfig({
      game: superMetroid,
      system: snes,
      env,
      player: "#p",
    });

    expect(globals.EJS_gameUrl).toBe(
      "https://files.example.com/roms/snes/super-metroid.sfc",
    );
    expect(files[0]?.location).toBe(
      "https://files.example.com/roms/snes/super-metroid.sfc",
    );
    expect(globals.EJS_threads).toBe(true);
  });
});

describe("netplay", () => {
  const netplayEnv = {
    ...testEnv,
    NEXT_PUBLIC_EJS_NETPLAY: true,
    NEXT_PUBLIC_EJS_NETPLAY_SERVER: "https://netplay.example.com",
  };

  it("sets the three globals EmulatorJS needs plus the room server", () => {
    const { globals } = buildEjsConfig({
      game: superMetroid,
      system: snes,
      env: netplayEnv,
      player: "#p",
    });

    expect(globals.EJS_DEBUG_XX).toBe(true);
    expect(globals.EJS_EXPERIMENTAL_NETPLAY).toBe(true);
    expect(globals.EJS_gameID).toBe(gameIdFromSlug(superMetroid.slug));
    expect(globals.EJS_netplayServer).toBe("https://netplay.example.com");
    // EmulatorJS hides the netplay toolbar button unless it is asked for.
    expect(globals.EJS_Buttons).toEqual({ netplay: true });
  });

  it("leaves netplay off by default", () => {
    const { globals } = buildEjsConfig({
      game: superMetroid,
      system: snes,
      env: testEnv,
      player: "#p",
    });

    expect(globals.EJS_DEBUG_XX).toBeUndefined();
    expect(globals.EJS_gameID).toBeUndefined();
    expect(globals.EJS_Buttons).toBeUndefined();
  });
});

describe("gameIdFromSlug", () => {
  it("is stable, positive and differs per game", () => {
    expect(gameIdFromSlug("super-metroid")).toBe(
      gameIdFromSlug("super-metroid"),
    );
    expect(gameIdFromSlug("super-metroid")).toBeGreaterThan(0);
    expect(gameIdFromSlug("super-metroid")).not.toBe(
      gameIdFromSlug("metal-slug-x"),
    );
  });
});
