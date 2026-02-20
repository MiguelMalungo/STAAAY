import { NextRequest, NextResponse } from "next/server";

// Same as the reference app — proxies Google Places API
// Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q || q.length < 2) return NextResponse.json({ data: [] });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // Return mock city results when API key is not configured
    const mockCities = [
      { placeId: "miami-fl", displayName: "Miami", formattedAddress: "Miami, FL, USA" },
      { placeId: "new-york-ny", displayName: "New York", formattedAddress: "New York, NY, USA" },
      { placeId: "los-angeles-ca", displayName: "Los Angeles", formattedAddress: "Los Angeles, CA, USA" },
      { placeId: "chicago-il", displayName: "Chicago", formattedAddress: "Chicago, IL, USA" },
      { placeId: "austin-tx", displayName: "Austin", formattedAddress: "Austin, TX, USA" },
      { placeId: "denver-co", displayName: "Denver", formattedAddress: "Denver, CO, USA" },
    ].filter((c) => c.displayName.toLowerCase().includes(q.toLowerCase()));
    return NextResponse.json({ data: mockCities });
  }

  try {
    const url = `https://places.googleapis.com/v1/places:autocomplete`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: q,
        includedPrimaryTypes: ["locality", "administrative_area_level_1"],
        languageCode: "en",
      }),
    });
    const data = await res.json();
    const places = (data.suggestions || []).map((s: { placePrediction?: { placeId?: string; structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } } } }) => ({
      placeId: s.placePrediction?.placeId || "",
      displayName: s.placePrediction?.structuredFormat?.mainText?.text || "",
      formattedAddress: s.placePrediction?.structuredFormat?.secondaryText?.text || "",
    }));
    return NextResponse.json({ data: places });
  } catch (e) {
    console.error("Places API error:", e);
    return NextResponse.json({ data: [] });
  }
}
