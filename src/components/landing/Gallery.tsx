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
        A look at recent cuts and shaves from the chair — tap any photo to
        view it full size.
      </p>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {galleryImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border-slate bg-surface-charcoal transition-all hover:-translate-y-px hover:border-savage-gold hover:shadow-[0_0_24px_-10px_rgba(212,175,55,0.55)]"
            aria-label={`Open ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 420px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
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
