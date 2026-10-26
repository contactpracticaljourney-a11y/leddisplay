import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationArrowsProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
}) => {
  const canGoPrev = currentSlide > 1;
  const canGoNext = currentSlide < totalSlides;

  return (
    <>
      {/* Left Navigation Arrow (Vertically centered on left edge) */}
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Previous Slide"
        className={`fixed left-2 sm:left-5 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center outline-none active:scale-90 ${
          canGoPrev
            ? 'opacity-60 hover:opacity-100 hover:scale-110 bg-[#060b17]/80 hover:bg-[#0c162c]/95 border-slate-700/70 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 shadow-2xl hover:shadow-[0_0_22px_rgba(56,189,248,0.45)]'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Right Navigation Arrow (Vertically centered on right edge) */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next Slide"
        className={`fixed right-2 sm:right-5 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center outline-none active:scale-90 ${
          canGoNext
            ? 'opacity-60 hover:opacity-100 hover:scale-110 bg-[#060b17]/80 hover:bg-[#0c162c]/95 border-slate-700/70 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 shadow-2xl hover:shadow-[0_0_22px_rgba(56,189,248,0.45)]'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>
    </>
  );
};
