"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";

import { createCatalogState } from "@/features/catalog/catalogSlice";
import type { Game } from "@/features/catalog/schemas";
import type { System } from "@/features/systems/schemas";

import { appStarted } from "./appActions";
import { makeStore } from "./store";

interface StoreProviderProps {
  systems: readonly System[];
  games: readonly Game[];
  children: ReactNode;
}

export function StoreProvider({
  systems,
  games,
  children,
}: StoreProviderProps) {
  // useState keeps one store per request on the server and one per page load in the browser.
  const [store] = useState(() =>
    makeStore({
      systems: { items: [...systems] },
      catalog: createCatalogState(games),
    }),
  );

  useEffect(() => {
    store.dispatch(appStarted());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
