import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ApplicationType, CircuitConfig, EvaluationTab, PresentationState, SegmentId, SixteenSegmentId, SixteenApplicationType } from '../types';
import { DIGIT_SEGMENTS } from '../constants';
import {
  createFourteenSegmentDisplay,
  createFourteenCircuitSystem,
  createFourteenVsSevenComparisonSystem,
  createFourteenMultiplexSystem,
  createFourteenApplicationsSystem,
  createDotMatrixDisplaySystem,
} from './ThreeFourteenSegmentEngine';

export interface Presentation3DScene {
  updateState: (state: PresentationState) => void;
  triggerTitleAnimation: () => void;
  highlightSegmentIn3D: (segId: SegmentId | null) => void;
  highlightFourteenSegmentIn3D?: (segId: SixteenSegmentId | null) => void;
  setExploded: (exploded: boolean) => void;
  dispose: () => void;
}

export function initPresentationScene(canvas: HTMLCanvasElement): Presentation3DScene {
  const isSoftwareGl = (() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  })();

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02050c);
  scene.fog = new THREE.FogExp2(0x02050c, 0.035);

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    50
  );
  camera.position.set(0, 0.25, 4.3);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 2. Studio Environment Reflection via RoomEnvironment
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();

  // 3. OrbitControls (Smooth, bounded)
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.2;
  controls.maxDistance = 7.5;
  controls.minPolarAngle = Math.PI * 0.2;
  controls.maxPolarAngle = Math.PI * 0.65;
  controls.target.set(0, 0.05, 0);

  // 4. Lighting Rig
  const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.2);
  keyLight.position.set(3.5, 4.5, 4);
  keyLight.castShadow = !isSoftwareGl;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x02050c, 0.9);
  scene.add(hemiLight);

  const rimLight = new THREE.DirectionalLight(0x0ea5e9, 1.5);
  rimLight.position.set(-3.5, 2.5, 2.5);
  scene.add(rimLight);

  const ledPointLight = new THREE.PointLight(0xff2222, 3.2, 5.5);
  ledPointLight.position.set(0, 0, 0.8);
  scene.add(ledPointLight);

  // 5. Procedural PCB Background Surface
  const pcbGroup = createProceduralPcb(renderer);
  scene.add(pcbGroup);

  // 6. Floating Background Digits
  const floatingDigits = createFloatingDigits();
  scene.add(floatingDigits.group);

  // 7. Ambient Floating Dust Particles
  const ambientParticles = createAmbientDust();
  scene.add(ambientParticles.mesh);

  // ==========================================================
  // 8. 3D MODELS SYSTEM (Centered, Reduced Scale, Zero Overlap)
  // ==========================================================
  const mainDisplay = createSevenSegmentDisplay();
  scene.add(mainDisplay.group);

  // Slide 4: Interactive CA / CC Circuit (Merged with 7 branches)
  const circuitDemo = createInteractiveCircuitSystem();
  scene.add(circuitDemo.group);

  // Slide 5: BCD Decoder System (Both IC and 7-Segment Display visible in frame)
  const bcdSystem = createBcdDecoderSystem();
  scene.add(bcdSystem.group);

  // Slide 7: Single-Digit vs Multi-Digit (No overlap!)
  const multiDigitSystem = createMultiDigitDisplaySystem();
  scene.add(multiDigitSystem.group);

  // Slide 8: Interactive Single-Model Applications Gallery
  const appGallery = createInteractiveApplicationGallery();
  scene.add(appGallery.group);

  // 16-Segment Display Systems
  const fourteenDisplay = createFourteenSegmentDisplay();
  scene.add(fourteenDisplay.group);

  const fourteenCircuit = createFourteenCircuitSystem();
  scene.add(fourteenCircuit.group);

  const comparisonSystem = createFourteenVsSevenComparisonSystem();
  scene.add(comparisonSystem.group);

  const fourteenMultiplex = createFourteenMultiplexSystem();
  scene.add(fourteenMultiplex.group);

  const fourteenAppGallery = createFourteenApplicationsSystem();
  scene.add(fourteenAppGallery.group);

  // Slide 13: Dot Matrix Display System
  const dotMatrixSystem = createDotMatrixDisplaySystem();
  scene.add(dotMatrixSystem.group);

  // ==========================================================
  // Centralized State & Camera Transitions (21 Slides)
  // ==========================================================
  let currentState: PresentationState = {
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
  };

  const camCurrent = new THREE.Vector3().copy(camera.position);
  const camTarget = new THREE.Vector3(0, 0.25, 4.3);
  const lookCurrent = new THREE.Vector3().copy(controls.target);
  const lookTarget = new THREE.Vector3(0, 0.05, 0);
  let isTransitioning = false;
  let transitionProgress = 0;

  controls.addEventListener('start', () => {
    isTransitioning = false;
  });

  // Slide Camera Choreography (Optimized viewing distances for 21 slides)
  const SLIDE_CAMERAS: Record<number, { pos: [number, number, number]; target: [number, number, number] }> = {
    1: { pos: [0, 0.25, 4.3], target: [0, 0.05, 0] }, // Slide 1: Title
    2: { pos: [0, 0.15, 3.6], target: [0, 0.05, 0] }, // Slide 2: Display Operations
    3: { pos: [0, 0.04, 3.1], target: [0, 0.02, 0] }, // Slide 3: Structure
    4: { pos: [0, 0.05, 3.2], target: [0, 0.05, 0] }, // Slide 4: CA / CC
    5: { pos: [0, 0.1, 4.0], target: [0, 0, 0] },     // Slide 5: BCD Decoder
    6: { pos: [0, 0.15, 3.6], target: [0, 0.05, 0] }, // Slide 6: Truth Table
    7: { pos: [0, 0.05, 3.8], target: [0, 0.02, 0] }, // Slide 7: Circuit Overview (Decreased scale)
    8: { pos: [0, 0.1, 3.2], target: [0, 0, 0] },     // Slide 8: Select Interface
    9: { pos: [0, 0.15, 3.7], target: [0, 0, 0] },    // Slide 9: Advantages / Limitations
    10: { pos: [0, 0.15, 3.6], target: [0, 0.05, 0] }, // Slide 10: Display Reading (16-Segment)
    11: { pos: [0, 0.08, 3.6], target: [0, 0.02, 0] }, // Slide 11: Segment Position and Usage
    12: { pos: [0, 0.12, 3.3], target: [0, 0.05, 0] }, // Slide 12: Active 16 Segment Encoder
    13: { pos: [0, 0.1, 3.5], target: [0, 0, 0] },     // Slide 13: Dot Matrix LED Display (New)
    14: { pos: [0, 0.1, 4.0], target: [0, 0, 0] },     // Slide 14: 16-Segment LED Circuit (Decreased scale)
    15: { pos: [0, 0.1, 3.8], target: [0, 0, 0] },     // Slide 15: Common Anode & Cathode (Decreased scale)
    16: { pos: [0, 0.12, 3.5], target: [0, 0.05, 0] }, // Slide 16: Character Generation (Decreased scale)
    17: { pos: [0, 0.1, 4.2], target: [0, 0, 0] },     // Slide 17: 16-Segment vs 7-Segment (Decreased scale)
    18: { pos: [0, 0.1, 4.2], target: [0, 0, 0] },     // Slide 18: Multiplexing (Decreased scale)
    19: { pos: [0, 0.1, 3.6], target: [0, 0, 0] },     // Slide 19: Applications (Decreased scale)
    20: { pos: [0, 0.15, 3.7], target: [0, 0, 0] },    // Slide 20: Advantages & Limitations
    21: { pos: [0, 0.25, 4.3], target: [0, 0.05, 0] }, // Slide 21: Conclusion (THANK YOU)
  };

  // Title opening animation state
  let isTitleSequenceRunning = false;
  let titleSequenceStep = 0;
  let titleSequenceTimer = 0;

  function triggerTitleAnimation() {
    isTitleSequenceRunning = true;
    titleSequenceStep = 0;
    titleSequenceTimer = 0;
    mainDisplay.setAllSegments(false);
  }

  let slide2Timer = 0;
  let slide2Digit = 0;
  let slide3Timer = 0;
  let slide3SegIndex = 0;
  let isSlide3AutoCycleActive = true;

  function updateState(newState: PresentationState) {
    const prevSlide = currentState.currentSlide;
    currentState = { ...newState };

    // Reset visibility of standard 7-segment models
    mainDisplay.group.visible = false;
    circuitDemo.group.visible = false;
    bcdSystem.group.visible = false;
    multiDigitSystem.group.visible = false;
    appGallery.group.visible = false;

    // Reset visibility of 16-segment models
    fourteenDisplay.group.visible = false;
    fourteenCircuit.group.visible = false;
    comparisonSystem.group.visible = false;
    fourteenMultiplex.group.visible = false;
    fourteenAppGallery.group.visible = false;
    dotMatrixSystem.group.visible = false;

    // Reset exploded state on non-anatomy slides
    if (currentState.currentSlide !== 3) {
      mainDisplay.setExploded(0);
      mainDisplay.setLabelsVisible(false);
    }
    if (currentState.currentSlide !== 11) {
      fourteenDisplay.setExploded(0);
      fourteenDisplay.setLabelsVisible(false);
    }

    // Set camera target
    const camCfg = SLIDE_CAMERAS[currentState.currentSlide] || SLIDE_CAMERAS[1];
    camTarget.set(...camCfg.pos);
    lookTarget.set(...camCfg.target);
    transitionProgress = 0;
    isTransitioning = true;

    // Slide-specific routing
    switch (currentState.currentSlide) {
      case 1:
        // Slide 1: Title
        mainDisplay.group.visible = true;
        mainDisplay.group.position.set(0, 0, 0);
        mainDisplay.group.scale.set(1, 1, 1);
        if (prevSlide !== 1) {
          triggerTitleAnimation();
        }
        break;

      case 2:
        // Slide 2: Display Operations
        mainDisplay.group.visible = true;
        mainDisplay.group.position.set(0, 0, 0);
        mainDisplay.group.scale.set(1, 1, 1);
        mainDisplay.setLabelsVisible(true);
        slide2Timer = 0;
        slide2Digit = 0;
        mainDisplay.setDigit(0, false);
        break;

      case 3:
        // Slide 3: Exploded Structure
        mainDisplay.group.visible = true;
        mainDisplay.group.position.set(0, 0, 0);
        mainDisplay.group.scale.set(0.86, 0.86, 0.86);
        mainDisplay.setLabelsVisible(true);
        mainDisplay.setExploded(0.38);
        if (prevSlide !== 3) {
          isSlide3AutoCycleActive = true;
          slide3Timer = 0;
          slide3SegIndex = 0;
        }
        if (currentState.selectedSegment) {
          isSlide3AutoCycleActive = false;
          mainDisplay.highlightSegment(currentState.selectedSegment);
        }
        break;

      case 4:
        // Slide 4: Common Anode & Common Cathode Circuit
        circuitDemo.group.visible = true;
        circuitDemo.group.position.set(0, 0, 0);
        circuitDemo.group.scale.set(0.88, 0.88, 0.88);
        circuitDemo.setConfig(currentState.circuitMode);
        break;

      case 5:
        // Slide 5: BCD Decoder
        bcdSystem.group.visible = true;
        bcdSystem.group.position.set(0, 0, 0);
        bcdSystem.setDigit(currentState.selectedDigit);
        break;

      case 6:
        // Slide 6: Truth Tables
        mainDisplay.group.visible = true;
        mainDisplay.group.position.set(0, 0, 0);
        mainDisplay.group.scale.set(1, 1, 1);
        mainDisplay.setDigit(currentState.selectedDigit, true);
        break;

      case 7:
        // Slide 7: Circuit Overview (Further decreased size, zero overlap)
        mainDisplay.group.visible = true;
        mainDisplay.group.position.set(-0.68, 0, 0);
        mainDisplay.group.scale.set(0.44, 0.44, 0.44);
        mainDisplay.setDigit(7, true);

        multiDigitSystem.group.visible = true;
        multiDigitSystem.group.position.set(0.68, 0, 0);
        multiDigitSystem.group.scale.set(0.46, 0.46, 0.46);
        break;

      case 8:
        // Slide 8: Select Interface
        appGallery.group.visible = true;
        appGallery.group.position.set(0, 0, 0);
        appGallery.setApplication(currentState.selectedApp);
        break;

      case 9:
        // Slide 9: Advantages & Limitations
        mainDisplay.group.visible = true;
        mainDisplay.group.position.set(0, 0, 0);
        mainDisplay.group.scale.set(1, 1, 1);
        mainDisplay.setDigit(8, true);
        break;

      case 10:
        // Slide 10: Display Reading (16-Segment)
        fourteenDisplay.group.visible = true;
        fourteenDisplay.group.position.set(0, 0, 0);
        fourteenDisplay.group.scale.set(1, 1, 1);
        fourteenDisplay.setCharacter('A');
        fourteenDisplay.setLabelsVisible(false);
        fourteenDisplay.setExploded(0);
        break;

      case 11:
        // Slide 11: Segment Position and Usage (Decreased scale so 3D model & labels fit completely in viewport)
        fourteenDisplay.group.visible = true;
        fourteenDisplay.group.position.set(0, 0, 0);
        fourteenDisplay.group.scale.set(0.68, 0.68, 0.68);
        fourteenDisplay.setLabelsVisible(true);
        fourteenDisplay.setExploded(0.72);
        fourteenDisplay.highlightSegment(currentState.sixteenSelectedSegment || currentState.fourteenSelectedSegment);
        break;

      case 12:
        // Slide 12: Active 16 Segment Encoder (A-F)
        fourteenDisplay.group.visible = true;
        fourteenDisplay.group.position.set(0, 0, 0);
        fourteenDisplay.group.scale.set(1, 1, 1);
        fourteenDisplay.setLabelsVisible(false);
        fourteenDisplay.setExploded(0);
        fourteenDisplay.setCharacter(currentState.sixteenChar || currentState.fourteenChar || 'A');
        break;

      case 13:
        // Slide 13: Dot Matrix LED Display (NEW SLIDE)
        dotMatrixSystem.group.visible = true;
        dotMatrixSystem.group.position.set(0, 0, 0);
        dotMatrixSystem.group.scale.set(0.88, 0.88, 0.88);
        dotMatrixSystem.setPattern(currentState.dotMatrixPattern || 'A');
        break;

      case 14:
        // Slide 14: 16-Segment LED Circuit (Decreased size)
        fourteenCircuit.group.visible = true;
        fourteenCircuit.group.position.set(0, 0, 0);
        fourteenCircuit.group.scale.set(0.72, 0.72, 0.72);
        fourteenCircuit.setConfig('CC');
        break;

      case 15:
        // Slide 15: Common Anode & Common Cathode Interactive (Decreased size)
        fourteenCircuit.group.visible = true;
        fourteenCircuit.group.position.set(0, 0, 0);
        fourteenCircuit.group.scale.set(0.72, 0.72, 0.72);
        fourteenCircuit.setConfig(currentState.sixteenCircuitMode || currentState.fourteenCircuitMode || 'CA');
        break;

      case 16:
        // Slide 16: Character Generation 0-9, A-F (Decreased size)
        fourteenDisplay.group.visible = true;
        fourteenDisplay.group.position.set(0, 0, 0);
        fourteenDisplay.group.scale.set(0.85, 0.85, 0.85);
        fourteenDisplay.setLabelsVisible(false);
        fourteenDisplay.setExploded(0);
        fourteenDisplay.setCharacter(currentState.sixteenChar || currentState.fourteenChar || '0');
        break;

      case 17:
        // Slide 17: 16-Segment vs 7-Segment Comparison (Decreased size, 1x 7-seg & 1x 16-seg)
        comparisonSystem.group.visible = true;
        comparisonSystem.group.position.set(0, 0, 0);
        comparisonSystem.setCharacter('A');
        break;

      case 18:
        // Slide 18: Multiplexing ('2 0 2 6') (Decreased size)
        fourteenMultiplex.group.visible = true;
        fourteenMultiplex.group.position.set(0, 0, 0);
        fourteenMultiplex.group.scale.set(0.82, 0.82, 0.82);
        break;

      case 19:
        // Slide 19: Applications ('FREE') (Decreased size)
        fourteenAppGallery.group.visible = true;
        fourteenAppGallery.group.position.set(0, 0, 0);
        fourteenAppGallery.group.scale.set(0.82, 0.82, 0.82);
        fourteenAppGallery.setApplication(currentState.sixteenApp || currentState.fourteenApp || 'clocks');
        break;

      case 20:
        // Slide 20: Advantages & Limitations (Decreased size)
        fourteenDisplay.group.visible = true;
        fourteenDisplay.group.position.set(0, 0, 0);
        fourteenDisplay.group.scale.set(0.88, 0.88, 0.88);
        fourteenDisplay.setCharacter('8');
        break;

      case 21:
        // Slide 21: Conclusion (THANK YOU)
        fourteenDisplay.group.visible = true;
        fourteenDisplay.group.position.set(0, 0, 0);
        fourteenDisplay.group.scale.set(1.15, 1.15, 1.15);
        fourteenDisplay.setCharacter('8');
        break;
    }
  }

  function highlightSegmentIn3D(segId: SegmentId | null) {
    if (currentState.currentSlide === 3) {
      isSlide3AutoCycleActive = false;
    }
    if (segId) {
      mainDisplay.highlightSegment(segId);
    } else {
      if (currentState.currentSlide === 3) {
        mainDisplay.setAllSegments(false);
      } else {
        mainDisplay.setDigit(currentState.selectedDigit, true);
      }
    }
  }

  function highlightFourteenSegmentIn3D(segId: SixteenSegmentId | null) {
    if (segId) {
      fourteenDisplay.highlightSegment(segId);
    } else {
      fourteenDisplay.setCharacter(currentState.sixteenChar || currentState.fourteenChar || 'A');
    }
  }

  function setExploded(exploded: boolean) {
    mainDisplay.setExploded(exploded ? 0.38 : 0);
  }

  // Dynamic Responsive Resize Adaptation (Prevents clipping on any screen resolution!)
  function handleResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    const aspect = w / h;
    camera.aspect = aspect;

    // Dynamically adapt FOV to guarantee 100% complete visibility on mobile, laptop, and desktop
    if (aspect < 0.7) {
      // Narrow mobile vertical view
      camera.fov = 66;
    } else if (aspect < 0.95) {
      // Mobile / tablet portrait
      camera.fov = 56;
    } else if (aspect < 1.35) {
      // Laptop / split-screen
      camera.fov = 48;
    } else {
      // Standard desktop
      camera.fov = 42;
    }

    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(canvas);

  triggerTitleAnimation();

  const clock = new THREE.Clock();
  let frameId = 0;
  let isDisposed = false;

  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (isDisposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 80);
      }
    };
    frameId = window.setTimeout(poll, 5);
  }

  function tick() {
    if (isDisposed) return;

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // 1. Smooth Camera Transition
    if (isTransitioning) {
      transitionProgress += delta * 2.4;
      const t = Math.min(transitionProgress, 1.0);
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(camCurrent, camTarget, ease);
      controls.target.lerpVectors(lookCurrent, lookTarget, ease);
      if (t >= 0.999) {
        camera.position.copy(camTarget);
        controls.target.copy(lookTarget);
        isTransitioning = false;
      }
    } else {
      camCurrent.copy(camera.position);
      lookCurrent.copy(controls.target);
    }

    // 2. Slide 1 Opening Sequence Animation: a -> g -> 8
    if (currentState.currentSlide === 1 && isTitleSequenceRunning) {
      titleSequenceTimer += delta;
      const seqOrder: SegmentId[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      if (titleSequenceTimer > 0.45 && titleSequenceStep < seqOrder.length) {
        titleSequenceTimer = 0;
        mainDisplay.setSegmentState(seqOrder[titleSequenceStep], true);
        titleSequenceStep++;
      } else if (titleSequenceStep >= seqOrder.length) {
        mainDisplay.setDigit(8, true);
        isTitleSequenceRunning = false;
      }
    }

    // 3. Slide 2: Slow digit cycle (0 -> 1 -> ... -> 9)
    if (currentState.currentSlide === 2) {
      slide2Timer += delta;
      if (slide2Timer > 1.8) {
        slide2Timer = 0;
        slide2Digit = (slide2Digit + 1) % 10;
        mainDisplay.setDigit(slide2Digit, false);
      }
    }

    // 4. Slide 3: Segment sequence explosion animation (stops automatically when user clicks a segment)
    if (currentState.currentSlide === 3 && isSlide3AutoCycleActive && !currentState.selectedSegment) {
      slide3Timer += delta;
      const segs: SegmentId[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      if (slide3Timer > 1.6) {
        slide3Timer = 0;
        slide3SegIndex = (slide3SegIndex + 1) % segs.length;
        mainDisplay.highlightSegment(segs[slide3SegIndex]);
      }
    }

    // 5. Slide 21: Slow cinematic orbit around glowing 16-segment display on conclusion
    if (currentState.currentSlide === 21) {
      const radius = 4.3;
      const speed = 0.2;
      camera.position.x = Math.sin(time * speed) * radius * 0.65;
      camera.position.z = Math.cos(time * speed) * radius;
      camera.position.y = 0.3 + Math.sin(time * speed * 0.5) * 0.12;
      controls.target.set(0, 0.05, 0);
    }

    // 6. Update Circuit & Current particles
    if (circuitDemo.group.visible) {
      circuitDemo.update(time, delta);
    }

    // 7. Update BCD Decoder signal pulses
    if (bcdSystem.group.visible) {
      bcdSystem.update(time);
    }

    // 8. Update Multi-digit multiplexing strobe
    if (multiDigitSystem.group.visible) {
      multiDigitSystem.update(time);
    }

    // 9. Update Applications gallery
    if (appGallery.group.visible) {
      appGallery.update(time);
    }

    // 10. Update 16-Segment Display Systems & Dot Matrix
    if (fourteenDisplay.group.visible) {
      fourteenDisplay.update(time, delta);
    }
    if (fourteenCircuit.group.visible) {
      fourteenCircuit.update(time, delta);
    }
    if (comparisonSystem.group.visible) {
      comparisonSystem.update(time);
    }
    if (fourteenMultiplex.group.visible) {
      fourteenMultiplex.update(time);
    }
    if (fourteenAppGallery.group.visible) {
      fourteenAppGallery.update(time);
    }
    if (dotMatrixSystem.group.visible) {
      dotMatrixSystem.update(time);
    }

    floatingDigits.update(time);
    ambientParticles.update(time);

    controls.update();
    renderer.render(scene, camera);

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }
  }

  frameId = requestAnimationFrame(tick);

  function dispose() {
    isDisposed = true;
    cancelAnimationFrame(frameId);
    clearTimeout(frameId);
    resizeObserver.disconnect();
    controls.dispose();
    mainDisplay.dispose();
    circuitDemo.dispose();
    bcdSystem.dispose();
    appGallery.dispose();
    fourteenDisplay.dispose();
    fourteenCircuit.dispose();
    comparisonSystem.dispose();
    fourteenMultiplex.dispose();
    fourteenAppGallery.dispose();
    dotMatrixSystem.dispose();
    renderer.dispose();
  }

  return {
    updateState,
    triggerTitleAnimation,
    highlightSegmentIn3D,
    highlightFourteenSegmentIn3D,
    setExploded,
    dispose,
  };
}

