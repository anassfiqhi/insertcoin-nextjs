"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { Game } from "@/features/catalog/schemas";
import type { System } from "@/features/systems/schemas";
import { env } from "@/lib/env";

const PLAYER_ID = "ejs-legacy-player";
const LEGACY_LOADER = "https://www.emulatorjs.com/loader.js";

/**
 * Loads the legacy EmulatorJS build (0.5.x) instead of 4.2.3.
 * Only that build has working netplay: 4.2.3's own source marks control
 * syncing as broken. It reads the same EJS_* globals, minus the 4.x-only ones,
 * and uses its own public lobby (lobby.emulatorjs.com) keyed by ROM CRC.
 */
export function LegacyPlayer({ game, system }: { game: Game; system: System }) {
  const started = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const romBase = env.NEXT_PUBLIC_ROM_BASE_URL.replace(/\/+$/, "");
    const biosBase = env.NEXT_PUBLIC_BIOS_BASE_URL.replace(/\/+$/, "");
    const globals: Record<string, unknown> = {
      EJS_player: `#${PLAYER_ID}`,
      EJS_core: system.core,
      EJS_gameUrl: `${romBase}/${system.id}/${game.rom}`,
      EJS_color: system.accent,
    };
    if (game.parentRom) {
      globals.EJS_gameParentUrl = `${romBase}/${system.id}/${game.parentRom}`;
    }
    if (system.bios) {
      globals.EJS_biosUrl = `${biosBase}/${system.id}/${system.bios.file}`;
    }
    Object.assign(window as unknown as Record<string, unknown>, globals);

    const script = document.createElement("script");
    script.src = LEGACY_LOADER;
    script.onload = () => setStatus("ready");
    script.onerror = () => setStatus("error");
    document.body.appendChild(script);
  }, [game, system]);

  return (
    <div className="space-y-3">
      <div
        id={PLAYER_ID}
        data-emulator-frame
        // This page's header (back link, title, subtitle) is taller than /play's.
        style={{ "--chrome-landscape": "12rem" } as CSSProperties}
        className="emulator-frame mx-auto aspect-[4/3] overflow-hidden rounded-xl bg-black ring-1 ring-foreground/10"
      />
      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          Could not load the legacy EmulatorJS build from {LEGACY_LOADER}.
        </p>
      )}
    </div>
  );
}
