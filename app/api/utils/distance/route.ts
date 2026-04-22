import { NextRequest, NextResponse } from "next/server";

// Solarponics shop — hardcoded to avoid an extra geocode round-trip every request
const SHOP_LAT = 35.4876;
const SHOP_LON = -120.6796; // 4700 El Camino Real, Atascadero, CA 93422

const ROAD_FACTOR = 1.3; // straight-line → driving distance multiplier for CA

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Haversine great-circle distance in miles */
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=us`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Solarponics-RR-BidTool/1.0 (info@solarponics.com)",
      Accept: "application/json",
    },
    // Nominatim asks for a 1-second gap between requests — acceptable for per-user calls
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data: Array<{ lat: string; lon: string }> = await res.json();
  if (!data[0]) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")?.trim();
  if (!address) {
    return NextResponse.json({ error: "address param required" }, { status: 400 });
  }

  try {
    const job = await geocode(address);
    if (!job) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const straight = haversineMiles(SHOP_LAT, SHOP_LON, job.lat, job.lon);
    const miles = Math.round(straight * ROAD_FACTOR);

    return NextResponse.json({ miles });
  } catch {
    return NextResponse.json({ error: "Distance calculation failed" }, { status: 500 });
  }
}