// =========================================================================
// 1. PROCEDURAL 3D SEVEN-SEGMENT DISPLAY (Solid Chamfered Prisms)
// =========================================================================
interface SevenSegmentModel {
  group: THREE.Group;
  segments: Map<SegmentId, THREE.Mesh>;
  materials: Map<SegmentId, THREE.MeshStandardMaterial>;
  labels: Map<SegmentId, THREE.Mesh>;
  setDigit: (digit: number | null, showDp?: boolean) => void;
  setSegmentState: (id: SegmentId, active: boolean) => void;
  setAllSegments: (active: boolean) => void;
  highlightSegment: (id: SegmentId) => void;
  setLabelsVisible: (visible: boolean) => void;
  setExploded: (progress: number) => void;
  dispose: () => void;
}

function createSevenSegmentDisplay(): SevenSegmentModel {
  const group = new THREE.Group();
  group.name = 'SevenSegmentDisplay';

  const segments = new Map<SegmentId, THREE.Mesh>();
  const materials = new Map<SegmentId, THREE.MeshStandardMaterial>();
  const labels = new Map<SegmentId, THREE.Mesh>();

  const pkgW = 2.4;
  const pkgH = 3.4;
  const pkgD = 0.52;
  const slant = 0.088;

  const bodyShape = new THREE.Shape();
  const hw = pkgW / 2;
  const hh = pkgH / 2;
  const cr = 0.12;
  bodyShape.moveTo(-hw + cr, -hh);
  bodyShape.lineTo(hw - cr, -hh);
  bodyShape.quadraticCurveTo(hw, -hh, hw, -hh + cr);
  bodyShape.lineTo(hw, hh - cr);
  bodyShape.quadraticCurveTo(hw, hh, hw - cr, hh);
  bodyShape.lineTo(-hw + cr, hh);
  bodyShape.quadraticCurveTo(-hw, hh, -hw, hh - cr);
  bodyShape.lineTo(-hw, -hh + cr);
  bodyShape.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);

  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: pkgD,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.035,
    bevelThickness: 0.035,
  });
  bodyGeo.center();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x070b14,
    roughness: 0.65,
    metalness: 0.2,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.z = -pkgD / 2;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  const faceGeo = new THREE.BoxGeometry(pkgW - 0.22, pkgH - 0.24, 0.03);
  const faceMat = new THREE.MeshStandardMaterial({ color: 0x0c111e, roughness: 0.7, metalness: 0.25 });
  const faceMesh = new THREE.Mesh(faceGeo, faceMat);
  faceMesh.position.set(0, 0, 0.02);
  group.add(faceMesh);

  const pinMat = new THREE.MeshStandardMaterial({ color: 0xd8dde8, metalness: 0.95, roughness: 0.2 });
  const pinGeo = new THREE.BoxGeometry(0.04, 0.38, 0.025);
  for (let i = 0; i < 5; i++) {
    const x = -0.7 + i * 0.35;
    const pt = new THREE.Mesh(pinGeo, pinMat);
    pt.position.set(x, hh + 0.15, -pkgD / 2);
    group.add(pt);
    const pb = new THREE.Mesh(pinGeo, pinMat);
    pb.position.set(x, -hh - 0.15, -pkgD / 2);
    group.add(pb);
  }

  function createHGeometry(len: number, w: number) {
    const s = new THREE.Shape();
    const hl = len / 2;
    const hw = w / 2;
    const tip = w * 0.75;
    s.moveTo(-hl + tip, hw);
    s.lineTo(hl - tip, hw);
    s.lineTo(hl, 0);
    s.lineTo(hl - tip, -hw);
    s.lineTo(-hl + tip, -hw);
    s.lineTo(-hl, 0);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.015, bevelThickness: 0.02 });
    geo.center();
    return geo;
  }

  function createVGeometry(len: number, w: number) {
    const s = new THREE.Shape();
    const hl = len / 2;
    const hw = w / 2;
    const tip = w * 0.75;
    s.moveTo(-hw, -hl + tip);
    s.lineTo(0, -hl);
    s.lineTo(hw, -hl + tip);
    s.lineTo(hw, hl - tip);
    s.lineTo(0, hl);
    s.lineTo(-hw, hl - tip);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.015, bevelThickness: 0.02 });
    geo.center();
    return geo;
  }

  const segW = 0.20;
  const segH = 0.76;
  const segV = 0.82;
  const spX = 0.48;
  const spY = 0.52;

  const hGeo = createHGeometry(segH, segW);
  const vGeo = createVGeometry(segV, segW);
  const dpGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.07, 16);
  dpGeo.rotateX(Math.PI / 2);

  const segmentDefs: { id: SegmentId; geo: THREE.BufferGeometry; x: number; y: number; explodeDir: [number, number, number] }[] = [
    { id: 'a', geo: hGeo, x: 0, y: spY * 2, explodeDir: [0, 0.45, 0.25] },
    { id: 'b', geo: vGeo, x: spX, y: spY, explodeDir: [0.4, 0.25, 0.25] },
    { id: 'c', geo: vGeo, x: spX, y: -spY, explodeDir: [0.4, -0.25, 0.25] },
    { id: 'd', geo: hGeo, x: 0, y: -spY * 2, explodeDir: [0, -0.45, 0.25] },
    { id: 'e', geo: vGeo, x: -spX, y: -spY, explodeDir: [-0.4, -0.25, 0.25] },
    { id: 'f', geo: vGeo, x: -spX, y: spY, explodeDir: [-0.4, 0.25, 0.25] },
    { id: 'g', geo: hGeo, x: 0, y: 0, explodeDir: [0, 0, 0.45] },
    { id: 'dp', geo: dpGeo, x: spX + 0.38, y: -spY * 2, explodeDir: [0.35, -0.35, 0.2] },
  ];

  const defaultPositions = new Map<SegmentId, THREE.Vector3>();
  const explodeDirections = new Map<SegmentId, THREE.Vector3>();

  segmentDefs.forEach(({ id, geo, x, y, explodeDir }) => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3d0b0b,
      emissive: 0x000000,
      emissiveIntensity: 0.0,
      roughness: 0.65,
      metalness: 0.1,
    });

    const mesh = new THREE.Mesh(geo, mat);
    const slantedX = x + y * Math.tan(slant);
    mesh.position.set(slantedX, y, 0.07);

    if (id === 'b' || id === 'c' || id === 'e' || id === 'f') {
      mesh.rotation.z = -slant;
    }

    group.add(mesh);
    segments.set(id, mesh);
    materials.set(id, mat);

    defaultPositions.set(id, new THREE.Vector3(slantedX, y, 0.07));
    explodeDirections.set(id, new THREE.Vector3(...explodeDir));

    const labelMesh = create3DTextLabel(id.toUpperCase());
    labelMesh.position.set(
      slantedX + (id === 'b' || id === 'c' ? -0.26 : id === 'e' || id === 'f' ? 0.26 : 0),
      y + (id === 'a' ? -0.22 : id === 'd' ? 0.22 : id === 'g' ? -0.18 : 0),
      0.09
    );
    labelMesh.visible = false;
    group.add(labelMesh);
    labels.set(id, labelMesh);
  });

  function setSegmentState(id: SegmentId, active: boolean, intensity: number = 3.2) {
    const mat = materials.get(id);
    if (!mat) return;
    if (active) {
      mat.color.setHex(0xff2222);
      mat.emissive.setHex(0xff1515);
      mat.emissiveIntensity = intensity;
      mat.roughness = 0.2;
    } else {
      mat.color.setHex(0x350808);
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0.0;
      mat.roughness = 0.65;
    }
  }

  function setAllSegments(active: boolean) {
    (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'] as SegmentId[]).forEach((id) => {
      setSegmentState(id, active);
    });
  }

  function setDigit(digit: number | null, showDp: boolean = false) {
    if (digit === null) {
      setAllSegments(false);
      setSegmentState('dp', showDp);
      return;
    }
    const onSegs = DIGIT_SEGMENTS[digit] || [];
    (['a', 'b', 'c', 'd', 'e', 'f', 'g'] as SegmentId[]).forEach((id) => {
      setSegmentState(id, onSegs.includes(id));
    });
    setSegmentState('dp', showDp);
  }

  function highlightSegment(targetId: SegmentId) {
    (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'] as SegmentId[]).forEach((id) => {
      const lbl = labels.get(id);
      if (id === targetId) {
        setSegmentState(id, true, 3.8);
        if (lbl) {
          lbl.visible = true;
          (lbl.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
        }
      } else {
        setSegmentState(id, false);
        if (lbl) {
          (lbl.material as THREE.MeshBasicMaterial).color.setHex(0x64748b);
        }
      }
    });
  }

  function setLabelsVisible(visible: boolean) {
    labels.forEach((l) => (l.visible = visible));
  }

  function setExploded(progress: number) {
    segmentDefs.forEach(({ id }) => {
      const mesh = segments.get(id);
      const defPos = defaultPositions.get(id);
      const dir = explodeDirections.get(id);
      const lbl = labels.get(id);
      if (mesh && defPos && dir) {
        mesh.position.x = defPos.x + dir.x * progress;
        mesh.position.y = defPos.y + dir.y * progress;
        mesh.position.z = defPos.z + dir.z * progress;
        if (lbl) {
          lbl.position.x = mesh.position.x + (id === 'b' || id === 'c' ? -0.26 : id === 'e' || id === 'f' ? 0.26 : 0);
          lbl.position.y = mesh.position.y + (id === 'a' ? -0.22 : id === 'd' ? 0.22 : id === 'g' ? -0.18 : 0);
          lbl.position.z = mesh.position.z + 0.05;
        }
      }
    });
  }

  function dispose() {
    bodyGeo.dispose();
    bodyMat.dispose();
    faceGeo.dispose();
    faceMat.dispose();
    hGeo.dispose();
    vGeo.dispose();
    dpGeo.dispose();
    pinGeo.dispose();
    pinMat.dispose();
    materials.forEach((m) => m.dispose());
  }

  return {
    group,
    segments,
    materials,
    labels,
    setDigit,
    setSegmentState,
    setAllSegments,
    highlightSegment,
    setLabelsVisible,
    setExploded,
    dispose,
  };
}

