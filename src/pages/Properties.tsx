import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { properties } from "@/data/properties";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Properties = () => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [bedroomFilter, setBedroomFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("price-asc");

  const locations = useMemo(() => [...new Set(properties.map((p) => p.location))], []);

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (bedroomFilter !== "all" && p.bedrooms !== parseInt(bedroomFilter)) return false;
      if (locationFilter && !p.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "area") return b.area - a.area;
      return 0;
    });

    return result;
  }, [typeFilter, bedroomFilter, locationFilter, sortBy]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Our Properties</h1>
            <p className="text-primary-foreground/70">
              Browse our collection of {properties.length} premium properties
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border bg-background sticky top-16 lg:top-20 z-40">
          <div className="container mx-auto px-4 lg:px-8 py-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Beds</SelectItem>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4 Bedrooms</SelectItem>
                  <SelectItem value="5">5+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="area">Largest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {filtered.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">{filtered.length} properties found</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No properties match your filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
