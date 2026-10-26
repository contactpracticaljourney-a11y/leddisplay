import React from 'react';
import {
  PresentationState,
  SegmentId,
  CircuitConfig,
  ApplicationType,
  EvaluationTab,
  SixteenSegmentId,
  SixteenApplicationType,
} from '../types';
import {
  CC_TRUTH_TABLE,
  CA_TRUTH_TABLE,
  SEGMENT_METADATA,
  DIGIT_SEGMENTS,
  APPLICATION_DETAILS,
  SIXTEEN_SEGMENT_METADATA,
  SIXTEEN_CHAR_SEGMENTS,
  SIXTEEN_APPLICATIONS,
} from '../constants';
import {
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calculator,
  Gauge,
  Radio,
  Sliders,
  Check,
  Binary,
  Hash,
  Type,
  Grid,
  Heart,
  Smile,
} from 'lucide-react';

interface SlideRendererProps {
  state: PresentationState;
  onUpdateState: (updates: Partial<PresentationState>) => void;
  onHighlightSegment: (segId: SegmentId | null) => void;
  onHighlightFourteenSegment?: (segId: SixteenSegmentId | null) => void;
}

export const PresentationSlideRenderer: React.FC<SlideRendererProps> = ({
  state,
  onUpdateState,
  onHighlightSegment,
  onHighlightFourteenSegment,
}) => {
  const {
    currentSlide,
    circuitMode,
    selectedDigit,
    selectedSegment,
    selectedApp,
    evaluationTab,
    truthTableMode,
    sixteenChar = state.fourteenChar || 'A',
    sixteenCircuitMode = state.fourteenCircuitMode || 'CA',
    sixteenSelectedSegment = state.fourteenSelectedSegment || null,
    sixteenApp = state.fourteenApp || 'clocks',
    sixteenEvaluationTab = state.fourteenEvaluationTab || 'advantages',
    dotMatrixPattern = 'A',
  } = state;

  return (
    <div className="w-full h-full flex flex-col justify-between text-slate-100 pr-1">
      {/* =========================================================================
          SLIDE 1 — TITLE & INTRODUCTION
      ========================================================================= */}
      {currentSlide === 1 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md border border-cyan-500/40 bg-slate-900/90 mb-4 shadow-lg">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold tracking-widest text-cyan-300 font-display uppercase">
                BASIC ELECTRONICS
              </span>
            </div>

            <h1 className="font-orbitron font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-wider text-white uppercase leading-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]">
              SEVEN SEGMENT
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-red-500">
                LED DISPLAY
              </span>
            </h1>

            <div className="mt-3 text-sm text-cyan-400 font-mono-tech tracking-wide">
              Understanding Digital Display Technology
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              A comprehensive technical presentation on solid-state digital display architecture, diode polarity, BCD decoding, and multiplexed multi-digit interfacing.
            </p>
          </div>

          <div className="my-4 p-4 rounded-xl border border-slate-700/80 bg-slate-950/90 shadow-2xl">
            <span className="text-[10px] font-mono-tech tracking-widest text-slate-400 uppercase block mb-1">
              Presented by
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-wider text-white font-display block">
              VARUN JANGRA
            </span>
            <div className="text-xs font-mono-tech text-cyan-400 mt-1">
              Department of Computer Science and Engineering
            </div>
          </div>

          <div className="mt-3 text-[11px] font-mono-tech text-slate-400">
            Use <span className="text-cyan-400 border border-slate-700 px-1 rounded bg-slate-900">←</span> and <span className="text-cyan-400 border border-slate-700 px-1 rounded bg-slate-900">→</span> buttons on screen edges to advance slides
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 2 — DISPLAY OPERATIONS
      ========================================================================= */}
      {currentSlide === 2 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 02 • INTRODUCTION
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              DISPLAY OPERATIONS
            </h2>

            <div className="mt-4 p-4 rounded-xl border border-cyan-500/20 bg-slate-950/80 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-lg">
              A seven-segment display is an optoelectronic semiconductor package composed of seven individually addressable Light Emitting Diodes (LEDs), arranged in a figure-8 configuration. By selectively energizing combinations of these segments, any decimal numeral from <strong>0 through 9</strong> can be clearly synthesized.
            </div>
          </div>

          <div className="my-3 p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-xs font-mono-tech">
            <div className="text-cyan-400 font-bold mb-2 flex items-center space-x-1.5">
              <Layers className="w-4 h-4" />
              <span>STANDARD SEGMENT TOPOLOGY:</span>
            </div>
            <pre className="text-slate-300 font-mono-tech text-xs leading-none bg-black/60 p-3 rounded border border-slate-800 overflow-x-auto">
{`       ───── a ─────
      |             |
      f             b
      |             |
       ───── g ─────
      |             |
      e             c
      |             |
       ───── d ─────   [ dp ]`}
            </pre>
            <div className="mt-2 text-[11px] text-slate-400">
              An optional 8th diode serves as the decimal point (DP).
            </div>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-xs font-mono-tech text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>DISPLAY OPERATION: Automatic numerical cycle 0 through 9 on the display panel.</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 3 — SEVEN SEGMENT STRUCTURE (Exploded View)
      ========================================================================= */}
      {currentSlide === 3 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 03 • PHYSICAL ANATOMY
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              SEVEN SEGMENT STRUCTURE
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click any segment below to toggle its individual LED emission:
            </p>
          </div>

          {/* Interactive Segment Buttons */}
          <div className="my-3 space-y-2 flex-1 overflow-y-auto pr-1">
            {SEGMENT_METADATA.map((item) => {
              const isSelected = selectedSegment === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    const next = isSelected ? null : item.id;
                    onUpdateState({ selectedSegment: next });
                    onHighlightSegment(next);
                  }}
                  className={`w-full p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-left ${
                    isSelected
                      ? 'border-red-500 bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-[1.02]'
                      : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono-tech font-bold text-xs ${
                        isSelected ? 'bg-black text-white' : 'bg-slate-800 text-cyan-400'
                      }`}
                    >
                      {item.id}
                    </span>
                    <span className="text-xs font-semibold">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono-tech opacity-80">
                    {item.position}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 4 — COMMON ANODE & COMMON CATHODE CIRCUITS
      ========================================================================= */}
      {currentSlide === 4 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 04 • CIRCUIT CONFIGURATIONS
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              COMMON ANODE & COMMON CATHODE
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              LEDs are directional diodes requiring either a shared positive anode or shared negative cathode bus:
            </p>
          </div>

          {/* High-Contrast Interactive Buttons */}
          <div className="my-2.5 p-3 rounded-xl border border-slate-700 bg-slate-950 shadow-xl">
            <div className="text-xs font-mono-tech text-slate-400 mb-2">
              SELECT CIRCUIT POLARITY:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
              <button
                onClick={() => onUpdateState({ circuitMode: 'CA' })}
                className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  circuitMode === 'CA'
                    ? 'bg-amber-500 border-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)] font-extrabold scale-[1.02]'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-400'
                }`}
              >
                {circuitMode === 'CA' && <Check className="w-4 h-4 stroke-[3]" />}
                <span>COMMON ANODE (CA)</span>
              </button>

              <button
                onClick={() => onUpdateState({ circuitMode: 'CC' })}
                className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  circuitMode === 'CC'
                    ? 'bg-emerald-500 border-emerald-300 text-black shadow-[0_0_20px_rgba(16,185,129,0.6)] font-extrabold scale-[1.02]'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-400'
                }`}
              >
                {circuitMode === 'CC' && <Check className="w-4 h-4 stroke-[3]" />}
                <span>COMMON CATHODE (CC)</span>
              </button>
            </div>
          </div>

          {/* Circuit Operation Details */}
          <div className="p-3 rounded-xl border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed">
            <div className="font-bold mb-1.5 flex items-center space-x-1.5 text-cyan-300">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>CIRCUIT OPERATION:</span>
            </div>

            {circuitMode === 'CA' ? (
              <div className="space-y-1 text-slate-200">
                <div className="text-amber-400 font-bold">COMMON ANODE (CA): +5V VCC SHARED</div>
                <div>• Common Terminal: <strong className="text-amber-300">+5V VCC Supply Rail</strong></div>
                <div>• Segment Logic: <strong className="text-white">Active-LOW (0V / Ground = ON)</strong></div>
                <div>• Current Limiting: 220Ω resistor in series with each cathode line</div>
                <div>• Driver IC: SN7447 or open-collector sinking driver</div>
              </div>
            ) : (
              <div className="space-y-1 text-slate-200">
                <div className="text-emerald-400 font-bold">COMMON CATHODE (CC): 0V GND SHARED</div>
                <div>• Common Terminal: <strong className="text-emerald-300">Ground (0V) Return Bus</strong></div>
                <div>• Segment Logic: <strong className="text-white">Active-HIGH (+5V Logic High = ON)</strong></div>
                <div>• Current Limiting: 220Ω resistor in series with each anode line</div>
                <div>• Driver IC: CD4511 or high-side sourcing driver</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 5 — CONNECTED WITH BCD DECODER
      ========================================================================= */}
      {currentSlide === 5 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 05 • DIGITAL INTERFACING
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              CONNECTED WITH BCD DECODER
            </h2>
            <div className="mt-2 p-3 rounded-xl border border-cyan-500/20 bg-slate-950 text-xs text-slate-300 leading-relaxed">
              <strong>4-BIT BCD INPUT → DECODER IC (7447) → 7 SEGMENT OUTPUTS (a–g)</strong>
              <div className="mt-1 text-slate-400">
                Decodes binary numbers 0000–1001 into corresponding segment drive currents. Both the 16-pin dual in-line package (DIP) IC and the 7-segment display are mounted side-by-side on the circuit board.
              </div>
            </div>
          </div>

          {/* Interactive BCD Digit Buttons */}
          <div className="my-2 p-3 rounded-xl border border-slate-700 bg-slate-950">
            <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 mb-2">
              <span>SELECT DECIMAL DIGIT:</span>
              <span className="text-red-400 font-bold">ACTIVE: DIGIT {selectedDigit}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 font-mono-tech text-xs">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                <button
                  key={d}
                  onClick={() => onUpdateState({ selectedDigit: d })}
                  className={`py-2 rounded-lg border font-bold transition-all cursor-pointer ${
                    selectedDigit === d
                      ? 'bg-red-500 border-red-300 text-white font-extrabold shadow-[0_0_15px_rgba(239,68,68,0.7)] scale-110'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Decoding Status Card */}
          <div className="p-3 rounded-xl border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed">
            <div className="text-cyan-400 font-bold mb-1 flex items-center space-x-1.5">
              <Binary className="w-3.5 h-3.5 text-cyan-400" />
              <span>BCD DECODING CONVERSION:</span>
            </div>
            <div className="space-y-1 text-slate-200 text-[11px]">
              <div>• Decimal Value: <strong className="text-white font-bold">{selectedDigit}</strong></div>
              <div>• 4-Bit BCD Lines (A B C D): <strong className="text-cyan-300 font-mono">{selectedDigit.toString(2).padStart(4, '0')}</strong></div>
              <div>• Energized Segment Outputs: <strong className="text-emerald-400">{DIGIT_SEGMENTS[selectedDigit].join(', ').toUpperCase()}</strong></div>
              <div>• Interconnect: Ribbons transfer signals directly from IC pins to display anodes/cathodes.</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 6 — TRUTH TABLES
      ========================================================================= */}
      {currentSlide === 6 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 06 • LOGIC TABLES
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              TRUTH TABLES
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select configuration tab and click any digit row to highlight segment states:
            </p>
          </div>

          {/* Truth Table Polarity Toggle Tabs */}
          <div className="my-2 grid grid-cols-2 gap-2 text-xs font-mono-tech">
            <button
              onClick={() => onUpdateState({ truthTableMode: 'CC' })}
              className={`py-2 px-2.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                truthTableMode === 'CC'
                  ? 'bg-emerald-600 border-emerald-400 text-white font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>COMMON CATHODE (1 = ON)</span>
            </button>

            <button
              onClick={() => onUpdateState({ truthTableMode: 'CA' })}
              className={`py-2 px-2.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                truthTableMode === 'CA'
                  ? 'bg-amber-600 border-amber-400 text-white font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>COMMON ANODE (0 = ON)</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="my-1 p-2 rounded-xl border border-slate-800 bg-slate-950 max-h-[34vh] overflow-y-auto">
            <table className="w-full text-left font-mono-tech text-xs text-slate-200">
              <thead>
                <tr className="border-b border-slate-700 text-cyan-400">
                  <th className="py-1 px-1">DEC</th>
                  <th className="py-1 px-1">BCD</th>
                  <th className="py-1 px-0.5 text-center">a</th>
                  <th className="py-1 px-0.5 text-center">b</th>
                  <th className="py-1 px-0.5 text-center">c</th>
                  <th className="py-1 px-0.5 text-center">d</th>
                  <th className="py-1 px-0.5 text-center">e</th>
                  <th className="py-1 px-0.5 text-center">f</th>
                  <th className="py-1 px-0.5 text-center">g</th>
                </tr>
              </thead>
              <tbody>
                {(truthTableMode === 'CC' ? CC_TRUTH_TABLE : CA_TRUTH_TABLE).map((row) => {
                  const isSelected = selectedDigit === row.num;
                  const onValue = truthTableMode === 'CC' ? 1 : 0;
                  return (
                    <tr
                      key={row.num}
                      onClick={() => onUpdateState({ selectedDigit: row.num })}
                      className={`cursor-pointer border-b border-slate-800/60 transition-colors ${
                        isSelected ? 'bg-red-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <td className="py-1 px-1 font-bold text-cyan-300">{row.num}</td>
                      <td className="py-1 px-1 font-mono text-[10px] text-slate-400">{row.bcd}</td>
                      <td className={`py-1 px-0.5 text-center ${row.a === onValue ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>{row.a}</td>
                      <td className={`py-1 px-0.5 text-center ${row.b === onValue ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>{row.b}</td>
                      <td className={`py-1 px-0.5 text-center ${row.c === onValue ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>{row.c}</td>
                      <td className={`py-1 px-0.5 text-center ${row.d === onValue ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>{row.d}</td>
                      <td className={`py-1 px-0.5 text-center ${row.e === onValue ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>{row.e}</td>
                      <td className={`py-1 px-0.5 text-center ${row.f === onValue ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>{row.f}</td>
                      <td className={`py-1 px-0.5 text-center ${row.g === onValue ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>{row.g}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 rounded-lg border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech text-slate-200">
            Active: <strong className="text-cyan-300">Digit {selectedDigit}</strong> ({truthTableMode === 'CC' ? 'Active-High 1 = ON' : 'Active-Low 0 = ON'}).
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 7 — CIRCUIT OVERVIEW
      ========================================================================= */}
      {currentSlide === 7 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 07 • ARCHITECTURE
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              CIRCUIT OVERVIEW
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Direct point-to-point driving versus time-multiplexed bus scanning:
            </p>
          </div>

          <div className="my-2.5 space-y-2.5">
            <div className="p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-xs leading-relaxed">
              <div className="text-cyan-400 font-bold font-mono-tech mb-1">
                SINGLE-DIGIT DISPLAY (DIRECT DRIVE):
              </div>
              <p className="text-slate-300 text-xs">
                Each segment has a dedicated driver pin. Straightforward to implement, but requires <strong>8 microcontroller I/O pins per digit</strong>, quickly consuming available pins.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-red-500/30 bg-slate-950 text-xs leading-relaxed">
              <div className="text-red-400 font-bold font-mono-tech mb-1">
                4-DIGIT MULTIPLEXED DISPLAY ("2026"):
              </div>
              <p className="text-slate-300 text-xs">
                All 4 digits share common 7-segment data bus lines. PNP/NPN digit transistors sequentially enable <strong>Digit 1 → 2 → 3 → 4</strong> at a rapid refresh rate (&gt;100 Hz). Due to human persistence of vision, all digits appear steadily illuminated while slashing wiring pins from <strong>32 down to only 11 pins</strong>.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-xs font-mono-tech text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>CIRCUIT OVERVIEW: Single digit '7' on left; multiplexed '2026' bank on right without overlap.</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 8 — SELECT INTERFACE
      ========================================================================= */}
      {currentSlide === 8 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 08 • EMBEDDED DEVICES
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              SELECT INTERFACE
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click an application below to inspect its dedicated display module:
            </p>
          </div>

          {/* Interactive Application Selector Buttons */}
          <div className="my-2 grid grid-cols-2 gap-1.5 text-xs font-mono-tech">
            {[
              { id: 'clock' as ApplicationType, icon: Clock, name: 'DIGITAL CLOCK' },
              { id: 'counter' as ApplicationType, icon: Gauge, name: 'EVENT COUNTER' },
              { id: 'calculator' as ApplicationType, icon: Calculator, name: 'CALCULATOR' },
              { id: 'meter' as ApplicationType, icon: Zap, name: 'DIGITAL METER' },
              { id: 'instruments' as ApplicationType, icon: Radio, name: 'INSTRUMENTS' },
            ].map((app) => {
              const isSelected = selectedApp === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => onUpdateState({ selectedApp: app.id })}
                  className={`p-2 rounded-lg border font-bold transition-all cursor-pointer flex items-center space-x-2 text-left ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-[1.02]'
                      : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <app.icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] truncate">{app.name}</span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Application Details */}
          {APPLICATION_DETAILS[selectedApp] && (
            <div className="my-1 p-3 rounded-xl border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-cyan-400 font-bold uppercase">{APPLICATION_DETAILS[selectedApp].title}</span>
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 font-bold">
                  {APPLICATION_DETAILS[selectedApp].readout}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mb-2">
                {APPLICATION_DETAILS[selectedApp].description}
              </p>
              <div className="space-y-1 text-slate-400 text-[10px]">
                {APPLICATION_DETAILS[selectedApp].points.map((pt, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-[11px] font-mono-tech text-slate-400">
            Selected instrument face and numerical telemetry centered on the display panel.
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 9 — ADVANTAGES & LIMITATIONS (7-Segment)
      ========================================================================= */}
      {currentSlide === 9 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 09 • TECHNICAL EVALUATION
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              ADVANTAGES & LIMITATIONS
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click a tab below to examine trade-offs:
            </p>
          </div>

          {/* Interactive Evaluation Tabs */}
          <div className="my-2.5 grid grid-cols-2 gap-2 text-xs font-mono-tech">
            <button
              onClick={() => onUpdateState({ evaluationTab: 'advantages' })}
              className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                evaluationTab === 'advantages'
                  ? 'bg-emerald-600 border-emerald-400 text-white font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>ADVANTAGES</span>
            </button>

            <button
              onClick={() => onUpdateState({ evaluationTab: 'limitations' })}
              className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                evaluationTab === 'limitations'
                  ? 'bg-rose-600 border-rose-400 text-white font-extrabold shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              <span>LIMITATIONS</span>
            </button>
          </div>

          {/* Content Area Based on Selected Tab */}
          {evaluationTab === 'advantages' ? (
            <div className="my-1 p-3.5 rounded-xl border border-emerald-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed space-y-2">
              <div className="text-emerald-400 font-bold uppercase flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>KEY ADVANTAGES:</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <span><strong>High Optical Contrast:</strong> Crisp red emission visible under diverse ambient lighting without backlight bleed.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <span><strong>Mechanical Ruggedness:</strong> Solid-state epoxy encapsulation resists vibration, drop shock, and temperature swings.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">3.</span>
                  <span><strong>Low Cost & Simplicity:</strong> Inexpensive high-volume manufacturing with standard 0.1-inch DIP pinouts.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">4.</span>
                  <span><strong>Driver Availability:</strong> Universal hardware decoders (7447, 7448, CD4511) ease integration with any MCU.</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="my-1 p-3.5 rounded-xl border border-rose-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed space-y-2">
              <div className="text-rose-400 font-bold uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>TECHNICAL LIMITATIONS:</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">1.</span>
                  <span><strong>Character Set Restrictions:</strong> Only digits (0-9) and limited letters (A, b, C, d, E, F) can be formed. Complex alphanumeric strings require 16-segment or dot-matrix displays.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">2.</span>
                  <span><strong>Multiplexing Overhead:</strong> Multi-digit designs require continuous high-speed scanning routines and driver transistors.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">3.</span>
                  <span><strong>Power Consumption:</strong> Emits light continuously (~15–20mA per segment), requiring significantly more power than reflective passive LCDs.</span>
                </li>
              </ul>
            </div>
          )}

          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono-tech text-slate-400">
            Solid-state LED package demonstrating high contrast emission on the display panel.
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 10 — DISPLAY READING (14-Segment LED Display Title & Intro)
      ========================================================================= */}
      {currentSlide === 10 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md border border-cyan-500/40 bg-slate-900/90 mb-3 shadow-lg">
              <Hash className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold tracking-widest text-cyan-300 font-display uppercase">
                ADVANCED DISPLAY TECHNOLOGY
              </span>
            </div>

            <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white uppercase leading-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]">
              14-SEGMENT
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                LED DISPLAY
              </span>
            </h2>

            <div className="mt-3 text-xs sm:text-sm text-cyan-400 font-mono-tech italic">
              “An extension of the seven-segment display for numbers, letters and symbols.”
            </div>

            <div className="mt-4 p-4 rounded-xl border border-cyan-500/30 bg-slate-950/90 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-xl">
              A 14-segment LED display contains fourteen individually controlled LED segments. By combining these segments, it can represent <strong>numbers, letters (A–Z) and several mathematical symbols</strong>.
            </div>
          </div>

          <div className="my-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono-tech">
            <div className="text-cyan-400 font-bold mb-1.5 flex items-center space-x-1.5">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>ACTIVE CHARACTER RENDER:</span>
            </div>
            <div className="text-slate-300">
              Showing letter <strong className="text-white text-base">"A"</strong> with illuminated outer bars and center split crossbars.
            </div>
          </div>

          <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-xs font-mono-tech text-cyan-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>DISPLAY READING: 14-segment solid-state semiconductor module active.</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 11 — SEGMENT POSITION AND USAGE
      ========================================================================= */}
      {currentSlide === 11 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 11 • PHYSICAL TOPOLOGY
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              SEGMENT POSITION AND USAGE
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Inspect individual segments labeled a through m:
            </p>
          </div>

          {/* Interactive 14 Segment Buttons Grid */}
          <div className="my-2 grid grid-cols-2 gap-1 max-h-[36vh] overflow-y-auto pr-1">
            {SIXTEEN_SEGMENT_METADATA.map((item) => {
              const isSelected = sixteenSelectedSegment === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    const next = isSelected ? null : item.id;
                    onUpdateState({ sixteenSelectedSegment: next, fourteenSelectedSegment: next });
                    if (onHighlightFourteenSegment) onHighlightFourteenSegment(next);
                  }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-left ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-[1.02]'
                      : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center font-mono-tech font-bold text-xs ${
                        isSelected ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-cyan-400'
                      }`}
                    >
                      {item.id}
                    </span>
                    <span className="text-[11px] font-semibold truncate">{item.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Segment Placement Details Card */}
          <div className="p-3 rounded-lg border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed">
            <div className="text-cyan-400 font-bold mb-1 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>SEGMENT POSITION & USAGE:</span>
            </div>
            {sixteenSelectedSegment ? (
              <div className="text-slate-200">
                Segment <strong className="text-cyan-300 uppercase">'{sixteenSelectedSegment}'</strong>: {
                  SIXTEEN_SEGMENT_METADATA.find((m) => m.id === sixteenSelectedSegment)?.position
                }. Used in characters: <span className="text-emerald-400">{
                  SIXTEEN_SEGMENT_METADATA.find((m) => m.id === sixteenSelectedSegment)?.usedIn
                }</span>.
              </div>
            ) : (
              <div className="text-slate-400">
                Outer frame: a, b, c, d, e, f. Center bars: g1, g2. Center verticals: i, l. Diagonals: h, j, k, m. Click any segment above to inspect.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 12 — ACTIVE 14 SEGMENT ENCODER (A, B, C, D, E, F)
      ========================================================================= */}
      {currentSlide === 12 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 12 • CHARACTER ENCODING
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              ACTIVE 14 SEGMENT ENCODER
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select characters A through F to observe exact segment combinations:
            </p>
          </div>

          {/* Interactive Character Select Buttons A-F */}
          <div className="my-2.5 p-3 rounded-xl border border-slate-700 bg-slate-950">
            <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 mb-2">
              <span>SELECT CHARACTER:</span>
              <span className="text-cyan-400 font-bold">ACTIVE: "{sixteenChar}"</span>
            </div>
            <div className="grid grid-cols-6 gap-2 font-mono-tech text-sm">
              {['A', 'B', 'C', 'D', 'E', 'F'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => onUpdateState({ sixteenChar: ch, fourteenChar: ch })}
                  className={`py-2 rounded-lg border font-bold transition-all cursor-pointer ${
                    sixteenChar === ch
                      ? 'bg-cyan-500 border-cyan-300 text-black font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.7)] scale-110'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Active Segment Synthesis Card */}
          <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed space-y-1.5">
            <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>ACTIVE 14-SEGMENT ENCODING:</span>
            </div>
            <div className="text-slate-200">
              • Character: <strong className="text-white text-base">"{sixteenChar}"</strong>
            </div>
            <div className="text-slate-200">
              • Active Segments: <strong className="text-emerald-400">
                {(SIXTEEN_CHAR_SEGMENTS[sixteenChar] || []).join(', ').toUpperCase()}
              </strong>
            </div>
            <p className="text-slate-400 text-[11px] pt-1">
              Full outer verticals (e, f) combined with top/bottom bars and split center crossbars deliver crisp, perfectly formed 14-segment letter typography.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 13 — DOT MATRIX LED DISPLAY (NEW SLIDE)
      ========================================================================= */}
      {currentSlide === 13 && (() => {
        const matrixData: Record<string, { label: string; rows: number[] }> = {
          'A': {
            label: 'Letter "A"',
            rows: [0b00111100, 0b01100110, 0b01100110, 0b01111110, 0b01100110, 0b01100110, 0b01100110, 0b00000000],
          },
          'B': {
            label: 'Letter "B"',
            rows: [0b01111100, 0b01100110, 0b01100110, 0b01111100, 0b01100110, 0b01100110, 0b01111100, 0b00000000],
          },
          '8': {
            label: 'Numeral "8"',
            rows: [0b00111100, 0b01100110, 0b01100110, 0b00111100, 0b01100110, 0b01100110, 0b00111100, 0b00000000],
          },
          'HEART': {
            label: 'Heart Symbol "♥"',
            rows: [0b00000000, 0b01100110, 0b11111111, 0b11111111, 0b01111110, 0b00111100, 0b00011000, 0b00000000],
          },
          'SMILE': {
            label: 'Smile Emoji "☺"',
            rows: [0b00111100, 0b01000010, 0b10100101, 0b10000001, 0b10100101, 0b10011001, 0b01000010, 0b00111100],
          },
        };

        const activeItem = matrixData[dotMatrixPattern] || matrixData['A'];

        return (
          <div className="flex flex-col justify-between h-full py-2">
            <div>
              <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
                SLIDE 13 • GRAPHICAL MATRIX
              </div>
              <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
                DOT MATRIX LED DISPLAY
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select a pattern to see how the 8x8 LED pixel matrix forms characters & icons:
              </p>
            </div>

            {/* Interactive Matrix Pattern Buttons */}
            <div className="my-2 p-2.5 rounded-xl border border-slate-700 bg-slate-950">
              <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 mb-2">
                <span>SELECT MATRIX PATTERN:</span>
                <span className="text-cyan-400 font-bold uppercase">{activeItem.label}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 font-mono-tech text-xs">
                {[
                  { id: 'A', label: 'LETTER A', icon: Type },
                  { id: 'B', label: 'LETTER B', icon: Type },
                  { id: '8', label: 'NUMBER 8', icon: Hash },
                  { id: 'HEART', label: 'HEART', icon: Heart },
                  { id: 'SMILE', label: 'SMILE', icon: Smile },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onUpdateState({ dotMatrixPattern: item.id })}
                    className={`py-1.5 px-1 rounded-lg border font-bold transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                      dotMatrixPattern === item.id
                        ? 'bg-cyan-500 border-cyan-300 text-black shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive 2D 8x8 Pixel Grid Diagram */}
            <div className="my-1 p-3 rounded-xl border border-cyan-500/40 bg-slate-950 flex flex-col items-center justify-center shadow-2xl">
              <div className="text-[11px] font-mono-tech text-cyan-400 font-bold uppercase mb-2 flex items-center space-x-1.5">
                <Grid className="w-3.5 h-3.5" />
                <span>8x8 LED PIXEL MATRIX preview ({activeItem.label}):</span>
              </div>

              <div className="grid grid-cols-8 gap-1.5 p-2 bg-black/90 rounded-lg border border-slate-800 shadow-inner">
                {activeItem.rows.flatMap((rowByte, r) =>
                  Array.from({ length: 8 }).map((_, c) => {
                    const isLit = (rowByte & (1 << (7 - c))) !== 0;
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
                          isLit
                            ? 'bg-red-500 border border-rose-300 shadow-[0_0_10px_rgba(239,68,68,0.9)] scale-110'
                            : 'bg-slate-900 border border-slate-800/80'
                        }`}
                        title={`Row ${r + 1}, Col ${c + 1}: ${isLit ? 'ON' : 'OFF'}`}
                      />
                    );
                  })
                )}
              </div>

              <div className="mt-2 text-center text-xs font-mono-tech">
                <span className="text-slate-400">FORMED PATTERN: </span>
                <span className="text-emerald-400 font-extrabold uppercase">{activeItem.label}</span>
              </div>
            </div>

            {/* Dot Matrix Details Card */}
            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono-tech leading-relaxed">
              <p className="text-slate-300 text-[11px]">
                64 LED pixels (8x8) multiplexed row-by-column allow rendering any character, symbol, or custom bitmap graphic.
              </p>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          SLIDE 14 — 14-SEGMENT LED CIRCUIT
      ========================================================================= */}
      {currentSlide === 14 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 14 • CIRCUIT ARCHITECTURE
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              14-SEGMENT LED CIRCUIT
            </h2>
          </div>

          {/* Circuit Stages Breakdown */}
          <div className="my-2.5 p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono-tech space-y-2">
            <div className="text-cyan-400 font-bold mb-1">CIRCUIT SCHEMATIC FLOW:</div>
            <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center justify-between">
              <span className="text-cyan-300 font-bold">1. POWER SUPPLY</span>
              <span className="text-slate-500">→</span>
              <span className="text-amber-300 font-bold">2. 14 RESISTORS (220Ω)</span>
            </div>
            <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center justify-between">
              <span className="text-red-400 font-bold">3. 14-SEGMENT LED</span>
              <span className="text-slate-500">→</span>
              <span className="text-emerald-400 font-bold">4. CONTROL CIRCUIT (IC)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed space-y-1">
            <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>ELECTRONIC INTERCONNECTS:</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Each LED anode/cathode line is wired in series with a 220Ω current-limiting resistor to protect the semiconductor junctions from overcurrent.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 15 — COMMON ANODE & COMMON CATHODE
      ========================================================================= */}
      {currentSlide === 15 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 15 • POLARITY CONFIGURATION
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              COMMON ANODE & COMMON CATHODE
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select configuration to observe physical circuit changes:
            </p>
          </div>

          {/* Interactive Polarity Buttons */}
          <div className="my-2.5 p-3.5 rounded-xl border border-slate-700 bg-slate-950 shadow-xl">
            <div className="text-xs font-mono-tech text-slate-400 mb-2">
              SWITCH POLARITY CONFIGURATION:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
              <button
                onClick={() => onUpdateState({ sixteenCircuitMode: 'CA', fourteenCircuitMode: 'CA' })}
                className={`py-2.5 px-3 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  sixteenCircuitMode === 'CA'
                    ? 'bg-amber-500 border-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)] font-extrabold scale-[1.02]'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-400'
                }`}
              >
                {sixteenCircuitMode === 'CA' && <Check className="w-4 h-4 stroke-[3]" />}
                <span>COMMON ANODE</span>
              </button>

              <button
                onClick={() => onUpdateState({ sixteenCircuitMode: 'CC', fourteenCircuitMode: 'CC' })}
                className={`py-2.5 px-3 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  sixteenCircuitMode === 'CC'
                    ? 'bg-emerald-500 border-emerald-300 text-black shadow-[0_0_20px_rgba(16,185,129,0.6)] font-extrabold scale-[1.02]'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-400'
                }`}
              >
                {sixteenCircuitMode === 'CC' && <Check className="w-4 h-4 stroke-[3]" />}
                <span>COMMON CATHODE</span>
              </button>
            </div>
          </div>

          {/* Circuit Wiring Feedback */}
          <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5 text-cyan-300">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>CIRCUIT POLARITY SPECIFICATIONS:</span>
            </div>

            {sixteenCircuitMode === 'CA' ? (
              <div className="space-y-1 text-slate-200">
                <div className="text-amber-400 font-bold">CONFIGURATION: COMMON ANODE (CA)</div>
                <div>• Common Terminal: <strong className="text-amber-300">+5V Supply Rail (Active)</strong></div>
                <div>• Logic Drive: <strong className="text-white">Active-LOW (0V / GND sinks current = ON)</strong></div>
              </div>
            ) : (
              <div className="space-y-1 text-slate-200">
                <div className="text-emerald-400 font-bold">CONFIGURATION: COMMON CATHODE (CC)</div>
                <div>• Common Terminal: <strong className="text-emerald-300">Ground (0V) Return Bus (Active)</strong></div>
                <div>• Logic Drive: <strong className="text-white">Active-HIGH (+5V sources current = ON)</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 16 — CHARACTER GENERATION (0-9, A-F)
      ========================================================================= */}
      {currentSlide === 16 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 16 • CHARACTER GENERATION
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              CHARACTER GENERATION
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Interactive character matrix (0–9, A–F):
            </p>
          </div>

          {/* Interactive 16-Key Grid */}
          <div className="my-2 p-3 rounded-xl border border-slate-700 bg-slate-950">
            <div className="grid grid-cols-8 gap-1.5 font-mono-tech text-xs">
              {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => onUpdateState({ sixteenChar: ch, fourteenChar: ch })}
                  className={`py-2 rounded-lg border font-bold transition-all cursor-pointer ${
                    sixteenChar === ch
                      ? 'bg-cyan-500 border-cyan-300 text-black font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-110'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Active Status Display */}
          <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed space-y-1">
            <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>GENERATED OUTPUT:</span>
            </div>
            <div>• Current Symbol: <strong className="text-white text-base">"{sixteenChar}"</strong></div>
            <div>• Energized Segments: <strong className="text-emerald-400">{(SIXTEEN_CHAR_SEGMENTS[sixteenChar] || []).join(', ').toUpperCase()}</strong></div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 17 — 14-SEGMENT VS 7-SEGMENT
      ========================================================================= */}
      {currentSlide === 17 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 17 • COMPARATIVE ANALYSIS
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              14-SEGMENT VS 7-SEGMENT
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visual contrast of alphabetic and symbol rendering capabilities:
            </p>
          </div>

          <div className="my-2.5 space-y-2.5">
            <div className="p-3 rounded-xl border border-red-500/40 bg-slate-950 text-xs leading-relaxed">
              <div className="text-red-400 font-bold font-mono-tech mb-1 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>LEFT (7-SEGMENT DISPLAY):</span>
              </div>
              <p className="text-slate-300 text-xs">
                Limited alphabetic representation. Cannot display diagonal letters such as <strong>M, N, K, X, Z</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-cyan-500/40 bg-slate-950 text-xs leading-relaxed">
              <div className="text-cyan-400 font-bold font-mono-tech mb-1 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RIGHT (14-SEGMENT DISPLAY):</span>
              </div>
              <p className="text-slate-300 text-xs">
                Superior alphanumeric representation. Diagonals and vertical center bars permit the complete alphabet A–Z and mathematical symbols (+, -, *, /).
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech text-slate-300">
            Side-by-side 7-segment and 14-segment models active in the viewport.
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 18 — MULTIPLEXING
      ========================================================================= */}
      {currentSlide === 18 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 18 • SCANNING ARCHITECTURE
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              MULTIPLEXING
            </h2>
            <div className="mt-3 p-4 rounded-xl border border-cyan-500/30 bg-slate-950 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              “Multiple displays can share segment lines by activating each display sequentially at high speed.”
            </div>
          </div>

          <div className="my-2.5 p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono-tech space-y-2">
            <div className="text-cyan-400 font-bold">MULTIPLEXED SCAN TIMING ("2 0 2 6"):</div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>• Time Slot 1: <strong className="text-white">Enable Digit 1 ('2')</strong> [Transistor Q1 ON]</div>
              <div>• Time Slot 2: <strong className="text-white">Enable Digit 2 ('0')</strong> [Transistor Q2 ON]</div>
              <div>• Time Slot 3: <strong className="text-white">Enable Digit 3 ('2')</strong> [Transistor Q3 ON]</div>
              <div>• Time Slot 4: <strong className="text-white">Enable Digit 4 ('6')</strong> [Transistor Q4 ON]</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech text-slate-300">
            Four 14-segment displays in the viewport demonstrate rapid sequential multiplexing.
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 19 — APPLICATIONS
      ========================================================================= */}
      {currentSlide === 19 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 19 • PRACTICAL SYSTEMS
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              APPLICATIONS
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click an application below to view its alphanumeric readout:
            </p>
          </div>

          {/* Interactive Application Buttons */}
          <div className="my-2 grid grid-cols-2 gap-1.5 text-xs font-mono-tech">
            {[
              { id: 'clocks' as SixteenApplicationType, icon: Clock, name: 'DIGITAL CLOCKS' },
              { id: 'counters' as SixteenApplicationType, icon: Gauge, name: 'COUNTERS' },
              { id: 'calculators' as SixteenApplicationType, icon: Calculator, name: 'CALCULATORS' },
              { id: 'instruments' as SixteenApplicationType, icon: Zap, name: 'INSTRUMENTS' },
              { id: 'panels' as SixteenApplicationType, icon: Sliders, name: 'CONTROL PANELS' },
              { id: 'indicators' as SixteenApplicationType, icon: Radio, name: 'FREE' },
            ].map((app) => {
              const isSelected = sixteenApp === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => onUpdateState({ sixteenApp: app.id, fourteenApp: app.id })}
                  className={`p-2 rounded-lg border font-bold transition-all cursor-pointer flex items-center space-x-2 text-left ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-[1.02]'
                      : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <app.icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] truncate">{app.name}</span>
                </button>
              );
            })}
          </div>

          {/* Application Details Card */}
          {SIXTEEN_APPLICATIONS[sixteenApp] && (
            <div className="my-1 p-3 rounded-xl border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-cyan-400 font-bold uppercase">{SIXTEEN_APPLICATIONS[sixteenApp].title}</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                  {SIXTEEN_APPLICATIONS[sixteenApp].readout}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mb-2">
                {SIXTEEN_APPLICATIONS[sixteenApp].description}
              </p>
              <div className="space-y-1 text-slate-400 text-[10px]">
                {SIXTEEN_APPLICATIONS[sixteenApp].points.map((pt, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-[11px] font-mono-tech text-slate-400">
            Active 14-segment instrument chassis rendered in the viewport.
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 20 — ADVANTAGES & LIMITATIONS (14-Segment)
      ========================================================================= */}
      {currentSlide === 20 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-1">
              SLIDE 20 • TECHNICAL EVALUATION
            </div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase">
              ADVANTAGES & LIMITATIONS
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Engineering evaluation of 14-segment displays:
            </p>
          </div>

          {/* Interactive Evaluation Tabs */}
          <div className="my-2.5 grid grid-cols-2 gap-2 text-xs font-mono-tech">
            <button
              onClick={() => onUpdateState({ sixteenEvaluationTab: 'advantages', fourteenEvaluationTab: 'advantages' })}
              className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                sixteenEvaluationTab === 'advantages'
                  ? 'bg-emerald-600 border-emerald-400 text-white font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>ADVANTAGES</span>
            </button>

            <button
              onClick={() => onUpdateState({ sixteenEvaluationTab: 'limitations', fourteenEvaluationTab: 'limitations' })}
              className={`py-2 px-3 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                sixteenEvaluationTab === 'limitations'
                  ? 'bg-rose-600 border-rose-400 text-white font-extrabold shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              <span>LIMITATIONS</span>
            </button>
          </div>

          {/* Content Area Based on Selected Tab */}
          {sixteenEvaluationTab === 'advantages' ? (
            <div className="my-1 p-3.5 rounded-xl border border-emerald-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed space-y-2">
              <div className="text-emerald-400 font-bold uppercase flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ADVANTAGES OF 14-SEGMENT:</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Better Alphabetic Representation:</strong> Renders letters A through Z with clear diagonal and vertical strokes.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Numbers and Symbols:</strong> Displays math symbols (+, -, *, /) and punctuation.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Good Brightness:</strong> High lumen output with direct forward-bias LED emission.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Simple Display Technology:</strong> Solid-state hardware with no complex OS or framebuffer required.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Easy to Understand:</strong> Transparent truth table and digital pin decoding.</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="my-1 p-3.5 rounded-xl border border-rose-500/40 bg-slate-950 text-xs font-mono-tech leading-relaxed space-y-2">
              <div className="text-rose-400 font-bold uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>LIMITATIONS OF 14-SEGMENT:</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>More Segments:</strong> 14 segments plus DP increases internal LED die count per digit block.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>More Control Complexity:</strong> Requires shift registers or dedicated alphanumeric driver ICs.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>More Wiring:</strong> 18-pin DIP footprint increases PCB routing density and trace count.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>More Driver Requirements:</strong> Cannot be driven by simple standard 7447 BCD decoders.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Limited Compared with Graphical Displays:</strong> Cannot render arbitrary bitmaps or high-res graphics.</span>
                </li>
              </ul>
            </div>
          )}

          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono-tech text-slate-400">
            Solid-state 14-segment form factor balancing character flexibility with electronic simplicity.
          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE 21 — CONCLUSION
      ========================================================================= */}
      {currentSlide === 21 && (
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="text-xs font-mono-tech text-cyan-400 tracking-widest uppercase mb-2">
              SLIDE 21 • CONCLUSION
            </div>
            <h2 className="font-orbitron font-extrabold text-3xl sm:text-4xl text-white uppercase">
              14-SEGMENT LED
            </h2>

            <div className="mt-4 p-4 rounded-xl border border-cyan-500/30 bg-slate-950 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              “Fourteen individually controlled LED segments allow numbers, letters and symbols to be displayed.”
            </div>
          </div>

          <div className="my-4 p-5 rounded-2xl border border-cyan-500/40 bg-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <div className="text-2xl sm:text-4xl font-extrabold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 tracking-widest uppercase mb-2">
              THANK YOU
            </div>
            <div className="text-xs font-mono-tech text-slate-400 uppercase tracking-widest mt-3">
              Presented by
            </div>
            <div className="text-2xl font-bold font-display text-white mt-1">
              VARUN JANGRA
            </div>
            <div className="text-xs font-mono-tech text-cyan-400 mt-1">
              Department of Computer Science and Engineering
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono-tech text-slate-400">
              BASIC ELECTRONICS
            </div>
          </div>

          <div className="p-3 rounded-lg border border-cyan-500/40 bg-slate-950 text-xs font-mono-tech text-slate-300">
            Cinematic orbital view around the illuminated 14-segment display module.
          </div>
        </div>
      )}
    </div>
  );
};
