import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LegacyPlayer } from "@/features/emulator/components/LegacyPlayer";
import { getGame, getGames, getSystem } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGames().map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/legacy/[slug]">): Promise<Metadata> {
  const game = getGame((await params).slug);
  return game
    ? { title: `${game.title} (legacy netplay)`, robots: { index: false } }
    : {};
}

/**
 * Experiment: the same game on the legacy EmulatorJS build, which is the only
 * one whose netplay syncs inputs. Kept apart from /play so the main path keeps
 * using 4.2.3.
 */
export default async function LegacyPlayPage({
  params,
}: PageProps<"/legacy/[slug]">) {
  const game = getGame((await params).slug);
  const system = game && getSystem(game.system);
  if (!game || !system) notFound();

  return (
    <div className="space-y-4">
      <Link
        href={`/play/${game.slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Back to the normal player
      </Link>
      <div>
        <h1 className="text-xl font-semibold">{game.title}</h1>
        <p className="text-sm text-muted-foreground">
          {system.name} · legacy EmulatorJS build, for netplay
        </p>
      </div>
      <LegacyPlayer game={game} system={system} />
    </div>
  );
}
