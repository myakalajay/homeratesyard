import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/primitives/Button';

const Carousel = ({ slides, autoPlay = true, interval = 5000, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      nextSlide();
    }, interval);
    return () => clearInterval(timer);
  }, [currentIndex, autoPlay, interval]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-background-muted h-[400px] w-full", className)}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 flex items-center justify-center p-8"
        >
          {/* Render Slide Content */}
          <div className="max-w-2xl text-center">
            {slides[currentIndex].content}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute z-10 -translate-y-1/2 left-4 top-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm text-content"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute z-10 -translate-y-1/2 right-4 top-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm text-content"
        onClick={nextSlide}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots */}
      <div className="absolute z-10 flex gap-2 -translate-x-1/2 bottom-4 left-1/2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              idx === currentIndex ? "bg-primary w-6" : "bg-content-muted/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;