function create3DTextLabel(text: string): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 44px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 32, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, depthWrite: false });
  const geo = new THREE.PlaneGeometry(0.22, 0.22);
  return new THREE.Mesh(geo, mat);
}

// =========================================================================
// 2. INTERACTIVE CA / CC CIRCUIT SYSTEM (Slide 4 - Merged, Zoomed In)
// =========================================================================
interface InteractiveCircuitSystem {
  group: THREE.Group;
  setConfig: (config: CircuitConfig) => void;
  update: (time: number, delta: number) => void;
  dispose: () => void;
}

function createInteractiveCircuitSystem(): InteractiveCircuitSystem {
  const group = new THREE.Group();
  group.name = 'InteractiveCircuit';

  let currentConfig: CircuitConfig = 'CC';

  const boardGeo = new THREE.BoxGeometry(2.9, 2.1, 0.08);
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x060c18, roughness: 0.7, metalness: 0.2 });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.z = -0.05;
  board.receiveShadow = true;
  group.add(board);

  const railMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, metalness: 0.95, roughness: 0.2 });
  const topRail = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.05, 0.02), railMat);
  topRail.position.set(0, 0.8, 0.01);
  group.add(topRail);

  const botRail = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.05, 0.02), railMat);
  botRail.position.set(0, -0.8, 0.01);
  group.add(botRail);

  const topLabel = create3DTextLabel('+5V VCC');
  topLabel.scale.set(1.2, 0.5, 1);
  topLabel.position.set(-0.95, 0.92, 0.02);
  group.add(topLabel);

  const botLabel = create3DTextLabel('GND (0V)');
  botLabel.scale.set(1.2, 0.5, 1);
  botLabel.position.set(-0.95, -0.92, 0.02);
  group.add(botLabel);

  // Status Banner on the board
  const bannerCanvas = document.createElement('canvas');
  bannerCanvas.width = 512;
  bannerCanvas.height = 64;
  const bannerCtx = bannerCanvas.getContext('2d')!;
  const bannerTex = new THREE.CanvasTexture(bannerCanvas);
  bannerTex.colorSpace = THREE.SRGBColorSpace;
  const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex, transparent: true });
  const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.28), bannerMat);
  bannerMesh.position.set(0, 1.15, 0.03);
  group.add(bannerMesh);

  function updateBannerText(text: string, color: string) {
    bannerCtx.clearRect(0, 0, 512, 64);
    bannerCtx.fillStyle = 'rgba(6, 11, 24, 0.85)';
    bannerCtx.fillRect(0, 0, 512, 64);
    bannerCtx.strokeStyle = color;
    bannerCtx.lineWidth = 4;
    bannerCtx.strokeRect(2, 2, 508, 60);
    bannerCtx.fillStyle = color;
    bannerCtx.font = 'bold 26px monospace';
    bannerCtx.textAlign = 'center';
    bannerCtx.textBaseline = 'middle';
    bannerCtx.fillText(text, 256, 32);
    bannerTex.needsUpdate = true;
  }

  const branches: {
    diodeMesh: THREE.Mesh;
    diodeMat: THREE.MeshStandardMaterial;
    resistorMesh: THREE.Mesh;
    pulseMesh: THREE.Mesh;
    branchX: number;
  }[] = [];

  const pulseGeo = new THREE.SphereGeometry(0.038, 8, 8);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const diodeGeo = new THREE.ConeGeometry(0.08, 0.20, 10);
  const resGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.28, 10);
  const resMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.5 });

  for (let i = 0; i < 7; i++) {
    const x = -0.9 + i * 0.3;

    const res = new THREE.Mesh(resGeo, resMat);
    res.position.set(x, 0.38, 0.02);
    group.add(res);

    const dMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.2,
      emissive: 0xef2222,
      emissiveIntensity: 1.8,
    });
    const diode = new THREE.Mesh(diodeGeo, dMat);
    diode.position.set(x, -0.12, 0.02);
    group.add(diode);

    const lGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0.8, 0.01),
      new THREE.Vector3(x, -0.8, 0.01),
    ]);
    const lMat = new THREE.LineBasicMaterial({ color: 0x1e3a5f });
    group.add(new THREE.Line(lGeo, lMat));

    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    group.add(pulse);

    const segName = ['a', 'b', 'c', 'd', 'e', 'f', 'g'][i];
    const lbl = create3DTextLabel(segName);
    lbl.scale.set(0.75, 0.75, 0.75);
    lbl.position.set(x, -0.52, 0.02);
    group.add(lbl);

    branches.push({
      diodeMesh: diode,
      diodeMat: dMat,
      resistorMesh: res,
      pulseMesh: pulse,
      branchX: x,
    });
  }

  function setConfig(cfg: CircuitConfig) {
    currentConfig = cfg;
    const isCathode = cfg === 'CC';

    const topMat = topLabel.material as THREE.MeshBasicMaterial;
    const botMat = botLabel.material as THREE.MeshBasicMaterial;

    if (isCathode) {
      topMat.color.setHex(0x38bdf8);
      botMat.color.setHex(0x10b981);
      pulseMat.color.setHex(0x38bdf8);
      updateBannerText('COMMON CATHODE (GND)', '#10b981');
      branches.forEach((b) => {
        b.diodeMesh.rotation.z = Math.PI;
      });
    } else {
      topMat.color.setHex(0xf59e0b);
      botMat.color.setHex(0x38bdf8);
      pulseMat.color.setHex(0xf59e0b);
      updateBannerText('COMMON ANODE (+5V VCC)', '#f59e0b');
      branches.forEach((b) => {
        b.diodeMesh.rotation.z = 0;
      });
    }
  }

  setConfig('CC');

  function update(time: number, _delta: number) {
    branches.forEach((b, idx) => {
      const u = ((time * 0.95 + idx * 0.14) % 1 + 1) % 1;
      b.pulseMesh.position.x = b.branchX;
      b.pulseMesh.position.y = 0.8 - u * 1.6;
      b.pulseMesh.position.z = 0.03;
    });
  }

  function dispose() {
    boardGeo.dispose();
    boardMat.dispose();
    railMat.dispose();
    diodeGeo.dispose();
    resGeo.dispose();
    resMat.dispose();
    pulseGeo.dispose();
    pulseMat.dispose();
    bannerTex.dispose();
  }

  return { group, setConfig, update, dispose };
}

