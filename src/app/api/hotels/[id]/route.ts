import { NextRequest, NextResponse } from "next/server";
import { getHotelById } from "@/lib/mockData";

// GET /api/hotels/[id]
// Sprint 1 Task 1.2: Replace mock data with Supabase query
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // TODO (Sprint 1.2): Replace with Supabase query:
  // const supabase = await createClient();
  // const { data } = await supabase.from("hotels").select("*, hotel_services(*)").eq("slug", id).single();
  const hotel = getHotelById(id);

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }

  return NextResponse.json({ hotel });
}
