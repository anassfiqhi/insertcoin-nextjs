import { createAction } from "@reduxjs/toolkit";

/** Dispatched once on the client after hydration. Sagas that touch browser APIs wait for it. */
export const appStarted = createAction("app/started");
