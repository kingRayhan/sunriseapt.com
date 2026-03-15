"use client";

import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

const DEFAULT_CENTER: [number, number] = [
  23.876081553480855, 90.38725243439256,
];

function MapCenterToPins({ pins }: { pins: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins?.length > 0) {
      const [pin] = pins;
      map.setView([pin.lat, pin.lng], map.getZoom());
    }
  }, [map, pins]);
  return null;
}

export interface LocationMapProps {
  pins?: {
    lat: number;
    lng: number;
  }[];
  onPinDragEnd?: (pin: { lat: number; lng: number }, index: number) => void;
  height?: number;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  pins,
  className,
  height = 400,
  onPinDragEnd,
}) => {
  const center =
    pins?.length > 0
      ? ([pins[0].lat, pins[0].lng] as [number, number])
      : DEFAULT_CENTER;

  return (
    <div
      className={cn("w-full rounded-md relative overflow-hidden", className)}
      style={{ minHeight: height }}
    >
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        style={{ height: "100%", minHeight: height }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; Google Maps"
          url="https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"
        />
        {pins?.length > 0 && <MapCenterToPins pins={pins} />}
        {pins?.length > 0 &&
          pins?.map((pin, index) => (
            <Marker
              key={`${pin.lat}-${pin.lng}-${index}`}
              position={[pin.lat, pin.lng]}
              draggable={onPinDragEnd ? true : false}
              eventHandlers={
                onPinDragEnd
                  ? {
                      dragend: (e) => {
                        const marker = e.target;
                        const { lat, lng } = marker.getLatLng();
                        onPinDragEnd({ lat, lng }, index);
                      },
                    }
                  : undefined
              }
              icon={L.icon({
                iconUrl: "https://cdn.sunriseapt.com/assets/push-pin.png",
                iconSize: [40, 40],
                iconAnchor: [12, 12],
                popupAnchor: [0, -10],
              })}
            />
          ))}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
