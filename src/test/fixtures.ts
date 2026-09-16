import type { Game } from "@/features/catalog/schemas";
import type { System } from "@/features/systems/schemas";

export const neogeo: System = {
  id: "neogeo",
  name: "Neo Geo MVS/AES",
  shortName: "Neo Geo",
  badge: "NEO",
  manufacturer: "SNK",
  year: 1990,
  kind: "arcade",
  core: "arcade",
  extensions: [".zip", ".7z"],
  bios: { file: "neogeo.7z", required: true, hint: "Contains neogeo.zip" },
  controls: "Arrows move",
  accent: "#e11d48",
};

export const gba: System = {
  id: "gba",
  name: "Game Boy Advance",
  shortName: "GBA",
  badge: "GBA",
  manufacturer: "Nintendo",
  year: 2001,
  kind: "handheld",
  core: "gba",
  extensions: [".gba", ".zip"],
  bios: { file: "gba_bios.bin", required: false },
  controls: "Arrows move",
  accent: "#8b5cf6",
};

export const snes: System = {
  id: "snes",
  name: "Super Nintendo",
  shortName: "SNES",
  badge: "SNES",
  manufacturer: "Nintendo",
  year: 1990,
  kind: "console",
  core: "snes",
  extensions: [".sfc", ".smc", ".zip"],
  controls: "Arrows move",
  accent: "#6366f1",
};

export const makeGame = (overrides: Partial<Game> = {}): Game => ({
  slug: "metal-slug-x",
  title: "Metal Slug X",
  system: "neogeo",
  rom: "mslugx.zip",
  year: 1999,
  publisher: "SNK",
  genres: ["Run and gun"],
  players: 2,
  description: "Run and gun.",
  ...overrides,
});

export const kof2002 = makeGame({
  slug: "the-king-of-fighters-2002",
  title: "The King of Fighters 2002",
  rom: "kof2002.zip",
  year: 2002,
  publisher: "Playmore",
  genres: ["Fighting"],
});

export const kof2002Clone = makeGame({
  slug: "kof2002-plus",
  title: "The King of Fighters 2002 Super",
  rom: "kf2k2plc.zip",
  parentRom: "kof2002.zip",
  year: 2002,
  publisher: "bootleg",
  genres: ["Fighting"],
});

export const superMetroid = makeGame({
  slug: "super-metroid",
  title: "Super Metroid",
  system: "snes",
  rom: "super-metroid.sfc",
  year: 1994,
  publisher: "Nintendo",
  genres: ["Action-adventure"],
  players: 1,
});

export const testEnv = {
  NEXT_PUBLIC_EJS_DATA_PATH: "https://cdn.emulatorjs.org/stable/data/",
  NEXT_PUBLIC_ROM_BASE_URL: "/roms",
  NEXT_PUBLIC_BIOS_BASE_URL: "/bios",
  NEXT_PUBLIC_EJS_THREADS: false,
};
