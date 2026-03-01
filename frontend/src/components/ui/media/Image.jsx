import React, { useState } from 'react';
import NextImage from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Skeleton } from '@/components/ui/primitives/Skeleton';

const Image = ({ 
  src, 
  alt, 
  className, 
  aspectRatio = "aspect-video", 
  fill = false,
  width,
  height,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-background-muted text-content-muted rounded-md",
          fill ? "absolute inset-0 h-full w-full" : aspectRatio,
          className
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <ImageOff className="w-8 h-8 opacity-50" />
          <span className="text-xs font-medium">Failed to load</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-background-muted rounded-md",
        !fill && aspectRatio,
        className
      )}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10 w-full h-full" />
      )}
      
      <NextImage
        src={src}
        alt={alt || "Image"}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={cn(
          "transition-all duration-300 ease-in-out",
          isLoading ? "scale-105 blur-sm grayscale" : "scale-100 blur-0 grayscale-0",
          fill && "object-cover"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
    </div>
  );
};

export default Image;