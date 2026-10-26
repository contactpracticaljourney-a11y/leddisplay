import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Sparkles, AlertCircle } from 'lucide-react';
import { PresentationState, SegmentId, FourteenSegmentId, SixteenSegmentId } from '../types';

interface VoiceControllerProps {
  state: PresentationState;
  onUpdateState: (updates: Partial<PresentationState>) => void;
  onNext: () => void;
  onPrev: () => void;
  goToSlide: (slideNum: number) => void;
  onHighlightSegment: (segId: SegmentId | null) => void;
  onHighlightFourteenSegment?: (segId: SixteenSegmentId | null) => void;
}

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  'twenty one': 21,
  'twenty-one': 21,
};

export const VoiceController: React.FC<VoiceControllerProps> = ({
  state,
  onUpdateState,
  onNext,
  onPrev,
  goToSlide,
  onHighlightSegment,
  onHighlightFourteenSegment,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  // Auto-hide feedback badge after 2.5 seconds
  useEffect(() => {
    if (!lastFeedback) return;
    const timer = setTimeout(() => {
      setLastFeedback(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [lastFeedback]);

  // Voice Command Execution Logic
  const executeVoiceCommand = useCallback(
    (speechText: string) => {
      const raw = speechText.trim();
      const text = raw.toLowerCase();
      if (!text) return;

      // 1. Navigation Commands
      if (
        text.includes('next slide') ||
        text.includes('go next') ||
        text.includes('next') ||
        text.includes('forward') ||
        text.includes('move forward')
      ) {
        onNext();
        setLastFeedback(`Action: Next Slide`);
        return;
      }

      if (
        text.includes('previous slide') ||
        text.includes('prev slide') ||
        text.includes('previous') ||
        text.includes('go back') ||
        text.includes('back') ||
        text.includes('last slide')
      ) {
        onPrev();
        setLastFeedback(`Action: Previous Slide`);
        return;
      }

      // Slide navigation "slide [X]"
      const slideMatch = text.match(/(?:go to slide|slide|page)\s+([a-z0-9\s-]+)/i);
      if (slideMatch) {
        const valStr = slideMatch[1].trim();
        let num = parseInt(valStr, 10);
        if (isNaN(num) && NUMBER_WORDS[valStr] !== undefined) {
          num = NUMBER_WORDS[valStr];
        }
        if (!isNaN(num) && num >= 1 && num <= 21) {
          goToSlide(num);
          setLastFeedback(`Action: Jumped to Slide ${num}`);
          return;
        }
      }

      // 2. Circuit Mode Commands
      if (text.includes('common anode') || text.includes('anode')) {
        onUpdateState({ circuitMode: 'CA', sixteenCircuitMode: 'CA', fourteenCircuitMode: 'CA' });
        setLastFeedback(`Action: Switched to Common Anode (CA)`);
        return;
      }
      if (text.includes('common cathode') || text.includes('cathode')) {
        onUpdateState({ circuitMode: 'CC', sixteenCircuitMode: 'CC', fourteenCircuitMode: 'CC' });
        setLastFeedback(`Action: Switched to Common Cathode (CC)`);
        return;
      }

      // 3. Evaluation Tabs
      if (text.includes('advantage') || text.includes('advantages')) {
        onUpdateState({
          evaluationTab: 'advantages',
          sixteenEvaluationTab: 'advantages',
          fourteenEvaluationTab: 'advantages',
        });
        setLastFeedback(`Action: Selected Advantages Tab`);
        return;
      }
      if (text.includes('limitation') || text.includes('limitations')) {
        onUpdateState({
          evaluationTab: 'limitations',
          sixteenEvaluationTab: 'limitations',
          fourteenEvaluationTab: 'limitations',
        });
        setLastFeedback(`Action: Selected Limitations Tab`);
        return;
      }

      // 4. Embedded Applications
      if (text.includes('clock') || text.includes('digital clock') || text.includes('clocks')) {
        onUpdateState({ selectedApp: 'clock', sixteenApp: 'clocks', fourteenApp: 'clocks' });
        setLastFeedback(`Action: Selected Digital Clock Application`);
        return;
      }
      if (text.includes('counter') || text.includes('event counter') || text.includes('counters')) {
        onUpdateState({ selectedApp: 'counter', sixteenApp: 'counters', fourteenApp: 'counters' });
        setLastFeedback(`Action: Selected Event Counter Application`);
        return;
      }
      if (text.includes('calculator') || text.includes('calculators')) {
        onUpdateState({ selectedApp: 'calculator', sixteenApp: 'calculators', fourteenApp: 'calculators' });
        setLastFeedback(`Action: Selected Calculator Application`);
        return;
      }
      if (text.includes('meter') || text.includes('digital meter')) {
        onUpdateState({ selectedApp: 'meter' });
        setLastFeedback(`Action: Selected Digital Meter Application`);
        return;
      }
      if (text.includes('instrument') || text.includes('instruments') || text.includes('laboratory')) {
        onUpdateState({ selectedApp: 'instruments', sixteenApp: 'instruments', fourteenApp: 'instruments' });
        setLastFeedback(`Action: Selected Instruments Application`);
        return;
      }
      if (text.includes('panel') || text.includes('control panel') || text.includes('panels')) {
        onUpdateState({ sixteenApp: 'panels', fourteenApp: 'panels' });
        setLastFeedback(`Action: Selected Control Panels Application`);
        return;
      }
      if (text.includes('free') || text.includes('indicator') || text.includes('indicators')) {
        onUpdateState({ sixteenApp: 'indicators', fourteenApp: 'indicators' });
        setLastFeedback(`Action: Selected FREE Indicator Application`);
        return;
      }

      // 5. Dot Matrix Patterns
      if (text.includes('heart')) {
        onUpdateState({ dotMatrixPattern: 'HEART' });
        setLastFeedback(`Action: Displayed Heart Pattern "♥"`);
        return;
      }
      if (text.includes('smile') || text.includes('smiley')) {
        onUpdateState({ dotMatrixPattern: 'SMILE' });
        setLastFeedback(`Action: Displayed Smile Emoji "☺"`);
        return;
      }

      // 6. Segment Highlight Commands
      const segMatch = text.match(/(?:segment|seg)\s+([a-m1-2]+)/i);
      if (segMatch) {
        const segStr = segMatch[1].toLowerCase() as SegmentId | SixteenSegmentId;
        if (state.currentSlide === 3) {
          onUpdateState({ selectedSegment: segStr as SegmentId });
          onHighlightSegment(segStr as SegmentId);
          setLastFeedback(`Action: Highlighted Segment "${segStr.toUpperCase()}"`);
          return;
        } else if (state.currentSlide === 11) {
          onUpdateState({
            sixteenSelectedSegment: segStr as SixteenSegmentId,
            fourteenSelectedSegment: segStr as FourteenSegmentId,
          });
          if (onHighlightFourteenSegment) onHighlightFourteenSegment(segStr as SixteenSegmentId);
          setLastFeedback(`Action: Highlighted 16-Segment "${segStr.toUpperCase()}"`);
          return;
        }
      }

      // 7. Character Commands ("show A", "show 1", "show 7", "show B", "character C")
      const charMatch =
        text.match(/(?:show|display|letter|character|select|for|said)\s+([a-f0-9])/i) ||
        text.match(/\b([a-f0-9])\b/i);

      if (charMatch) {
        const token = charMatch[1].toUpperCase();
        if (['A', 'B', 'C', 'D', 'E', 'F'].includes(token)) {
          onUpdateState({
            sixteenChar: token,
            fourteenChar: token,
            dotMatrixPattern: token,
          });
          setLastFeedback(`Action: Displayed Character "${token}"`);
          return;
        }
        const numVal = parseInt(token, 10);
        if (!isNaN(numVal) && numVal >= 0 && numVal <= 9) {
          onUpdateState({
            selectedDigit: numVal,
            sixteenChar: String(numVal),
            fourteenChar: String(numVal),
            dotMatrixPattern: numVal === 8 ? '8' : state.dotMatrixPattern,
          });
          setLastFeedback(`Action: Displayed Digit ${numVal}`);
          return;
        }
      }

      for (const [w, val] of Object.entries(NUMBER_WORDS)) {
        if (text.includes(w) && val <= 9) {
          onUpdateState({
            selectedDigit: val,
            sixteenChar: String(val),
            fourteenChar: String(val),
          });
          setLastFeedback(`Action: Displayed Digit ${val}`);
          return;
        }
      }

      setLastFeedback(`Heard: "${raw}"`);
    },
    [state, onUpdateState, onNext, onPrev, goToSlide, onHighlightSegment, onHighlightFourteenSegment]
  );

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Silently fall back without setting errorMsg
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const speechText = event.results[lastIndex][0].transcript;
        executeVoiceCommand(speechText);
      };

      rec.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        console.warn('Speech recognition warning:', event.error);
      };

      rec.onend = () => {
        if (shouldListenRef.current) {
          try {
            rec.start();
          } catch (e) {
            // ignore
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
    } catch (e) {
      // Silently ignore
    }

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [executeVoiceCommand]);

  const toggleListening = () => {
    if (isListening) {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      setLastFeedback('Voice control deactivated');
    } else {
      setErrorMsg(null);
      shouldListenRef.current = true;
      setIsListening(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // ignore
        }
      }
      setLastFeedback('Voice Control Active — Speak commands ("Next Slide", "Show 7", "Show A")');
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Clean Compact Mic Toggle Button */}
      <button
        onClick={toggleListening}
        title={isListening ? 'Deactivate Voice Commands' : 'Activate Voice Commands'}
        className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono-tech transition-all cursor-pointer shadow-md ${
          isListening
            ? 'bg-rose-600/90 border-rose-400 text-white shadow-[0_0_18px_rgba(244,63,94,0.7)] animate-pulse'
            : 'bg-slate-900/90 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:bg-slate-800'
        }`}
      >
        {isListening ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-100"></span>
            </span>
            <Mic className="w-3.5 h-3.5 text-white" />
            <span className="font-bold tracking-wider uppercase text-[11px]">LISTENING</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-[11px]">VOICE CONTROL</span>
          </>
        )}
      </button>

      {/* Non-intrusive Floating Feedback Toast Banner */}
      {lastFeedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-950/95 border border-cyan-500/50 text-xs font-mono-tech text-white shadow-[0_10px_35px_rgba(0,0,0,0.9)] flex items-center space-x-2 animate-in fade-in slide-in-from-top duration-200 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-cyan-200">{lastFeedback}</span>
        </div>
      )}
    </div>
  );
};
