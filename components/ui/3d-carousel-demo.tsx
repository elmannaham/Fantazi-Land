"use client";

import { ThreeDPhotoCarousel } from "./3d-carousel";

const demoImages = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1495887496540-8d3b26eba8f5?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1511527260815-7a02b99a3b10?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
];

export function ThreeDPhotoCarouselDemo() {
  return (
    <div className="w-full">
      <div className="min-h-[600px] flex flex-col justify-center space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            3D Photo Carousel
          </h2>
          <p className="text-slate-600">
            Glissez pour faire tourner • Cliquez pour agrandir
          </p>
        </div>
        <ThreeDPhotoCarousel
          cards={demoImages}
          onImageClick={(imgUrl, index) => {
            console.log(`Image ${index} clicked:`, imgUrl);
          }}
        />
      </div>
    </div>
  );
}
