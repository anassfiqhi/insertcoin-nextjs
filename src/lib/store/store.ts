import { combineSlices, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import { catalogSlice } from "@/features/catalog/catalogSlice";
import { emulatorSlice } from "@/features/emulator/emulatorSlice";
import { librarySlice } from "@/features/library/librarySlice";
import { savesSlice } from "@/features/saves/savesSlice";
import { systemsSlice } from "@/features/systems/systemsSlice";

import { rootSaga } from "./rootSaga";

export const rootReducer = combineSlices(
  systemsSlice,
  catalogSlice,
  librarySlice,
  emulatorSlice,
  savesSlice,
);

export type RootState = ReturnType<typeof rootReducer>;

/** Creates a new store. Called once per request on the server and once in the browser. */
export function makeStore(preloadedState?: Partial<RootState>) {
  const sagaMiddleware = createSagaMiddleware({
    onError: (error) => console.error("Unhandled saga error", error),
  });

  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
