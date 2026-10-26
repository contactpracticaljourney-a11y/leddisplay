import {
  ApplicationType,
  SegmentId,
  TruthTableRow,
  SixteenSegmentId,
  FourteenSegmentId,
  SixteenApplicationType,
  FourteenApplicationType,
} from './types';

export const TOTAL_SLIDES = 21;

// Standard 7-Segment Digit to Segment Map (a - g)
export const DIGIT_SEGMENTS: Record<number, SegmentId[]> = {
  0: ['a', 'b', 'c', 'd', 'e', 'f'],
  1: ['b', 'c'],
  2: ['a', 'b', 'd', 'e', 'g'],
  3: ['a', 'b', 'c', 'd', 'g'],
  4: ['b', 'c', 'f', 'g'],
  5: ['a', 'c', 'd', 'f', 'g'],
  6: ['a', 'c', 'd', 'e', 'f', 'g'],
  7: ['a', 'b', 'c'],
  8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  9: ['a', 'b', 'c', 'd', 'f', 'g'],
};

// Segment anatomical metadata (7-Segment)
export const SEGMENT_METADATA: { id: SegmentId; name: string; position: string; usedIn: string }[] = [
  { id: 'a', name: 'Top Segment', position: 'Horizontal top stroke', usedIn: '0, 2, 3, 5, 6, 7, 8, 9' },
  { id: 'b', name: 'Upper-right Segment', position: 'Vertical top-right', usedIn: '0, 1, 2, 3, 4, 7, 8, 9' },
  { id: 'c', name: 'Lower-right Segment', position: 'Vertical bottom-right', usedIn: '0, 1, 3, 4, 5, 6, 7, 8, 9' },
  { id: 'd', name: 'Bottom Segment', position: 'Horizontal bottom base', usedIn: '0, 2, 3, 5, 6, 8, 9' },
  { id: 'e', name: 'Lower-left Segment', position: 'Vertical bottom-left', usedIn: '0, 2, 6, 8' },
  { id: 'f', name: 'Upper-left Segment', position: 'Vertical top-left', usedIn: '0, 4, 5, 6, 8, 9' },
  { id: 'g', name: 'Middle Segment', position: 'Horizontal center crossbar', usedIn: '2, 3, 4, 5, 6, 8, 9' },
];

// Common Cathode Truth Table (Active-HIGH: 1 = ON, 0 = OFF)
export const CC_TRUTH_TABLE: TruthTableRow[] = [
  { num: 0, bcd: '0000', A: 0, B: 0, C: 0, D: 0, a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 0 },
  { num: 1, bcd: '0001', A: 0, B: 0, C: 0, D: 1, a: 0, b: 1, c: 1, d: 0, e: 0, f: 0, g: 0 },
  { num: 2, bcd: '0010', A: 0, B: 0, C: 1, D: 0, a: 1, b: 1, c: 0, d: 1, e: 1, f: 0, g: 1 },
  { num: 3, bcd: '0011', A: 0, B: 0, C: 1, D: 1, a: 1, b: 1, c: 1, d: 1, e: 0, f: 0, g: 1 },
  { num: 4, bcd: '0100', A: 0, B: 1, C: 0, D: 0, a: 0, b: 1, c: 1, d: 0, e: 0, f: 1, g: 1 },
  { num: 5, bcd: '0101', A: 0, B: 1, C: 0, D: 1, a: 1, b: 0, c: 1, d: 1, e: 0, f: 1, g: 1 },
  { num: 6, bcd: '0110', A: 0, B: 1, C: 1, D: 0, a: 1, b: 0, c: 1, d: 1, e: 1, f: 1, g: 1 },
  { num: 7, bcd: '0111', A: 0, B: 1, C: 1, D: 1, a: 1, b: 1, c: 1, d: 0, e: 0, f: 0, g: 0 },
  { num: 8, bcd: '1000', A: 1, B: 0, C: 0, D: 0, a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1 },
  { num: 9, bcd: '1001', A: 1, B: 0, C: 0, D: 1, a: 1, b: 1, c: 1, d: 1, e: 0, f: 1, g: 1 },
];