// =========================================================================
// 3. BCD DECODER SYSTEM (Slide 5: Both IC and 7-Segment LED Visible!)
// =========================================================================
interface BcdDecoderSystem {
  group: THREE.Group;
  setDigit: (digit: number) => void;
  update: (time: number) => void;
  dispose: () => void;
}

function createBcdDecoderSystem(): BcdDecoderSystem {
  const group = new THREE.Group();
  group.name = 'BcdDecoderSystem';

  // 1. Decoder IC Chip on the LEFT (Positioned at x = -1.15)
  const icGroup = new THREE.Group();
  icGroup.position.set(-1.15, 0, 0);

  const icBodyGeo = new THREE.BoxGeometry(1.4, 0.9, 0.25);
  const icBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f1522, roughness: 0.6, metalness: 0.3 });
  const icBody = new THREE.Mesh(icBodyGeo, icBodyMat);
  icGroup.add(icBody);

  const lblCanvas = document.createElement('canvas');
  lblCanvas.width = 256;
  lblCanvas.height = 128;
  const lCtx = lblCanvas.getContext('2d')!;
  lCtx.fillStyle = '#ffffff';
  lCtx.font = 'bold 32px monospace';
  lCtx.textAlign = 'center';
  lCtx.fillText('SN7447 / 7446', 128, 50);
  lCtx.font = '20px monospace';
  lCtx.fillStyle = '#38bdf8';
  lCtx.fillText('BCD DECODER', 128, 85);

  const lblTex = new THREE.CanvasTexture(lblCanvas);
  lblTex.colorSpace = THREE.SRGBColorSpace;
  const lblMat = new THREE.MeshBasicMaterial({ map: lblTex, transparent: true });
  const lblPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.65), lblMat);
  lblPlane.position.z = 0.135;
  icGroup.add(lblPlane);

  const pinMat = new THREE.MeshStandardMaterial({ color: 0xd0d5e0, metalness: 0.95, roughness: 0.2 });
  const pinGeo = new THREE.BoxGeometry(0.04, 0.15, 0.02);
  for (let i = 0; i < 8; i++) {
    const x = -0.52 + i * 0.15;
    const pt = new THREE.Mesh(pinGeo, pinMat);
    pt.position.set(x, 0.48, 0);
    icGroup.add(pt);
    const pb = new THREE.Mesh(pinGeo, pinMat);
    pb.position.set(x, -0.48, 0);
    icGroup.add(pb);
  }
  group.add(icGroup);

  // 2. 4 BCD Input Wires (A, B, C, D) leading into IC from far left
  const inputPulses: THREE.Mesh[] = [];
  const pulseGeo = new THREE.SphereGeometry(0.038, 8, 8);
  const inPulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  for (let i = 0; i < 4; i++) {
    const y = 0.32 - i * 0.22;
    const lGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.1, y, 0),
      new THREE.Vector3(-1.85, y, 0),
    ]);
    const lMat = new THREE.LineBasicMaterial({ color: 0x1e3a5f });
    group.add(new THREE.Line(lGeo, lMat));

    const p = new THREE.Mesh(pulseGeo, inPulseMat);
    group.add(p);
    inputPulses.push(p);

    const s = create3DTextLabel(['A', 'B', 'C', 'D'][i]);
    s.position.set(-2.25, y, 0);
    group.add(s);
  }

  // 3. 7 Output Wires (a - g) connecting IC directly to the 7-Segment Display!
  const outputPulses: THREE.Mesh[] = [];
  const outPulseMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  for (let i = 0; i < 7; i++) {
    const yStart = 0.42 - i * 0.14;
    const yEnd = 0.55 - i * 0.18;
    const lGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.45, yStart, 0),
      new THREE.Vector3(0.5, yEnd, 0),
    ]);
    const lMat = new THREE.LineBasicMaterial({ color: 0x5a1818 });
    group.add(new THREE.Line(lGeo, lMat));

    const p = new THREE.Mesh(pulseGeo, outPulseMat);
    group.add(p);
    outputPulses.push(p);
  }

  // 4. Large Seven-Segment LED Display on the RIGHT (Positioned at x = 1.15)
  const displayModel = createSevenSegmentDisplay();
  displayModel.group.scale.set(0.82, 0.82, 0.82);
  displayModel.group.position.set(1.15, 0, 0);
  group.add(displayModel.group);

  function setDigit(d: number) {
    displayModel.setDigit(d, false);
  }

  function update(time: number) {
    inputPulses.forEach((p, idx) => {
      const u = ((time * 0.9 + idx * 0.22) % 1 + 1) % 1;
      p.position.x = -2.1 + u * 0.25;
      p.position.y = 0.32 - idx * 0.22;
    });

    outputPulses.forEach((p, idx) => {
      const u = ((time * 1.3 + idx * 0.14) % 1 + 1) % 1;
      const startY = 0.42 - idx * 0.14;
      const endY = 0.55 - idx * 0.18;
      p.position.x = -0.45 + u * 0.95;
      p.position.y = startY + u * (endY - startY);
    });
  }

  function dispose() {
    displayModel.dispose();
  }

  return { group, setDigit, update, dispose };
}

