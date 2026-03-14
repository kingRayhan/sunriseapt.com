import { NextResponse } from "next/server";

const PLACES_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

function getApiKey(): string {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ??
    "";
  return key;
}

export interface PlaceSearchSuggestion {
  placeId: string;
  place: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export async function POST(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 },
    );
  }

  let body: { input?: string; sessionToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const input = typeof body?.input === "string" ? body.input.trim() : "";
  if (!input) {
    return NextResponse.json(
      { error: "Missing or empty 'input' in body" },
      { status: 400 },
    );
  }

  const sessionToken = typeof body?.sessionToken === "string" ? body.sessionToken : undefined;

  const requestBody: {
    input: string;
    sessionToken?: string;
    includedRegionCodes?: string[];
  } = {
    input,
    includedRegionCodes: ["bd"],
  };
  if (sessionToken) requestBody.sessionToken = sessionToken;

  try {
    const res = await fetch(PLACES_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Places autocomplete error:", res.status, errText);
      return NextResponse.json(
        { error: "Places autocomplete request failed" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId?: string;
          place?: string;
          text?: { text?: string };
          structuredFormat?: {
            mainText?: { text?: string };
            secondaryText?: { text?: string };
          };
        };
      }>;
    };

    const suggestions: PlaceSearchSuggestion[] = [];
    for (const s of data.suggestions ?? []) {
      const pred = s.placePrediction;
      if (!pred?.placeId) continue;
      const mainText = pred.structuredFormat?.mainText?.text ?? pred.text?.text ?? "";
      const secondaryText = pred.structuredFormat?.secondaryText?.text ?? "";
      const description = pred.text?.text ?? [mainText, secondaryText].filter(Boolean).join(", ");
      suggestions.push({
        placeId: pred.placeId,
        place: pred.place ?? pred.placeId,
        mainText,
        secondaryText,
        description,
      });
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("Places search error:", err);
    return NextResponse.json(
      { error: "Places search failed" },
      { status: 500 },
    );
  }
}
