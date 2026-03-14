import { NextResponse } from "next/server";

function getApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ??
    ""
  );
}

const FIELDS =
  "location,formattedAddress,addressComponents,displayName";

export interface PlaceDetailsResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  displayName?: string;
  addressComponents?: Array<{ longText: string; shortText?: string; types: string[] }>;
}

export async function GET(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId") ?? searchParams.get("place_id");
  if (!placeId || typeof placeId !== "string" || !placeId.trim()) {
    return NextResponse.json(
      { error: "Missing 'placeId' query parameter" },
      { status: 400 },
    );
  }

  const id = placeId.trim().replace(/^places\//, "");
  const url = `https://places.googleapis.com/v1/places/${id}?fields=${encodeURIComponent(FIELDS)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELDS,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Places details error:", res.status, errText);
      return NextResponse.json(
        { error: "Place details request failed" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      location?: { latitude?: number; longitude?: number };
      formattedAddress?: string;
      displayName?: string;
      addressComponents?: Array<{
        longText?: string;
        shortText?: string;
        types?: string[];
      }>;
    };

    const lat = data.location?.latitude;
    const lng = data.location?.longitude;
    if (lat == null || lng == null) {
      return NextResponse.json(
        { error: "Place has no location" },
        { status: 404 },
      );
    }

    const result: PlaceDetailsResult = {
      lat: Number(lat),
      lng: Number(lng),
      formattedAddress: data.formattedAddress ?? "",
      displayName: data.displayName,
      addressComponents: data.addressComponents?.map((c) => ({
        longText: c.longText ?? c.shortText ?? "",
        shortText: c.shortText,
        types: c.types ?? [],
      })),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Places details error:", err);
    return NextResponse.json(
      { error: "Place details failed" },
      { status: 500 },
    );
  }
}
