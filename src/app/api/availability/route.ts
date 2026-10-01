import { NextResponse } from "next/server";
import { getOccupancy } from "@/lib/content/store";

/** Public occupancy — dates only, no private titles. */
export async function GET() {
  const occupancy = await getOccupancy();
  return NextResponse.json(
    { occupancy },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