// =========================================================================
// 4. MULTI-DIGIT 4-DIGIT SYSTEM (Slide 7: Zero Overlap with Single Digit!)
// =========================================================================
interface MultiDigitDisplaySystem {
  group: THREE.Group;
  update: (time: number) => void;
}

function createMultiDigitDisplaySystem(): MultiDigitDisplaySystem {
  const group = new THREE.Group();
  group.name = 'MultiDigitSystem';

  // 4-Digit Block ("2 0 2 6")
  const blockGeo = new THREE.BoxGeometry(2.3, 1.25, 0.35);
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x090e1a, roughness: 0.6, metalness: 0.2 });
  const block = new THREE.Mesh(blockGeo, blockMat);
  group.add(block);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#050914';
  ctx.fillRect(0, 0, 512, 200);

  ctx.fillStyle = '#ff2222';
  ctx.font = 'bold 120px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff2222';
  ctx.shadowBlur = 18;
  ctx.fillText('2 0 2 6', 256, 100);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 1.1), new THREE.MeshBasicMaterial({ map: tex }));
  face.position.z = 0.18;
  group.add(face);

  const strobeIndicators: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const x = -0.75 + i * 0.50;
    const indGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const indMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ind = new THREE.Mesh(indGeo, indMat);
    ind.position.set(x, 0.78, 0);
    group.add(ind);
    strobeIndicators.push(ind);

    const lbl = create3DTextLabel(`D${i + 1}`);
    lbl.scale.set(0.75, 0.75, 0.75);
    lbl.position.set(x, 0.95, 0);
    group.add(lbl);
  }

  function update(time: number) {
    const activeIdx = Math.floor((time * 8) % 4);
    strobeIndicators.forEach((ind, i) => {
      (ind.material as THREE.MeshBasicMaterial).color.setHex(i === activeIdx ? 0xef4444 : 0x1e3a5f);
    });
  }

  return { group, update };
}

