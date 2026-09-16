import type { Metadata } from "next";

import { LibraryShelf } from "@/features/library/components/LibraryShelf";

export const metadata: Metadata = { title: "Favorites" };

export default function FavoritesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Favorites</h1>
      <LibraryShelf
        source="favorites"
        title="YOUR GAMES"
        emptyMessage="No favorites yet. Tap the heart on any game to keep it here."
      />
    </div>
  );
}
