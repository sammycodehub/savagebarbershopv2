"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

const GALLERY_COUNT = 20;

const galleryImages = Array.from({ length: GALLERY_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    src: `/images/gallery/gallery-${n}.jpg`,
    alt: `Past work at Savage Lifestyle Barber Shop, photo ${i + 1}`,
  };
});

export function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : galleryImages[activeIndex];

  return (
    <section id="gallery" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="mb-2 text-[32px] font-semibold leading-tight text-neon-silver">
        Gallery
      </h2>
      <p className="mb-10 max-w-lg text-muted-gray">
        A look at recent cuts and shaves from the chair,tap any photo to
        view it full size.
      </p>

      <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {galleryImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border-slate bg-surface-charcoal text-left transition-all duration-300 hover:-translate-y-1 hover:border-savage-gold hover:shadow-[0_0_24px_-10px_rgba(212,175,55,0.55)]"
            aria-label={`Open ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 359px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void-black/80 via-transparent to-transparent"
              aria-hidden="true"
            />
            <span className="absolute bottom-3 left-3 rounded-full border border-savage-gold/40 bg-void-black/70 px-3 py-1 text-xs font-medium text-neon-silver backdrop-blur-sm">
              Cut {String(index + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      <Modal
        open={active !== null}
        onClose={() => setActiveIndex(null)}
        title="Gallery"
        size="lightbox"
      >
        {active && (
          <div className="relative mt-2 aspect-[4/5] w-full overflow-hidden rounded-lg sm:aspect-[3/4] md:aspect-[4/5]">
            <Image
              src={active.src}
              alt={active.alt}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-contain"
            />
          </div>
        )}
      </Modal>
    </section>
  );
}
