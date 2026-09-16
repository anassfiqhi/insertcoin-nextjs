import { LibraryShelf } from "@/features/library/components/LibraryShelf";
import { SystemCard } from "@/features/systems/components/SystemCard";
import type { SystemKind } from "@/features/systems/schemas";
import { getGamesBySystem, getSystems } from "@/lib/data";

const kindTitles: Record<SystemKind, string> = {
  arcade: "Arcade",
  console: "Home consoles",
  handheld: "Handhelds",
  computer: "Computers",
};

export default function HomePage() {
  const systems = getSystems();
  const kinds = (Object.keys(kindTitles) as SystemKind[]).filter((kind) =>
    systems.some((system) => system.kind === kind),
  );

  return (
    <div className="space-y-12">
      <section className="scanlines overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_20%_0%,oklch(0.45_0.2_320/0.6),transparent_55%),radial-gradient(circle_at_90%_100%,oklch(0.5_0.15_220/0.5),transparent_50%)] px-6 py-14 ring-1 ring-foreground/10 sm:px-10">
        <p className="font-pixel text-[0.65rem] text-primary">PLAYER 1</p>
        <h1 className="text-glow mt-4 font-pixel text-2xl leading-relaxed sm:text-4xl">
          INSERT COIN<span className="animate-blink text-primary">_</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Arcade, console and handheld classics in your browser. Pick a system,
          add the ROMs you own, and press start.
        </p>
      </section>

      <LibraryShelf source="recent" title="CONTINUE PLAYING" limit={5} />

      {kinds.map((kind) => (
        <section key={kind} className="space-y-4">
          <h2 className="font-pixel text-sm">
            {kindTitles[kind].toUpperCase()}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {systems
              .filter((system) => system.kind === kind)
              .map((system) => (
                <SystemCard
                  key={system.id}
                  system={system}
                  gameCount={getGamesBySystem(system.id).length}
                />
              ))}
          </div>
        </section>
      ))}

      <LibraryShelf source="favorites" title="FAVORITES" limit={5} />
    </div>
  );
}