// Common Anode Truth Table (Active-LOW: 0 = ON, 1 = OFF)
export const CA_TRUTH_TABLE: TruthTableRow[] = [
  { num: 0, bcd: '0000', A: 0, B: 0, C: 0, D: 0, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 1 },
  { num: 1, bcd: '0001', A: 0, B: 0, C: 0, D: 1, a: 1, b: 0, c: 0, d: 1, e: 1, f: 1, g: 1 },
  { num: 2, bcd: '0010', A: 0, B: 0, C: 1, D: 0, a: 0, b: 0, c: 1, d: 0, e: 0, f: 1, g: 0 },
  { num: 3, bcd: '0011', A: 0, B: 0, C: 1, D: 1, a: 0, b: 0, c: 0, d: 0, e: 1, f: 1, g: 0 },
  { num: 4, bcd: '0100', A: 0, B: 1, C: 0, D: 0, a: 1, b: 0, c: 0, d: 1, e: 1, f: 0, g: 0 },
  { num: 5, bcd: '0101', A: 0, B: 1, C: 0, D: 1, a: 0, b: 1, c: 0, d: 0, e: 1, f: 0, g: 0 },
  { num: 6, bcd: '0110', A: 0, B: 1, C: 1, D: 0, a: 0, b: 1, c: 0, d: 0, e: 0, f: 0, g: 0 },
  { num: 7, bcd: '0111', A: 0, B: 1, C: 1, D: 1, a: 0, b: 0, c: 0, d: 1, e: 1, f: 1, g: 1 },
  { num: 8, bcd: '1000', A: 1, B: 0, C: 0, D: 0, a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0 },
  { num: 9, bcd: '1001', A: 1, B: 0, C: 0, D: 1, a: 0, b: 0, c: 0, d: 0, e: 1, f: 0, g: 0 },
];

export const SLIDE_METADATA = [
  { id: 1, title: 'Title & Introduction', category: '7-Segment Display' },
  { id: 2, title: 'DISPLAY OPERATIONS', category: '7-Segment Display' },
  { id: 3, title: 'Seven Segment Structure', category: '7-Segment Display' },
  { id: 4, title: 'Common Anode & Common Cathode Circuits', category: '7-Segment Display' },
  { id: 5, title: 'Connected with BCD Decoder', category: '7-Segment Display' },
  { id: 6, title: 'Truth Tables (CC & CA)', category: '7-Segment Display' },
  { id: 7, title: 'CIRCUIT OVERVIEW', category: '7-Segment Display' },
  { id: 8, title: 'SELECT INTERFACE', category: '7-Segment Display' },
  { id: 9, title: 'Advantages & Limitations', category: '7-Segment Display' },
  { id: 10, title: 'DISPLAY READING', category: '14-Segment Display' },
  { id: 11, title: 'SEGMENT POSITION AND USAGE', category: '14-Segment Display' },
  { id: 12, title: 'ACTIVE 14 SEGMENT ENCODER', category: '14-Segment Display' },
  { id: 13, title: 'DOT MATRIX LED DISPLAY', category: 'Dot Matrix Display' },
  { id: 14, title: '14-SEGMENT LED CIRCUIT', category: '14-Segment Display' },
  { id: 15, title: 'COMMON ANODE & COMMON CATHODE', category: '14-Segment Display' },
  { id: 16, title: 'CHARACTER GENERATION', category: '14-Segment Display' },
  { id: 17, title: '14-SEGMENT VS 7-SEGMENT', category: '14-Segment Display' },
  { id: 18, title: 'MULTIPLEXING', category: '14-Segment Display' },
  { id: 19, title: 'APPLICATIONS', category: '14-Segment Display' },
  { id: 20, title: 'ADVANTAGES & LIMITATIONS', category: '14-Segment Display' },
  { id: 21, title: 'CONCLUSION', category: 'Summary' },
];

export const APPLICATION_DETAILS: Record<ApplicationType, { title: string; readout: string; description: string; points: string[] }> = {
  clock: {
    title: 'Digital Clocks & Timers',
    readout: '12:45',
    description: 'High-contrast 4-digit or 6-digit displays showing hours, minutes, and seconds with blinking colon separators.',
    points: [
      'Direct sunlight readability with colored optical filters',
      'Low refresh latency driven by microcontroller RTC interrupts',
      'Wide operating temperature range (-40°C to +85°C)',
    ],
  },
  counter: {
    title: 'Industrial Event & Tally Counters',
    readout: '0042',
    description: 'Rugged counting indicators deployed on manufacturing conveyor belts, packaging machinery, and toll booths.',
    points: [
      'Noise-immune optocoupler isolated drive lines',
      'High noise tolerance in harsh industrial environments',
      'Instantaneous response up to tens of kHz counting pulses',
    ],
  },
  calculator: {
    title: 'Electronic Desk Calculators',
    readout: '123',
    description: 'Classic numerical math indicators displaying arithmetic registers, decimal points, and sign flags.',
    points: [
      'Multiplexed bus architecture minimizes pin count',
      'Low power draw when driven with pulsed scanning',
      'Integrated decimal point (DP) per digit block',
    ],
  },
  meter: {
    title: 'Digital Panel Meters & Multimeters',
    readout: '230 V',
    description: 'Precision voltage, current, and resistance readouts in laboratory multimeters and utility mains equipment.',
    points: [
      '3½ digit and 4½ digit standard precision formats',
      'High optical contrast prevents parallax angle errors',
      'Direct compatibility with ADC driver ICs (e.g. ICL7107)',
    ],
  },
  instruments: {
    title: 'Laboratory Test Instruments',
    readout: '99.8 MHz',
    description: 'Front-panel numeric displays for RF frequency counters, signal generators, and bench power supplies.',
    points: [
      'High electromagnetic immunity near RF equipment',
      'Zero display lag during rapid parameter sweeps',
      'Distinct red and green wavelength channel separation',
    ],
  },
};

