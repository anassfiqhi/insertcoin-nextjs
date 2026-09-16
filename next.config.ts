import type { NextConfig } from "next";

// Only PSP (ppsspp) and DOS (dosbox_pure) cores need threads. Threads need
// SharedArrayBuffer, which needs cross-origin isolation, so the headers are
// opt-in and scoped to the play route.
const enableThreads = process.env.NEXT_PUBLIC_EJS_THREADS === "true";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  async headers() {
    if (!enableThreads) return [];
    return [
      {
        source: "/play/:slug",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
