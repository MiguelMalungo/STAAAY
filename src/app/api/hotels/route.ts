import { NextRequest, NextResponse } from "next/server";
import { MOCK_HOTELS, searchHotels } from "@/lib/mockData";

// GET /api/hotels?city=Miami&petType=dog&serviceType=overnight_boarding
// Sprint 1 Task 1.2: Replace mock data with Supabase query once DB is set up
export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") || "";
  const petType = req.nextUrl.searchParams.get("petType") || "";
  const serviceType = req.nextUrl.searchParams.get("serviceType") || "";

  try {
    // TODO (Sprint 1.2): Replace with Supabase query:
    // const supabase = await createClient();
    // const { data } = await supabase.from("hotels").select("*").eq("status", "active");
    const hotels = searchHotels({ city, petType, serviceType });

    // Return brief hotel info (no full description for list view)
    const briefs = hotels.map(({ description: _desc, photos: _photos, ...brief }) => brief);
    return NextResponse.json({ hotels: briefs, total: briefs.length });
  } catch (e) {
    console.error("Hotels search error:", e);
    return NextResponse.json({ hotels: MOCK_HOTELS, total: MOCK_HOTELS.length });
  }
}
