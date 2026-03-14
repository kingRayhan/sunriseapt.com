import { getGalleryImages } from "@/drizzle/queries/gallery";
import { GalleryGrid } from "@/components/dashboard/gallery-grid";

export const revalidate = 60;

export default async function DashboardGalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
        <p className="text-muted-foreground">
          Images are loaded from S3 using signed URLs.
        </p>
      </div>
      <GalleryGrid images={images} />
    </div>
  );
}
