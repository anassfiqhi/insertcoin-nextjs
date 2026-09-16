import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid place-items-center gap-6 py-24 text-center">
      <p className="text-glow font-pixel text-4xl text-primary">404</p>
      <p className="font-pixel text-xs">GAME OVER — PAGE NOT FOUND</p>
      <Link href="/" className={buttonVariants()}>
        Continue?
      </Link>
    </div>
  );
}
