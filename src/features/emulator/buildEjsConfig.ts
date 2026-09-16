import type { Game } from "@/features/catalog/schemas";
import type { System } from "@/features/systems/schemas";
import type { Env } from "@/lib/env";

import type { EjsGlobals } from "./ejs";

export interface RequiredFile {
  kind: "rom" | "parent" | "bios";
  url: string;
  /** Where to put the file, shown to the user when it is missing. */
  location: string;
  required: boolean;
  hint?: string;
}

export interface EjsSessionConfig {
  globals: EjsGlobals;
  files: RequiredFile[];
}

interface BuildOptions {
  game: Game;
  system: System;
  env: Pick<
    Env,
    | "NEXT_PUBLIC_EJS_DATA_PATH"
    | "NEXT_PUBLIC_ROM_BASE_URL"
    | "NEXT_PUBLIC_BIOS_BASE_URL"
    | "NEXT_PUBLIC_EJS_THREADS"
  >;
  player: string;
}

const joinUrl = (base: string, ...segments: string[]) =>
  [base.replace(/\/+$/, ""), ...segments.map(encodeURIComponent)].join("/");

/** Root-relative base URLs are served from `public/`. Anything else is a remote host. */
const describeLocation = (base: string, ...segments: string[]) =>
  base.startsWith("/")
    ? ["public", base.replace(/^\/+|\/+$/g, ""), ...segments].join("/")
    : joinUrl(base, ...segments);

/** Pure mapping from a game and its system to EmulatorJS globals plus the files they reference. */
export function buildEjsConfig({
  game,
  system,
  env,
  player,
}: BuildOptions): EjsSessionConfig {
  const romBase = env.NEXT_PUBLIC_ROM_BASE_URL;
  const biosBase = env.NEXT_PUBLIC_BIOS_BASE_URL;

  const files: RequiredFile[] = [
    {
      kind: "rom",
      url: joinUrl(romBase, system.id, game.rom),
      location: describeLocation(romBase, system.id, game.rom),
      required: true,
    },
  ];

  if (game.parentRom) {
    files.push({
      kind: "parent",
      url: joinUrl(romBase, system.id, game.parentRom),
      location: describeLocation(romBase, system.id, game.parentRom),
      required: true,
      hint: "Clone sets need their parent ROM set.",
    });
  }

  if (system.bios) {
    files.push({
      kind: "bios",
      url: joinUrl(biosBase, system.id, system.bios.file),
      location: describeLocation(biosBase, system.id, system.bios.file),
      required: system.bios.required,
      hint: system.bios.hint,
    });
  }

  const urlOf = (kind: RequiredFile["kind"]) =>
    files.find((file) => file.kind === kind)?.url;

  return {
    files,
    globals: {
      EJS_player: player,
      EJS_core: system.core,
      EJS_gameUrl: urlOf("rom") ?? "",
      EJS_gameName: game.slug,
      EJS_pathtodata: env.NEXT_PUBLIC_EJS_DATA_PATH,
      EJS_gameParentUrl: urlOf("parent"),
      EJS_biosUrl: urlOf("bios"),
      EJS_color: system.accent,
      EJS_threads: env.NEXT_PUBLIC_EJS_THREADS || undefined,
    },
  };
}
