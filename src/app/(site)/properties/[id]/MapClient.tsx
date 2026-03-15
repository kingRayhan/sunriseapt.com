"use client";

import dynamic from "next/dynamic";

const LocationMap = dynamic(
  () =>
    import("@/components/LocationMap").then((m) => ({ default: m.default })),
  { ssr: false },
);

export default function MapClient({
  pins,
}: {
  pins: { lat: number; lng: number }[];
}) {
  return <LocationMap pins={pins} height={280} />;
}
