"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_ZOOM = 15;

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

export interface LocationMapProps {
  /** Single point to show on the map (lat, lng). */
  points: { lat: number; lng: number };
  /** Optional label for the marker popup. */
  location?: string | null;
  className?: string;
}

export function LocationMap({
  points,
  location,
  className = "",
}: LocationMapProps) {
  const position: [number, number] = [points.lat, points.lng];

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

  return (
    <div
      className={`relative z-0 w-full rounded-lg border border-border overflow-hidden bg-muted ${className}`}
      style={{ height: 250 }}
    >
      <MapContainer
        center={position}
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
        <Marker position={position}>
          {location && <Popup>{location}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
}
