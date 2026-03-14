"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125]; // Dhaka
const DEFAULT_ZOOM = 13;

function getGoogleMapsTileUrl(): string {
  const key =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
        process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ??
        ""
      : "";
  const keyParam = key ? `&key=${key}` : "";
  return `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${keyParam}`;
}

export interface SearchResult {
  location: string;
  address: string;
}

export interface LocationMapProps {
  lat: number | undefined;
  lng: number | undefined;
  onLocationChange: (lat: number, lng: number) => void;
  onSearchResult?: (result: SearchResult) => void;
  disabled?: boolean;
}

interface PlaceSearchSuggestion {
  placeId: string;
  place: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

interface PlaceDetailsResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  displayName?: string;
  addressComponents?: Array<{
    longText: string;
    shortText?: string;
    types: string[];
  }>;
}

function buildLocationString(
  ac: PlaceDetailsResult["addressComponents"],
  fallback: string,
): string {
  if (!ac?.length) return fallback;
  const get = (type: string) =>
    ac.find((c) => c.types?.includes(type))?.longText;
  const locality =
    get("locality") ?? get("sublocality") ?? get("administrative_area_level_2");
  const region = get("administrative_area_level_1") ?? get("country");
  const parts: string[] = [];
  if (locality) parts.push(locality);
  if (region && region !== locality) parts.push(region);
  return parts.length > 0 ? parts.join(", ") : fallback;
}

function MapClickHandler({
  onLocationChange,
  disabled,
}: {
  onLocationChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapPanTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [map, position]);
  return null;
}

function MapWithMarker({
  center,
  lat,
  lng,
  onLocationChange,
  disabled,
  panTo,
}: {
  center: [number, number];
  lat: number | undefined;
  lng: number | undefined;
  onLocationChange: (lat: number, lng: number) => void;
  disabled?: boolean;
  panTo?: [number, number] | null;
}) {
  useEffect(() => {
    const DefaultIcon = L.Icon.Default;
    if (DefaultIcon) {
      DefaultIcon.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }
  }, []);

  const markerPosition: [number, number] | null =
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)
      ? [lat, lng]
      : null;

  return (
    <div
      className="relative z-0 h-[320px] w-full rounded-md border overflow-hidden bg-muted"
      style={{ minHeight: 320 }}
    >
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution="© Google"
          url={getGoogleMapsTileUrl()}
          subdomains="0123"
          maxZoom={20}
        />
        <MapClickHandler
          onLocationChange={onLocationChange}
          disabled={disabled}
        />
        <MapPanTo position={panTo ?? null} />
        {markerPosition && <Marker position={markerPosition} />}
      </MapContainer>
    </div>
  );
}

export function LocationMap({
  lat,
  lng,
  onLocationChange,
  onSearchResult,
  disabled,
}: LocationMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [panTo, setPanTo] = useState<[number, number] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const center: [number, number] =
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)
      ? [lat, lng]
      : DEFAULT_CENTER;

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    setSearchError(null);
    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Search failed");
      setSuggestions(data.suggestions ?? []);
      setOpen(true);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Search failed");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectPlace = useCallback(
    async (suggestion: PlaceSearchSuggestion) => {
      setOpen(false);
      setSuggestions([]);
      setSearchQuery(suggestion.description);
      setDetailsLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `/api/places/details?placeId=${encodeURIComponent(suggestion.placeId)}`,
        );
        const data: PlaceDetailsResult = await res.json();
        if (!res.ok)
          throw new Error(
            (data as { error?: string }).error ?? "Details failed",
          );
        const locationStr = buildLocationString(
          data.addressComponents,
          data.formattedAddress,
        );
        onLocationChange(data.lat, data.lng);
        onSearchResult?.({
          location: locationStr,
          address: data.formattedAddress,
        });
        setPanTo([data.lat, data.lng]);
      } catch (e) {
        setSearchError(
          e instanceof Error ? e.message : "Failed to get place details",
        );
      } finally {
        setDetailsLoading(false);
      }
    },
    [onLocationChange, onSearchResult],
  );

  return (
    <div className="relative space-y-2">
      <div className="relative z-1000" ref={containerRef}>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              placeholder="Search address or place (Google)"
              className="pl-9"
              disabled={disabled}
              autoComplete="off"
              aria-label="Search for a location"
            />
            {(loading || detailsLoading) && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {detailsLoading ? "Loading…" : "Searching…"}
              </span>
            )}
            {open && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 z-1001 mt-1 max-h-[min(14rem,35vh)] overflow-y-auto overflow-x-hidden rounded-md border bg-background py-1 shadow-lg">
                {suggestions.map((s) => (
                  <li key={s.placeId}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                      onClick={() => selectPlace(s)}
                    >
                      <span className="font-medium">{s.mainText}</span>
                      {s.secondaryText && (
                        <span className="ml-1 text-muted-foreground">
                          {s.secondaryText}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {searchError && <p className="text-sm text-destructive">{searchError}</p>}
      <p className="text-xs text-muted-foreground">
        Choose a result from the dropdown, or click on the map to set the pin.
      </p>
      <MapWithMarker
        center={center}
        lat={lat}
        lng={lng}
        onLocationChange={onLocationChange}
        disabled={disabled}
        panTo={panTo}
      />
    </div>
  );
}
