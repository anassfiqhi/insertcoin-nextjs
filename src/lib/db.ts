import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { z } from "zod";

export const SaveRecordSchema = z.object({
  id: z.string().min(1),
  gameSlug: z.string().min(1),
  createdAt: z.number().int().positive(),
  state: z.custom<Uint8Array>(
    (value) => value instanceof Uint8Array,
    "State must be a Uint8Array",
  ),
  /** PNG/WebP data URL of the frame at save time. */
  screenshot: z.string().startsWith("data:image/").optional(),
});
export type SaveRecord = z.infer<typeof SaveRecordSchema>;

export type LibraryKey = "favorites" | "recent";

interface InsertCoinDB extends DBSchema {
  library: { key: LibraryKey; value: string[] };
  saves: { key: string; value: SaveRecord; indexes: { byGame: string } };
}

let dbPromise: Promise<IDBPDatabase<InsertCoinDB>> | undefined;

function db() {
  dbPromise ??= openDB<InsertCoinDB>("insertcoin", 1, {
    upgrade(database) {
      database.createObjectStore("library");
      database
        .createObjectStore("saves", { keyPath: "id" })
        .createIndex("byGame", "gameSlug");
    },
  });
  return dbPromise;
}

const StringListSchema = z.array(z.string());

export async function readList(key: LibraryKey): Promise<string[]> {
  const value = await (await db()).get("library", key);
  const parsed = StringListSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export async function writeList(
  key: LibraryKey,
  value: readonly string[],
): Promise<void> {
  await (await db()).put("library", [...value], key);
}

export async function listSaves(gameSlug: string): Promise<SaveRecord[]> {
  const records = await (
    await db()
  ).getAllFromIndex("saves", "byGame", gameSlug);
  return records
    .flatMap((record) => {
      const parsed = SaveRecordSchema.safeParse(record);
      return parsed.success ? [parsed.data] : [];
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSave(id: string): Promise<SaveRecord | undefined> {
  const parsed = SaveRecordSchema.safeParse(
    await (await db()).get("saves", id),
  );
  return parsed.success ? parsed.data : undefined;
}

export async function putSave(record: SaveRecord): Promise<void> {
  await (await db()).put("saves", SaveRecordSchema.parse(record));
}

export async function deleteSave(id: string): Promise<void> {
  await (await db()).delete("saves", id);
}