// =========================================================================
// 5. INTERACTIVE APPLICATIONS GALLERY (Slide 8: Shows Clicked Model Centered!)
// =========================================================================
interface InteractiveApplicationGallery {
  group: THREE.Group;
  setApplication: (app: ApplicationType) => void;
  update: (time: number) => void;
  dispose: () => void;
}

function createInteractiveApplicationGallery(): InteractiveApplicationGallery {
  const group = new THREE.Group();
  group.name = 'InteractiveAppGallery';

  const models = new Map<ApplicationType, THREE.Group>();

  // 1. Digital Clock ("12:45" with blinking colon!)
  const clockModel = createDedicatedInstrument('12:45', 'DIGITAL CLOCK & TIMER', '#ff2222');
  group.add(clockModel);
  models.set('clock', clockModel);

  // 2. Event Counter ("0042")
  const counterModel = createDedicatedInstrument('0042', 'INDUSTRIAL TALLY COUNTER', '#ef4444');
  group.add(counterModel);
  models.set('counter', counterModel);

  // 3. Calculator ("123")
  const calcModel = createDedicatedInstrument('123', 'ELECTRONIC CALCULATOR', '#ff3333');
  group.add(calcModel);
  models.set('calculator', calcModel);

  // 4. Digital Meter ("230 V")
  const meterModel = createDedicatedInstrument('230 V', 'DIGITAL PANEL METER', '#ff2222');
  group.add(meterModel);
  models.set('meter', meterModel);

  // 5. RF Instruments ("99.8 MHz")
  const instModel = createDedicatedInstrument('99.8 MHz', 'RF FREQUENCY COUNTER', '#ff2222');
  group.add(instModel);
  models.set('instruments', instModel);

  function setApplication(app: ApplicationType) {
    models.forEach((m, key) => {
      m.visible = key === app;
    });
  }

  // Default to clock
  setApplication('clock');

  function update(time: number) {
    group.position.y = Math.sin(time * 0.8) * 0.03;
  }

  function dispose() {
    // Models automatically disposed with group
  }

  return { group, setApplication, update, dispose };
}

