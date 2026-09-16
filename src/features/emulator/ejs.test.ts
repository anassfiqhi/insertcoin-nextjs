import { afterEach, describe, expect, it } from "vitest";

import { patchEjsExternalFileWrites } from "./ejs";

describe("patchEjsExternalFileWrites", () => {
  afterEach(() => {
    delete window.EJS_GameManager;
  });

  const installFakeGameManager = () => {
    const writes: unknown[] = [];
    class FakeGameManager {
      writeFile(_path: string, data: unknown) {
        writes.push(data);
      }
    }
    window.EJS_GameManager = FakeGameManager;
    return { writes, instance: new FakeGameManager() };
  };

  it("wraps ArrayBuffers in a Uint8Array so Emscripten writes the bytes", () => {
    const { writes, instance } = installFakeGameManager();
    patchEjsExternalFileWrites();

    instance.writeFile("/kof2002.zip", new Uint8Array([1, 2, 3]).buffer);

    expect(writes[0]).toBeInstanceOf(Uint8Array);
    expect(Array.from(writes[0] as Uint8Array)).toEqual([1, 2, 3]);
  });

  it("passes typed arrays and strings through unchanged", () => {
    const { writes, instance } = installFakeGameManager();
    patchEjsExternalFileWrites();
    const bytes = new Uint8Array([4]);

    instance.writeFile("/a", bytes);
    instance.writeFile("/b", "text");

    expect(writes).toEqual([bytes, "text"]);
  });

  it("patches only once", () => {
    const { writes, instance } = installFakeGameManager();
    patchEjsExternalFileWrites();
    patchEjsExternalFileWrites();

    instance.writeFile("/a", new ArrayBuffer(2));

    expect(writes).toHaveLength(1);
  });

  it("does nothing before EmulatorJS has loaded", () => {
    expect(() => patchEjsExternalFileWrites()).not.toThrow();
  });
});
