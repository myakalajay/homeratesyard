import React, { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/utils/utils';
import Image from './Image';

const Video = ({ src, poster, className, ...props }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={cn("relative group overflow-hidden rounded-lg bg-black aspect-video", className)}>
      <video
        ref={videoRef}
        className="object-cover w-full h-full"
        src={src}
        controls={false} // Custom controls overlay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        {...props}
      />

      {/* Poster Overlay (Visible before play) */}
      {poster && !isPlaying && (
        <div className="absolute inset-0 pointer-events-none">
          <Image src={poster} alt="Video poster" fill className="opacity-80" />
        </div>
      )}

      {/* Play/Pause Overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-colors cursor-pointer bg-black/20 group-hover:bg-black/30"
        onClick={togglePlay}
      >
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg transition-transform duration-300",
          isPlaying ? "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100" : "scale-100 opacity-100"
        )}>
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 ml-1 fill-current" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Video;