function createDedicatedInstrument(displayText: string, titleText: string, ledColor: string): THREE.Group {
  const inst = new THREE.Group();

  // Premium Hardware Instrument Enclosure
  const encGeo = new THREE.BoxGeometry(2.8, 1.8, 0.45);
  const encMat = new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.55, metalness: 0.35 });
  const enc = new THREE.Mesh(encGeo, encMat);
  inst.add(enc);

  // Recessed Display Screen
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#03060d';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = ledColor;
  ctx.font = 'bold 96px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = ledColor;
  ctx.shadowBlur = 18;
  ctx.fillText(displayText, 256, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: tex }));
  face.position.z = 0.235;
  inst.add(face);

  // Header Title Label Plate
  const lblCanvas = document.createElement('canvas');
  lblCanvas.width = 512;
  lblCanvas.height = 64;
  const lCtx = lblCanvas.getContext('2d')!;
  lCtx.fillStyle = '#38bdf8';
  lCtx.font = 'bold 28px monospace';
  lCtx.textAlign = 'center';
  lCtx.textBaseline = 'middle';
  lCtx.fillText(titleText, 256, 32);

  const lTex = new THREE.CanvasTexture(lblCanvas);
  lTex.colorSpace = THREE.SRGBColorSpace;
  const lblPlate = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.3), new THREE.MeshBasicMaterial({ map: lTex, transparent: true }));
  lblPlate.position.set(0, -1.05, 0.05);
  inst.add(lblPlate);

  return inst;
}

