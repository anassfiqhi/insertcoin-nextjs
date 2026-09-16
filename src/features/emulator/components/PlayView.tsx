"use client";

import { ArrowLeft, Keyboard } from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Game } from "@/features/catalog/schemas";
import { SaveStatesPanel } from "@/features/saves/components/SaveStatesPanel";
import type { System } from "@/features/systems/schemas";

// EmulatorJS only runs in the browser, so the player is never server-rendered.
const EmulatorPlayer = dynamic(
  () => import("./EmulatorPlayer").then((m) => m.EmulatorPlayer),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-[4/3] w-full rounded-xl" />,
  },
);

export function PlayView({ game, system }: { game: Game; system: System }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold">{game.title}</h1>
            <p className="text-sm text-muted-foreground">{system.name}</p>
          </div>
          <Button
            variant="outline"
            // A full page load is the only way to stop EmulatorJS cleanly, so router.push isn't used here.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            onClick={() => window.location.assign(`/games/${game.slug}`)}
          >
            <ArrowLeft aria-hidden /> Exit
          </Button>
        </div>
        <EmulatorPlayer slug={game.slug} />
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-pixel text-xs">
              <Keyboard className="size-4" aria-hidden /> CONTROLS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {system.controls.split(" · ").map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="pt-2 text-xs">
              Change bindings and plug in gamepads from the emulator&apos;s
              control menu.
            </p>
          </CardContent>
        </Card>
        <SaveStatesPanel slug={game.slug} />
      </aside>
    </div>
  );
}
