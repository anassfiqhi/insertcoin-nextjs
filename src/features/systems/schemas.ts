import { z } from "zod";

export const SystemKindSchema = z.enum([
  "arcade",
  "console",
  "handheld",
  "computer",
]);
export type SystemKind = z.infer<typeof SystemKindSchema>;

/**
 * Values accepted by `EJS_core`. These are EmulatorJS system keys, which it
 * maps to a libretro core (for example `arcade` → fbneo, `mame` → mame2003_plus).
 */
export const EjsCoreSchema = z.enum([
  "arcade",
  "mame",
  "nes",
  "snes",
  "n64",
  "gb",
  "gba",
  "nds",
  "vb",
  "segaMD",
  "segaMS",
  "segaGG",
  "segaCD",
  "sega32x",
  "segaSaturn",
  "psx",
  "psp",
  "pce",
  "pcfx",
  "ngp",
  "ws",
  "lynx",
  "jaguar",
  "atari2600",
  "atari5200",
  "atari7800",
  "coleco",
  "3do",
  "amiga",
  "c64",
  "dos",
]);
export type EjsCore = z.infer<typeof EjsCoreSchema>;

export const SystemSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, "System id must be lowercase kebab-case"),
  name: z.string().min(1),
  shortName: z.string().min(1),
  /** Up to 4 characters, shown on the system tile. */
  badge: z.string().min(1).max(4),
  manufacturer: z.string().min(1),
  year: z.number().int().min(1970).max(2030),
  kind: SystemKindSchema,
  core: EjsCoreSchema,
  extensions: z.array(z.string().regex(/^\.[a-z0-9]+$/)).min(1),
  bios: z
    .object({
      file: z.string().min(1),
      required: z.boolean(),
      hint: z.string().optional(),
    })
    .optional(),
  controls: z.string().min(1),
  accent: z.string().regex(/^#[0-9a-f]{6}$/i),
});
export type System = z.infer<typeof SystemSchema>;

export const SystemsSchema = z
  .array(SystemSchema)
  .superRefine((systems, ctx) => {
    const seen = new Set<string>();
    systems.forEach((system, index) => {
      if (seen.has(system.id)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "id"],
          message: `Duplicate system id "${system.id}"`,
        });
      }
      seen.add(system.id);
    });
  });
