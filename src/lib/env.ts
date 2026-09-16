import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_EJS_DATA_PATH: z
    .url()
    .refine((value) => value.endsWith("/"), "Must end with a slash")
    .default("https://cdn.emulatorjs.org/stable/data/"),
  NEXT_PUBLIC_ROM_BASE_URL: z.string().min(1).default("/roms"),
  NEXT_PUBLIC_BIOS_BASE_URL: z.string().min(1).default("/bios"),
  NEXT_PUBLIC_EJS_THREADS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

export type Env = z.infer<typeof EnvSchema>;

// Each variable is referenced by its full name so Next.js can inline it into the client bundle.
// Empty strings count as "not set".
export const env: Env = EnvSchema.parse({
  NEXT_PUBLIC_EJS_DATA_PATH: process.env.NEXT_PUBLIC_EJS_DATA_PATH || undefined,
  NEXT_PUBLIC_ROM_BASE_URL: process.env.NEXT_PUBLIC_ROM_BASE_URL || undefined,
  NEXT_PUBLIC_BIOS_BASE_URL: process.env.NEXT_PUBLIC_BIOS_BASE_URL || undefined,
  NEXT_PUBLIC_EJS_THREADS: process.env.NEXT_PUBLIC_EJS_THREADS || undefined,
});