// ============================================================================
// 16-SEGMENT LED DISPLAY EXTENSIONS
// ============================================================================

export const SIXTEEN_SEGMENT_METADATA: { id: SixteenSegmentId; name: string; position: string; usedIn: string }[] = [
  { id: 'a', name: 'Top Horizontal', position: 'Top outer horizontal bar', usedIn: 'A, B, C, D, E, F, 0, 2, 3, 5, 7, 8, 9' },
  { id: 'b', name: 'Upper-right Vertical', position: 'Top-right outer stroke', usedIn: 'A, B, D, 0, 1, 2, 3, 4, 7, 8, 9' },
  { id: 'c', name: 'Lower-right Vertical', position: 'Bottom-right outer stroke', usedIn: 'A, B, D, 0, 1, 3, 4, 5, 6, 7, 8, 9' },
  { id: 'd', name: 'Bottom Horizontal', position: 'Bottom outer horizontal bar', usedIn: 'B, C, D, E, 0, 2, 3, 5, 6, 8, 9' },
  { id: 'e', name: 'Lower-left Vertical', position: 'Bottom-left outer stroke', usedIn: 'A, B, C, D, E, F, 0, 2, 6, 8' },
  { id: 'f', name: 'Upper-left Vertical', position: 'Top-left outer stroke', usedIn: 'A, B, C, D, E, F, 0, 4, 5, 6, 8, 9' },
  { id: 'g1', name: 'Middle-left Horizontal', position: 'Center crossbar (left half)', usedIn: 'A, B, E, F, 2, 3, 4, 5, 6, 8, 9' },
  { id: 'g2', name: 'Middle-right Horizontal', position: 'Center crossbar (right half)', usedIn: 'A, B, E, F, 2, 3, 4, 5, 6, 8, 9' },
  { id: 'h', name: 'Top-left Diagonal', position: 'Diagonal from top-left to center', usedIn: 'M, N, K, X, *' },
  { id: 'i', name: 'Top-center Vertical', position: 'Vertical center bar (upper half)', usedIn: 'T, I, +, *' },
  { id: 'j', name: 'Top-right Diagonal', position: 'Diagonal from top-right to center', usedIn: 'M, K, X, Z, *' },
  { id: 'k', name: 'Bottom-left Diagonal', position: 'Diagonal from bottom-left to center', usedIn: 'K, X, Z, *' },
  { id: 'l', name: 'Bottom-center Vertical', position: 'Vertical center bar (lower half)', usedIn: 'T, I, +, *' },
  { id: 'm', name: 'Bottom-right Diagonal', position: 'Diagonal from bottom-right to center', usedIn: 'K, N, R, X, *' },
];

export const FOURTEEN_SEGMENT_METADATA = SIXTEEN_SEGMENT_METADATA;

