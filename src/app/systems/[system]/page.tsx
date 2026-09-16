import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogView } from "@/features/catalog/components/CatalogView";
import { collectGenres, filterGames } from "@/features/catalog/filterGames";
import { defaultQuery } from "@/features/catalog/catalogSlice";
import { getGamesBySystem, getSystem, getSystems } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSystems().map((system) => ({ system: system.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/systems/[system]">): Promise<Metadata> {
  const system = getSystem((await params).system);
  return system
    ? {
        title: system.name,
        description: `Play ${system.name} games in your browser.`,
      }
    : {};
}

export default async function SystemPage({
  params,
}: PageProps<"/systems/[system]">) {
  const system = getSystem((await params).system);
  if (!system) notFound();

  const games = getGamesBySystem(system.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All systems
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span
            className="size-3 rounded-full"
            style={{ background: system.accent }}
            aria-hidden
          />
          <h1 className="text-3xl font-semibold">{system.name}</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          {system.manufacturer} · {system.year}
          {system.bios?.required && " · needs a BIOS file"}
        </p>
      </div>
      <CatalogView
        system={system}
        initialGames={filterGames(games, {
          ...defaultQuery,
          system: system.id,
        })}
        genres={collectGenres(games)}
      />
    </div>
  );
}
