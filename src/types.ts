export type SegmentId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'dp';

export type CircuitConfig = 'CC' | 'CA'; // Common Cathode vs Common Anode

export type ApplicationType = 'clock' | 'counter' | 'calculator' | 'meter' | 'instruments';

export type EvaluationTab = 'advantages' | 'limitations';

// 16-Segment specific segment identifiers (a, b, c, d, e, f, g1, g2, h, i, j, k, l, m, dp)
export type SixteenSegmentId =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g1'
  | 'g2'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'dp';

// Alias for backwards compatibility if needed
export type FourteenSegmentId = SixteenSegmentId;

export type SixteenApplicationType =
  | 'clocks'
  | 'counters'
  | 'calculators'
  | 'instruments'
  | 'panels'
  | 'indicators';

export type FourteenApplicationType = SixteenApplicationType;

export interface PresentationState {
  currentSlide: number; // 1 to 21
  circuitMode: CircuitConfig;
  selectedDigit: number; // 0 to 9
  selectedSegment: SegmentId | null;
  selectedApp: ApplicationType;
  evaluationTab: EvaluationTab;
  truthTableMode: CircuitConfig; // 'CC' or 'CA'

  // 16-Segment state additions
  fourteenChar: string; // alias for sixteenChar
  sixteenChar: string;
  fourteenCircuitMode: CircuitConfig;
  sixteenCircuitMode: CircuitConfig;
  fourteenSelectedSegment: SixteenSegmentId | null;
  sixteenSelectedSegment: SixteenSegmentId | null;
  fourteenApp: SixteenApplicationType;
  sixteenApp: SixteenApplicationType;
  fourteenEvaluationTab: EvaluationTab;
  sixteenEvaluationTab: EvaluationTab;

  // Dot Matrix state
  dotMatrixPattern: string; // e.g., 'A', '8', 'HEART', etc.
}

export interface TruthTableRow {
  num: number;
  bcd: string; // e.g. "0000"
  A: number;
  B: number;
  C: number;
  D: number;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  g: number;
}

