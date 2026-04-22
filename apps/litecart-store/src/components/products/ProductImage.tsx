import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {/* Placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      )}

      {/* Actual Image */}
      {isInView && src && (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-opacity duration-300"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          loading="lazy"
        />
      )}

      {/* No image fallback */}
      {isInView && !src && (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-sm text-muted-foreground">No image</span>
        </div>
      )}
    </div>
  );
}
