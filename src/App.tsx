/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { initPresentationScene, Presentation3DScene } from './components/ThreeDisplayEngine';
import { PresentationSlideRenderer } from './components/PresentationSlideRenderer';
import { NavigationArrows } from './components/NavigationArrows';
import { TOTAL_SLIDES } from './constants';
import { VoiceController } from './components/VoiceController';
import { PresentationState, SegmentId, FourteenSegmentId } from './types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<Presentation3DScene | null>(null);

  // Centralized Presentation State
  const [state, setState] = useState<PresentationState>({
    currentSlide: 1,
    circuitMode: 'CC',
    selectedDigit: 8,
    selectedSegment: null,
    selectedApp: 'clock',
    evaluationTab: 'advantages',
    truthTableMode: 'CC',
    fourteenChar: 'A',
    sixteenChar: 'A',
    fourteenCircuitMode: 'CA',
    sixteenCircuitMode: 'CA',
    fourteenSelectedSegment: null,
    sixteenSelectedSegment: null,
    fourteenApp: 'clocks',
    sixteenApp: 'clocks',
    fourteenEvaluationTab: 'advantages',
    sixteenEvaluationTab: 'advantages',
    dotMatrixPattern: 'A',
  });

  const [isReady, setIsReady] = useState(false);

  // Initialize Three.js scene once on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = initPresentationScene(canvasRef.current);
    sceneRef.current = scene;
    scene.updateState(state);
    setIsReady(true);

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Sync state changes with Three.js scene
  const handleUpdateState = useCallback((updates: Partial<PresentationState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      if (sceneRef.current) {
        sceneRef.current.updateState(next);
      }
      return next;
    });
  }, []);

  // Slide navigation
  const goToSlide = useCallback((targetSlide: number) => {
    const valid = Math.max(1, Math.min(targetSlide, TOTAL_SLIDES));
    handleUpdateState({
      currentSlide: valid,
      selectedSegment: null,
      fourteenSelectedSegment: null,
      sixteenSelectedSegment: null,
      selectedDigit: valid === 5 ? 0 : valid === 6 ? 0 : valid === 7 ? 7 : 8,
      fourteenChar: valid === 16 ? '0' : 'A',
      sixteenChar: valid === 16 ? '0' : 'A',
      dotMatrixPattern: 'A',
    });
  }, [handleUpdateState]);

  const handleNext = useCallback(() => {
    if (state.currentSlide < TOTAL_SLIDES) {
      goToSlide(state.currentSlide + 1);
    }
  }, [state.currentSlide, goToSlide]);

  const handlePrev = useCallback(() => {
    if (state.currentSlide > 1) {
      goToSlide(state.currentSlide - 1);
    }
  }, [state.currentSlide, goToSlide]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Mobile Touch Swipe Navigation
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleHighlightSegment = useCallback((segId: SegmentId | null) => {
    if (sceneRef.current) {
      sceneRef.current.highlightSegmentIn3D(segId);
    }
  }, []);

  const handleHighlightFourteenSegment = useCallback((segId: FourteenSegmentId | null) => {
    if (sceneRef.current && sceneRef.current.highlightFourteenSegmentIn3D) {
      sceneRef.current.highlightFourteenSegmentIn3D(segId);
    }
  }, []);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#02050c] select-none flex flex-col md:flex-row"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* =========================================================================
          LEFT COLUMN: Dedicated Presentation Dock (Zero Overlap with Display!)
      ========================================================================= */}
      <div className="w-full md:w-[460px] lg:w-[500px] xl:w-[540px] shrink-0 h-[48vh] md:h-full z-20 overflow-y-auto bg-[#070d1a] border-t md:border-t-0 md:border-r border-cyan-500/25 order-2 md:order-1 p-5 sm:p-7 flex flex-col justify-between shadow-[10px_0_35px_rgba(0,0,0,0.85)]">
        {isReady ? (
          <PresentationSlideRenderer
            state={state}
            onUpdateState={handleUpdateState}
            onHighlightSegment={handleHighlightSegment}
            onHighlightFourteenSegment={handleHighlightFourteenSegment}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mb-3" />
            <div className="font-orbitron text-xs tracking-widest text-slate-300 uppercase">
              INITIALIZING DISPLAY MODULE...
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          RIGHT COLUMN: Dedicated 100% Unobstructed WebGL Canvas Viewport
      ========================================================================= */}
      <div className="flex-1 h-[52vh] md:h-full relative order-1 md:order-2 overflow-hidden bg-[#02050c]">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
        />

        {/* Viewport Top Bar Controls & Status Indicator Badge (Top-Right) */}
        <div className="absolute top-4 right-4 z-30 flex items-center space-x-2 shadow-xl">
          <VoiceController
            state={state}
            onUpdateState={handleUpdateState}
            onNext={handleNext}
            onPrev={handlePrev}
            goToSlide={goToSlide}
            onHighlightSegment={handleHighlightSegment}
            onHighlightFourteenSegment={handleHighlightFourteenSegment}
          />
        </div>

        {/* Slide Counter Indicator (Top-Left of Viewport) */}
        <div className="absolute top-4 left-4 pointer-events-none px-3 py-1.5 rounded-md bg-slate-900/85 border border-slate-700/60 text-xs font-mono-tech text-slate-300 shadow-lg">
          SLIDE <strong className="text-cyan-400">{state.currentSlide}</strong> / {TOTAL_SLIDES}
        </div>
      </div>

      {/* =========================================================================
          NAVIGATION CONTROLS: Left Arrow and Right Arrow at screen edges
      ========================================================================= */}
      <NavigationArrows
        currentSlide={state.currentSlide}
        totalSlides={TOTAL_SLIDES}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