export const SIXTEEN_CHAR_SEGMENTS: Record<string, SixteenSegmentId[]> = {
  'A': ['a', 'b', 'c', 'e', 'f', 'g1', 'g2'],
  'B': ['a', 'b', 'c', 'd', 'e', 'f', 'g1', 'g2'],
  'C': ['a', 'd', 'e', 'f'],
  'D': ['a', 'b', 'c', 'd', 'e', 'f'],
  'E': ['a', 'd', 'e', 'f', 'g1', 'g2'],
  'F': ['a', 'e', 'f', 'g1', 'g2'],
  '0': ['a', 'b', 'c', 'd', 'e', 'f', 'j', 'k'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g1', 'g2', 'e', 'd'],
  '3': ['a', 'b', 'c', 'd', 'g1', 'g2'],
  '4': ['f', 'g1', 'g2', 'b', 'c'],
  '5': ['a', 'f', 'g1', 'g2', 'c', 'd'],
  '6': ['a', 'c', 'd', 'e', 'f', 'g1', 'g2'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g1', 'g2'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g1', 'g2'],
  'G': ['a', 'c', 'd', 'e', 'f', 'g2'],
  'H': ['b', 'c', 'e', 'f', 'g1', 'g2'],
  'I': ['a', 'd', 'i', 'l'],
  'J': ['b', 'c', 'd', 'e'],
  'K': ['e', 'f', 'g1', 'j', 'm'],
  'L': ['d', 'e', 'f'],
  'M': ['b', 'c', 'e', 'f', 'h', 'j'],
  'N': ['b', 'c', 'e', 'f', 'h', 'm'],
  'O': ['a', 'b', 'c', 'd', 'e', 'f'],
  'P': ['a', 'b', 'e', 'f', 'g1', 'g2'],
  'R': ['a', 'b', 'e', 'f', 'g1', 'g2', 'm'],
  'S': ['a', 'c', 'd', 'f', 'g1', 'g2'],
  'T': ['a', 'i', 'l'],
  'U': ['b', 'c', 'd', 'e', 'f'],
  'V': ['e', 'f', 'k', 'j'],
  'W': ['b', 'c', 'e', 'f', 'k', 'm'],
  'X': ['h', 'j', 'k', 'm'],
  'Y': ['b', 'f', 'g1', 'g2', 'l'],
  'Z': ['a', 'd', 'j', 'k'],
  '+': ['g1', 'g2', 'i', 'l'],
  '-': ['g1', 'g2'],
  '*': ['g1', 'g2', 'i', 'l', 'h', 'j', 'k', 'm'],
};

export const FOURTEEN_CHAR_SEGMENTS = SIXTEEN_CHAR_SEGMENTS;

export const SIXTEEN_APPLICATIONS: Record<
  SixteenApplicationType,
  { title: string; readout: string; description: string; points: string[] }
> = {
  clocks: {
    title: 'Alphanumeric Clocks & World Timers',
    readout: 'MON 12:45',
    description: 'Displays 3-letter day abbreviations (MON, TUE, WED) alongside standard numerical clock readings.',
    points: [
      'Crisp rendering of diagonal letter strokes (M, W, N)',
      'Clear daylight visibility in executive and aviation clocks',
      'Dual color filtering for time and day separation',
    ],
  },
  counters: {
    title: 'Industrial Process & Batch Counters',
    readout: 'RUN 0450',
    description: 'Displays status words (RUN, STOP, FAIL, ERR) directly alongside product batch counts.',
    points: [
      'Eliminates separate status indicator lamps',
      'Instant operator comprehension on factory shop floors',
      'Wide optical angle viewable from across factory cells',
    ],
  },
  calculators: {
    title: 'Scientific Calculators & Financial Terminals',
    readout: 'SIN 45.0',
    description: 'Presents trigonometric functions (SIN, COS, TAN, LOG) and memory registers directly.',
    points: [
      'Legible math variable labeling (X, Y, Z, RAD, DEG)',
      'High-speed multiplexed scanning minimizes microcontroller pin count',
      'Low power dynamic drive mode with pulsed LEDs',
    ],
  },
  instruments: {
    title: 'Laboratory Telemetry & Spectrum Analyzers',
    readout: 'FREQ 100M',
    description: 'Displays engineering unit prefixes (k, M, G, u, n) and instrument mode annunciators.',
    points: [
      'High electromagnetic interference (EMI) immunity',
      'Zero phosphor burn-in compared to cathode ray tubes',
      'Reliable operation under vibration and thermal variations',
    ],
  },
  panels: {
    title: 'Avionics & Automotive Dashboard Panels',
    readout: 'GEAR PARK',
    description: 'Mission-critical vehicle gear positions (PRNDL), altitude alerts, and diagnostic trouble codes.',
    points: [
      'High luminance exceeds 500 nits for direct sun resistance',
      'Instantaneous response at -40°C where LCD response slows',
      'AEC-Q102 automotive grade reliability standards',
    ],
  },
  indicators: {
    title: 'FREE',
    readout: 'FREE',
    description: 'Clear alphanumeric LED indication for open-source and free status readouts in modern embedded interfaces.',
    points: [
      'High-contrast open status indicator',
      'Fast optical response with zero latency or smear',
      'Segment grouping provides high visual clarity on dark stages',
    ],
  },
};

export const FOURTEEN_APPLICATIONS = SIXTEEN_APPLICATIONS;

