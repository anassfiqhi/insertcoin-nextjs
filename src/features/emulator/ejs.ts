import { eventChannel } from "redux-saga";

import type { EjsCore } from "@/features/systems/schemas";

/** The `EJS_*` globals the EmulatorJS 4.x loader reads when it runs. */
export interface EjsGlobals {
  EJS_player: string;
  EJS_core: EjsCore;
  EJS_gameUrl: string;
  EJS_gameName: string;
  EJS_pathtodata: string;
  EJS_gameParentUrl?: string;
  EJS_biosUrl?: string;
  EJS_color?: string;
  EJS_threads?: boolean;
}

export interface EjsSaveStateEvent {
  state: Uint8Array;
}

/** The parts of the `EmulatorJS` instance this app uses. */
export interface EmulatorJSInstance {
  gameManager?: {
    getState(): Uint8Array;
    loadState(state: Uint8Array): void;
  };
  takeScreenshot?(
    source?: string,
    format?: string,
    upscale?: number,
  ): Promise<{ blob?: Blob }>;
  displayMessage?(message: string, time?: number): void;
}

declare global {
  interface Window extends Partial<EjsGlobals> {
    EJS_emulator?: EmulatorJSInstance;
    EJS_ready?: () => void;
    EJS_onGameStart?: () => void;
    EJS_onSaveState?: (event: EjsSaveStateEvent) => void;
    EJS_onLoadState?: () => void;
  }
}

const GLOBAL_KEYS = [
  "EJS_player",
  "EJS_core",
  "EJS_gameUrl",
  "EJS_gameName",
  "EJS_pathtodata",
  "EJS_gameParentUrl",
  "EJS_biosUrl",
  "EJS_color",
  "EJS_threads",
] as const satisfies readonly (keyof EjsGlobals)[];

export function applyEjsGlobals(globals: EjsGlobals): void {
  const target = window as unknown as Record<string, unknown>;
  for (const key of GLOBAL_KEYS) {
    if (globals[key] === undefined) delete target[key];
    else target[key] = globals[key];
  }
}

export function injectEjsLoader(dataPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${dataPath}loader.js`;
    script.async = true;
    script.dataset.ejsLoader = "";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Could not load EmulatorJS from ${script.src}`));
    document.body.appendChild(script);
  });
}

export type EjsMessage =
  | { type: "started" }
  | { type: "save-state"; state: Uint8Array }
  | { type: "load-state" };

/**
 * Turns EmulatorJS callbacks into a saga channel. When a callback is set,
 * EmulatorJS skips its own save/load handling, so the app decides where
 * states are stored.
 */
export function createEjsChannel() {
  return eventChannel<EjsMessage>((emit) => {
    window.EJS_onGameStart = () => emit({ type: "started" });
    window.EJS_onSaveState = (event) =>
      emit({ type: "save-state", state: event.state });
    window.EJS_onLoadState = () => emit({ type: "load-state" });

    return () => {
      delete window.EJS_onGameStart;
      delete window.EJS_onSaveState;
      delete window.EJS_onLoadState;
    };
  });
}

export type FileCheck = "ok" | "missing" | "unknown";

/** HEAD-checks a file. Only a 404/410 counts as missing. CORS and network errors give "unknown" and are not blocking. */
export async function checkFile(url: string): Promise<FileCheck> {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (response.ok) return "ok";
    return response.status === 404 || response.status === 410
      ? "missing"
      : "unknown";
  } catch {
    return "unknown";
  }
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * Captures the current frame as a data URL. EmulatorJS 4.2.3 passes
 * `screenshot: undefined` to `EJS_onSaveState`, so the frame is taken here instead.
 */
export async function captureScreenshot(): Promise<string | undefined> {
  try {
    const shot = await window.EJS_emulator?.takeScreenshot?.(
      "canvas",
      "webp",
      0.5,
    );
    return shot?.blob ? await blobToDataUrl(shot.blob) : undefined;
  } catch {
    return undefined;
  }
}

export function getEmulatorState(): Uint8Array {
  const manager = window.EJS_emulator?.gameManager;
  if (!manager) throw new Error("The emulator is not running");
  return manager.getState();
}

export function loadEmulatorState(state: Uint8Array): void {
  const manager = window.EJS_emulator?.gameManager;
  if (!manager) throw new Error("The emulator is not running");
  manager.loadState(state);
}
