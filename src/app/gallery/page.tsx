import type { Metadata } from "next";
import { HoverGallery } from "@/components/hover-gallery";
import { PageHeader } from "@/components/page-header";
import { photos } from "@/lib/data";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <main className="w-full">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow={`${photos.length} pictures`} title="Gallery" />
      </div>
      <HoverGallery photos={photos} />
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-3 px-5 sm:grid-cols-3 sm:px-8">
        {photos.map((p, i) => (
          <figure key={p.name} className={i % 5 === 0 ? "row-span-2" : ""}>
            <img src={p.image} alt={p.name} className="size-full rounded-xl object-cover ring-1 ring-fg/10" />
          </figure>
        ))}
      </div>
    </main>
  );
}
