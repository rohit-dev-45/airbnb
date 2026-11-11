"use client";

import { useMemo, useState } from "react";
import { SafeImage } from "../safe-image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ListingImageGalleryProps = {
    images: string[];
    altBase: string;
};

export function ListingImageGallery({
    images,
    altBase,
}: ListingImageGalleryProps) {
    const uniqueImages = useMemo(
        () => Array.from(new Set(images.filter(Boolean))),
        [images],
    );
    const [activeIndex, setActiveIndex] = useState(0);
    if (uniqueImages.length === 0) return null;
    const activeImage =
        uniqueImages[Math.min(activeIndex, uniqueImages.length - 1)]!;
    const canNavigate = uniqueImages.length > 1;
    return (
        <section className="overflow-hidden rounded-3xl border border-ink-200 bg-surface shadow-sm">
            <div className="relative">
                <SafeImage
                    src={activeImage}
                    alt={`${altBase} image ${activeIndex + 1}`}
                    width={1600}
                    height={900}
                    className="h-65 w-full object-cover md:h-115"
                    priority
                />

                {canNavigate ? (
                    <>
                        <button
                            type="button"
                            aria-label="Previous image"
                            onClick={() =>
                                setActiveIndex(
                                    (prev) =>
                                        (prev - 1 + uniqueImages.length) %
                                        uniqueImages.length,
                                )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-black/40 p-2 text-white backdrop-blur hover:bg-black/55"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            aria-label="Next image"
                            onClick={() =>
                                setActiveIndex(
                                    (prev) => (prev + 1) % uniqueImages.length,
                                )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-black/40 p-2 text-white backdrop-blur hover:bg-black/55"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                ) : null}

                <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
                    {activeIndex + 1} / {uniqueImages.length}
                </div>
            </div>

            {canNavigate ? (
                <div className="hide-scrollbar flex gap-2 overflow-x-auto border-t border-ink-200 bg-surface-muted p-3">
                    {uniqueImages.map((image, index) => (
                        <button
                            key={`${image}-${index}`}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition ${
                                activeIndex === index
                                    ? "border-brand-400 ring-2 ring-brand-100"
                                    : "border-ink-200 hover:border-ink-300"
                            }`}
                            aria-label={`Show image ${index + 1}`}
                        >
                            <SafeImage
                                src={image}
                                alt={`${altBase} thumbnail ${index + 1}`}
                                width={240}
                                height={160}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
