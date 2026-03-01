import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/utils';
import Image from './Image';
import { IconButton } from '@/components/ui/primitives/IconButton';

const ImageGallery = ({ images = [], columns = 3, className }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Responsive column mapping
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <>
      {/* Grid View */}
      <div className={cn("grid gap-4", gridCols[columns], className)}>
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="relative overflow-hidden rounded-lg cursor-pointer group aspect-square"
            onClick={() => setSelectedImage(img)}
          >
            <Image 
              src={img.src} 
              alt={img.alt} 
              fill 
              className="transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 transition-colors bg-black/0 group-hover:bg-black/10" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setSelectedImage(null)}
          >
            <div className="absolute z-50 top-4 right-4">
               <IconButton 
                 icon={X} 
                 label="Close" 
                 onClick={() => setSelectedImage(null)} 
                 className="text-white border-none bg-black/50 hover:bg-black/70"
               />
            </div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative h-full w-full max-w-5xl max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={selectedImage.src} 
                alt={selectedImage.alt} 
                fill 
                className="object-contain" 
              />
              {selectedImage.caption && (
                <div className="absolute left-0 right-0 p-2 mx-auto text-sm text-center text-white rounded bottom-4 bg-black/50 max-w-fit">
                  {selectedImage.caption}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;