import { Gamepad2, Heart } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4">
        <Link
          href="/"
          className="text-glow flex min-w-0 items-center gap-2 truncate font-pixel text-[0.6rem] text-primary sm:text-sm"
        >
          <Gamepad2 className="size-5 shrink-0" aria-hidden />
          INSERT<span className="animate-blink">·</span>COIN
        </Link>
        <nav className="flex shrink-0 items-center gap-1" aria-label="Main">
          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Systems
          </Link>
          <Link
            href="/favorites"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <Heart aria-hidden />
            <span className="sr-only sm:not-sr-only">Favorites</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