// =========================================================================
// 6. PROCEDURAL PCB BACKGROUND PLANE
// =========================================================================
function createProceduralPcb(renderer: THREE.WebGLRenderer): THREE.Group {
  const group = new THREE.Group();
  group.name = 'PcbPlane';

  const width = 2048;
  const height = 1536;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#02050c';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#162e4a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const traces = [
    [[100, 200], [500, 200], [700, 400], [1000, 400]],
    [[100, 260], [470, 260], [670, 460], [1000, 460]],
    [[100, 320], [440, 320], [640, 520], [1000, 520]],
    [[1100, 400], [1400, 400], [1600, 600], [1950, 600]],
    [[100, 1400], [1950, 1400]],
  ];

  traces.forEach((p) => {
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
    ctx.stroke();
  });

  // Authentic Academic Silkscreen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('BASIC ELECTRONICS • VARUN JANGRA', 120, 110);
  ctx.font = '16px monospace';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.fillText('DEPT. OF COMPUTER SCIENCE & ENGINEERING', 120, 140);
  ctx.fillText('SEVEN SEGMENT DISPLAY HARDWARE MODULE', 120, 1450);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const pcbMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.3 });
  const pcbMesh = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), pcbMat);
  pcbMesh.position.set(0, 0, -0.6);
  pcbMesh.receiveShadow = true;
  group.add(pcbMesh);

  return group;
}

// =========================================================================
// 7. FLOATING BACKGROUND DIGITS & AMBIENT PARTICLES
// =========================================================================
function createFloatingDigits(): { group: THREE.Group; update: (t: number) => void } {
  const group = new THREE.Group();
  group.name = 'FloatingHoloDigits';

  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const items: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number; phase: number }[] = [];

  digits.forEach((num, idx) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num, 64, 64);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), mat);
    const angle = (idx / 10) * Math.PI * 2;
    const rad = 4.4 + (idx % 3) * 0.8;
    const px = Math.cos(angle) * rad;
    const py = Math.sin(angle) * (rad * 0.7);
    const pz = -1.2 - (idx % 3) * 0.6;
    mesh.position.set(px, py, pz);
    group.add(mesh);

    items.push({ mesh, basePos: new THREE.Vector3(px, py, pz), speed: 0.5 + (idx % 3) * 0.2, phase: idx });
  });

  function update(time: number) {
    items.forEach((item) => {
      item.mesh.position.y = item.basePos.y + Math.sin(time * item.speed + item.phase) * 0.15;
    });
  }

  return { group, update };
}

function createAmbientDust(): { mesh: THREE.Points; update: (t: number) => void } {
  const count = 100;
  const pos = new Float32Array(count * 3);
  const initY: number[] = [];

  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    const y = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5;
    initY.push(y);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.04,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const mesh = new THREE.Points(geo, mat);

  function update(time: number) {
    const attr = geo.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] = initY[i] + Math.sin(time * 0.3 + i) * 0.2;
    }
    attr.needsUpdate = true;
  }

  return { mesh, update };
}
