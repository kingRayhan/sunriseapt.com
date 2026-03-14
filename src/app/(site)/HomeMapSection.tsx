"use client";

import Link from "next/link";
import { LocationMap } from "@/components/LocationMap";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export type HomeMapLocation = {
  lat: number;
  lng: number;
  address: string | null;
};

export function HomeMapSection({
  mapLocation,
}: {
  mapLocation: HomeMapLocation | null;
}) {
  if (!mapLocation) {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Our Location
            </h2>
            <p className="text-muted-foreground">
              Set office location in Dashboard → Settings → Contact info
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Our Location
          </h2>
          <p className="text-muted-foreground">
            Find us on the map
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg border border-border">
          <LocationMap
            points={{ lat: mapLocation.lat, lng: mapLocation.lng }}
            location={mapLocation.address}
          />
          <div className="p-3 bg-muted/50 border-t flex flex-wrap items-center justify-center gap-2">
            {mapLocation.address && (
              <span className="text-sm text-muted-foreground">
                {mapLocation.address}
              </span>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Open in Google Maps
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
