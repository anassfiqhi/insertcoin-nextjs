import { getSystems } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  return Response.json({ systems: getSystems() });
}
