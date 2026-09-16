import { Gamepad2, Heart } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="text-glow flex items-center gap-2 font-pixel text-xs text-primary sm:text-sm"
        >
          <Gamepad2 className="size-5" aria-hidden />
          INSERT<span className="animate-blink">·</span>COIN
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
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
            Favorites
          </Link>
        </nav>
      </div>
    </header>
  );
}
