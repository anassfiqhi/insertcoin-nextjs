import { Gamepad2, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GameCover } from "@/features/catalog/components/GameCover";
import { buildEjsConfig } from "@/features/emulator/buildEjsConfig";
import { FavoriteButton } from "@/features/library/components/FavoriteButton";
import { getGame, getGames, getSystem } from "@/lib/data";
import { env } from "@/lib/env";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGames().map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/games/[slug]">): Promise<Metadata> {
  const game = getGame((await params).slug);
  return game ? { title: game.title, description: game.description } : {};
}

export default async function GamePage({ params }: PageProps<"/games/[slug]">) {
  const game = getGame((await params).slug);
  const system = game && getSystem(game.system);
  if (!game || !system) notFound();

  const { files } = buildEjsConfig({ game, system, env, player: "" });

  return (
    <div className="space-y-6">
      <Link
        href={`/systems/${system.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← {system.name}
      </Link>

      <div className="grid gap-8 md:grid-cols-[minmax(0,22rem)_1fr]">
        <GameCover
          title={game.title}
          accent={system.accent}
          label={system.shortName}
          className="rounded-2xl ring-1 ring-foreground/10"
        />

        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-semibold">{game.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {game.publisher} · {game.year} · {system.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {game.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
            <Badge variant="outline">
              <Users aria-hidden /> {game.players}{" "}
              {game.players === 1 ? "player" : "players"}
            </Badge>
          </div>

          <p className="max-w-prose leading-relaxed">{game.description}</p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/play/${game.slug}`}
              className={buttonVariants({ size: "lg", className: "px-4" })}
            >
              <Gamepad2 aria-hidden /> Play now
            </Link>
            <FavoriteButton
              slug={game.slug}
              title={game.title}
              variant="full"
            />
          </div>

          <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <h2 className="font-pixel text-[0.65rem] text-muted-foreground">
              FILES NEEDED
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {files.map((file) => (
                <li key={file.url}>
                  <code className="break-all">{file.location}</code>
                  {!file.required && (
                    <span className="text-muted-foreground"> (optional)</span>
                  )}
                  {file.hint && (
                    <p className="text-xs text-muted-foreground">{file.hint}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
