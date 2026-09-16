import { all, fork } from "redux-saga/effects";

import { catalogSaga } from "@/features/catalog/catalogSaga";
import { emulatorSaga } from "@/features/emulator/emulatorSaga";
import { librarySaga } from "@/features/library/librarySaga";
import { savesSaga } from "@/features/saves/savesSaga";

export function* rootSaga() {
  yield all([
    fork(catalogSaga),
    fork(librarySaga),
    fork(emulatorSaga),
    fork(savesSaga),
  ]);
}
