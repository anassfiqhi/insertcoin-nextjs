"use client";

import { AlertTriangle, FileWarning, Loader2 } from "lucide-react";
import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

import type { RequiredFile } from "../buildEjsConfig";
import { selectEmulator, sessionEnded, sessionStarted } from "../emulatorSlice";

const PLAYER_ID = "ejs-player";

const fileLabels: Record<RequiredFile["kind"], string> = {
  rom: "Game ROM",
  parent: "Parent ROM set",
  bios: "System BIOS",
};

function MissingFiles({ files }: { files: RequiredFile[] }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 p-6 text-left" role="alert">
      <div className="flex items-center gap-2 font-pixel text-xs text-primary">
        <FileWarning className="size-5" aria-hidden /> MISSING FILES
      </div>
      <p className="text-sm text-muted-foreground">
        InsertCoin doesn&apos;t ship any ROMs or BIOS files. Add files you
        legally own at these paths, then reload:
      </p>
      <ul className="space-y-3">
        {files.map((file) => (
          <li key={file.url} className="rounded-lg bg-muted/60 p-3">
            <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {fileLabels[file.kind]}
            </div>
            <code
              className="mt-1 block text-sm break-all text-foreground"
              data-testid="missing-file"
            >
              {file.location}
            </code>
            {file.hint && (
              <p className="mt-1 text-xs text-muted-foreground">{file.hint}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmulatorPlayer({ slug }: { slug: string }) {
  const dispatch = useAppDispatch();
  const { status, missingFiles, error } = useAppSelector(selectEmulator);

  useEffect(() => {
    dispatch(sessionStarted({ slug, player: `#${PLAYER_ID}` }));
    return () => {
      dispatch(sessionEnded());
    };
  }, [dispatch, slug]);

  const showPlayer = status === "loading" || status === "running";

  return (
    <div
      data-emulator-frame
      className="emulator-frame scanlines relative mx-auto aspect-[4/3] overflow-hidden rounded-xl bg-black ring-1 ring-foreground/10"
    >
      {/* EmulatorJS owns everything inside this node. React never renders children into it. */}
      <div
        id={PLAYER_ID}
        className="absolute inset-0 z-0"
        hidden={!showPlayer}
      />

      {!showPlayer && (
        <div className="absolute inset-0 z-10 grid place-items-center overflow-y-auto">
          {(status === "idle" || status === "checking") && (
            <p className="flex items-center gap-2 font-pixel text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden /> CHECKING
              FILES…
            </p>
          )}
          {status === "missing-files" && <MissingFiles files={missingFiles} />}
          {status === "error" && (
            <p
              role="alert"
              className="flex max-w-md items-center gap-2 p-6 text-sm text-destructive"
            >
              <AlertTriangle className="size-5 shrink-0" aria-hidden /> {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
