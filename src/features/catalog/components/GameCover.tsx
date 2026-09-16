import { cn } from "@/lib/utils";

interface GameCoverProps {
  title: string;
  accent: string;
  label: string;
  className?: string;
}

const initialsOf = (title: string) =>
  title
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase())
    .join("");

/** Generated cover art: no box art ships with the repo, so each game gets its system colour and initials. */
export function GameCover({ title, accent, label, className }: GameCoverProps) {
  return (
    <div
      className={cn(
        "scanlines flex aspect-[4/3] flex-col justify-between overflow-hidden p-3",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 30% 20%, ${accent}cc, transparent 60%), linear-gradient(135deg, ${accent}55, #0b0820 75%)`,
      }}
      aria-hidden
    >
      <span className="w-fit rounded-sm bg-black/50 px-1.5 py-0.5 font-pixel text-[0.55rem] text-white/90">
        {label}
      </span>
      <span className="font-pixel text-3xl text-white drop-shadow-[0_2px_0_rgb(0_0_0/0.6)]">
        {initialsOf(title)}
      </span>
    </div>
  );
}
