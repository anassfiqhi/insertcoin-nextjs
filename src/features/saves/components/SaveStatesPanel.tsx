"use client";

import { Download, Save, Trash2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { selectEmulator } from "@/features/emulator/emulatorSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

import {
  saveDeleteRequested,
  saveLoadRequested,
  saveRequested,
  savesRequested,
  selectSaveBusy,
  selectSaves,
  selectSavesStatus,
} from "../savesSlice";

const formatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function SaveStatesPanel({ slug }: { slug: string }) {
  const dispatch = useAppDispatch();
  const saves = useAppSelector(selectSaves);
  const status = useAppSelector(selectSavesStatus);
  const busy = useAppSelector(selectSaveBusy);
  const running = useAppSelector(selectEmulator).status === "running";

  useEffect(() => {
    dispatch(savesRequested(slug));
  }, [dispatch, slug]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="font-pixel text-xs">SAVE STATES</CardTitle>
        <Button
          size="sm"
          onClick={() => dispatch(saveRequested())}
          disabled={!running || busy}
        >
          <Save aria-hidden /> Save now
        </Button>
      </CardHeader>
      <CardContent>
        {status !== "ready" ? (
          <div className="space-y-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : saves.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saves yet. Use <strong>Save now</strong> or the save button in
            the emulator toolbar.
          </p>
        ) : (
          <ul className="space-y-2">
            {saves.map((save) => (
              <li
                key={save.id}
                className="flex items-center gap-3 rounded-lg bg-muted/50 p-2"
              >
                {save.screenshot ? (
                  // Data URLs from IndexedDB, so next/image optimisation doesn't apply.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={save.screenshot}
                    alt=""
                    className="h-12 w-16 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-16 rounded bg-black/40" aria-hidden />
                )}
                <span className="flex-1 text-sm">
                  {formatter.format(save.createdAt)}
                </span>
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={!running}
                  aria-label="Load this state"
                  title="Load this state"
                  onClick={() => dispatch(saveLoadRequested(save.id))}
                >
                  <Download aria-hidden />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Delete this state"
                  title="Delete this state"
                  onClick={() => dispatch(saveDeleteRequested(save.id))}
                >
                  <Trash2 aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
