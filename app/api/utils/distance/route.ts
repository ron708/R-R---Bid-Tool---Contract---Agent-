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

/** US Census Geocoder — free, no API key, comprehensive US residential coverage */
async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  const url =
    `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress` +
    `?address=${encodeURIComponent(address)}&benchmark=2020&format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  const match = data?.result?.addressMatches?.[0];
  if (!match) return null;
  return { lat: match.coordinates.y, lon: match.coordinates.x };
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
