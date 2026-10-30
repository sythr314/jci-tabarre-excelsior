import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { cn } from "@/lib/utils/cn";

interface SanityImageProps {
  source: object;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export function SanityImage({
  source,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
  fill = false,
  sizes,
}: SanityImageProps) {
  if (!source) return null;

  const imageUrl = urlFor(source as Parameters<typeof urlFor>[0])
    .width(width * 2)
    .height(height * 2)
    .format("webp")
    .url();

  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        priority={priority}
        sizes={sizes ?? "100vw"}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={cn(className)}
      priority={priority}
      sizes={sizes}
    />
  );
}
