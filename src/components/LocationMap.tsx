"use client";

import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";

export interface LocationMapProps {
  pins?: {
    lat: number;
    lng: number;
  }[];
  onPinClick?: (pin: { lat: number; lng: number }) => void;
  height?: number;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  pins,
  className,
  height = 400,
}) => {
  return (
    <div
      className={cn("w-full rounded-md overflow-hidden", className)}
      style={{ minHeight: height }}
    >
      <MapContainer
        center={[23.876081553480855, 90.38725243439256]}
        zoom={13}
        className="h-full w-full"
        style={{ height: "100%", minHeight: height }}
      >
        <TileLayer
          attribution="&copy; Google Maps"
          url="https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"
        />
      </MapContainer>
    </div>
  );
};

export default LocationMap;
