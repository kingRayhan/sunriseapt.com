import Link from "next/link";
import { Bed, Bath, Maximize } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Property, formatPrice } from "@/data/properties";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground capitalize">
            {property.type}
          </Badge>
        </div>
        <CardContent className="p-5">
          <p className="text-xl font-bold text-primary mb-1">{formatPrice(property.price)}</p>
          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{property.location}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-3">
            <span className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" /> {property.bedrooms} Beds
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" /> {property.bathrooms} Baths
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4" /> {property.area} sqft
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
