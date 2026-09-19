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
    | "NEXT_PUBLIC_EJS_NETPLAY"
    | "NEXT_PUBLIC_EJS_NETPLAY_SERVER"
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

  const parentUrl = urlOf("parent");
  const netplay = env.NEXT_PUBLIC_EJS_NETPLAY;

  return {
    files,
    globals: {
      EJS_player: player,
      EJS_core: system.core,
      EJS_gameUrl: urlOf("rom") ?? "",
      EJS_gameName: game.slug,
      EJS_pathtodata: env.NEXT_PUBLIC_EJS_DATA_PATH,
      // The game zip is written to "/", so the parent set goes right beside it.
      EJS_externalFiles:
        game.parentRom && parentUrl
          ? { [`/${game.parentRom}`]: parentUrl }
          : undefined,
      EJS_biosUrl: urlOf("bios"),
      EJS_color: system.accent,
      EJS_threads: env.NEXT_PUBLIC_EJS_THREADS || undefined,
      EJS_DEBUG_XX: netplay || undefined,
      EJS_EXPERIMENTAL_NETPLAY: netplay || undefined,
      EJS_gameID: netplay ? gameIdFromSlug(game.slug) : undefined,
      EJS_netplayServer: netplay
        ? env.NEXT_PUBLIC_EJS_NETPLAY_SERVER
        : undefined,
      EJS_Buttons: netplay ? { netplay: true } : undefined,
    },
  };
}

/**
 * Netplay matches players on a numeric game id, so it has to be the same
 * number in both browsers. FNV-1a over the slug gives that without a registry.
 */
export function gameIdFromSlug(slug: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 1; // positive, and clear of the sign bit
}
