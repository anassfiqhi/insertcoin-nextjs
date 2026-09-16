import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlayView } from "@/features/emulator/components/PlayView";
import { getGame, getGames, getSystem } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGames().map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/play/[slug]">): Promise<Metadata> {
  const game = getGame((await params).slug);
  return game
    ? { title: `Playing ${game.title}`, robots: { index: false } }
    : {};
}

export default async function PlayPage({ params }: PageProps<"/play/[slug]">) {
  const game = getGame((await params).slug);
  const system = game && getSystem(game.system);
  if (!game || !system) notFound();

  return <PlayView game={game} system={system} />;
}
