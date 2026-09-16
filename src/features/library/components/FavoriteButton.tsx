"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { cn } from "@/lib/utils";

import {
  favoriteToggled,
  selectIsFavorite,
  selectLibraryLoaded,
} from "../librarySlice";

interface FavoriteButtonProps {
  slug: string;
  title: string;
  variant?: "icon" | "full";
  className?: string;
}

export function FavoriteButton({
  slug,
  title,
  variant = "icon",
  className,
}: FavoriteButtonProps) {
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, slug));
  const loaded = useAppSelector(selectLibraryLoaded);
  const label = isFavorite
    ? `Remove ${title} from favorites`
    : `Add ${title} to favorites`;

  return (
    <Button
      type="button"
      variant={variant === "icon" ? "secondary" : "outline"}
      size={variant === "icon" ? "icon-sm" : "lg"}
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
      disabled={!loaded}
      className={className}
      onClick={(event) => {
        // The button sits on top of a card link.
        event.preventDefault();
        event.stopPropagation();
        dispatch(favoriteToggled(slug));
      }}
    >
      <Heart
        className={cn(isFavorite && "fill-rose-500 text-rose-500")}
        aria-hidden
      />
      {variant === "full" && (isFavorite ? "Favorited" : "Add to favorites")}
    </Button>
  );
}
