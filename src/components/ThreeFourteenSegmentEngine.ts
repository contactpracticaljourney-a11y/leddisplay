import * as THREE from 'three';
import { FourteenApplicationType, FourteenSegmentId, CircuitConfig } from '../types';
import { FOURTEEN_CHAR_SEGMENTS, FOURTEEN_APPLICATIONS } from '../constants';

// =========================================================================
// 1. PROCEDURAL 3D 14-SEGMENT LED DISPLAY
// =========================================================================
export interface FourteenSegmentModel {
  group: THREE.Group;
  segments: Map<FourteenSegmentId, THREE.Mesh>;
  materials: Map<FourteenSegmentId, THREE.MeshStandardMaterial>;
  labels: Map<FourteenSegmentId, THREE.Mesh>;
  setCharacter: (char: string) => void;
  setSegmentState: (id: FourteenSegmentId, active: boolean) => void;
  setAllSegments: (active: boolean) => void;
  highlightSegment: (id: FourteenSegmentId | null) => void;
  setLabelsVisible: (visible: boolean) => void;
  setExploded: (progress: number) => void;
  update: (time: number, delta: number) => void;
  dispose: () => void;
}

export function createFourteenSegmentDisplay(): FourteenSegmentModel {
  const group = new THREE.Group();
  group.name = 'FourteenSegmentDisplay';

  const segments = new Map<FourteenSegmentId, THREE.Mesh>();
  const materials = new Map<FourteenSegmentId, THREE.MeshStandardMaterial>();
  const labels = new Map<FourteenSegmentId, THREE.Mesh>();

  const pkgW = 2.6;
  const pkgH = 3.6;
  const pkgD = 0.52;
  const slant = 0.088; // subtle italic slant

  // Display outer body (epoxy package)
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

  // Recessed display face
  const faceGeo = new THREE.BoxGeometry(pkgW - 0.2, pkgH - 0.22, 0.03);
  const faceMat = new THREE.MeshStandardMaterial({ color: 0x0b101c, roughness: 0.7, metalness: 0.25 });
  const faceMesh = new THREE.Mesh(faceGeo, faceMat);
  faceMesh.position.set(0, 0, 0.02);
  group.add(faceMesh);

  // 18 DIP Metal Pins (9 top, 9 bottom)
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xd8dde8, metalness: 0.95, roughness: 0.2 });
  const pinGeo = new THREE.BoxGeometry(0.035, 0.38, 0.025);
  for (let i = 0; i < 9; i++) {
    const x = -0.9 + i * 0.225;
    const pt = new THREE.Mesh(pinGeo, pinMat);
    pt.position.set(x, hh + 0.15, -pkgD / 2);
    group.add(pt);
    const pb = new THREE.Mesh(pinGeo, pinMat);
    pb.position.set(x, -hh - 0.15, -pkgD / 2);
    group.add(pb);
  }

  // Segment Geometries Builder
  function createChamferedHBar(len: number, w: number) {
    const s = new THREE.Shape();
    const hl = len / 2;
    const hw = w / 2;
    const tip = w * 0.7;
    s.moveTo(-hl + tip, hw);
    s.lineTo(hl - tip, hw);
    s.lineTo(hl, 0);
    s.lineTo(hl - tip, -hw);
    s.lineTo(-hl + tip, -hw);
    s.lineTo(-hl, 0);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.015, bevelThickness: 0.015 });
    geo.center();
    return geo;
  }

  function createChamferedVBar(len: number, w: number) {
    const s = new THREE.Shape();
    const hl = len / 2;
    const hw = w / 2;
    const tip = w * 0.7;
    s.moveTo(-hw, -hl + tip);
    s.lineTo(0, -hl);
    s.lineTo(hw, -hl + tip);
    s.lineTo(hw, hl - tip);
    s.lineTo(0, hl);
    s.lineTo(-hw, hl - tip);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.015, bevelThickness: 0.015 });
    geo.center();
    return geo;
  }

  function createChamferedDiagBar(len: number, w: number) {
    const s = new THREE.Shape();
    const hl = len / 2;
    const hw = w / 2;
    const tip = w * 0.6;
    s.moveTo(-hw, -hl + tip);
    s.lineTo(0, -hl);
    s.lineTo(hw, -hl + tip);
    s.lineTo(hw, hl - tip);
    s.lineTo(0, hl);
    s.lineTo(-hw, hl - tip);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.065, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.012, bevelThickness: 0.012 });
    geo.center();
    return geo;
  }

  const hTopGeo = createChamferedHBar(1.04, 0.17);
  const hMidGeo = createChamferedHBar(0.48, 0.15);
  const vOuterGeo = createChamferedVBar(0.82, 0.17);
  const vCenterGeo = createChamferedVBar(0.76, 0.15);
  const diagGeo = createChamferedDiagBar(0.88, 0.14);
  const dpGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
  dpGeo.rotateX(Math.PI / 2);

  // Segment physical placement definitions (14 segments + dp)
  const segmentDefs: {
    id: FourteenSegmentId;
    geo: THREE.BufferGeometry;
    x: number;
    y: number;
    rotZ?: number;
    explodeDir: [number, number, number];
  }[] = [
    // Outer Frame
    { id: 'a', geo: hTopGeo, x: 0, y: 1.18, explodeDir: [0, 0.45, 0.25] },
    { id: 'b', geo: vOuterGeo, x: 0.58, y: 0.59, rotZ: -slant, explodeDir: [0.45, 0.25, 0.25] },
    { id: 'c', geo: vOuterGeo, x: 0.58, y: -0.59, rotZ: -slant, explodeDir: [0.45, -0.25, 0.25] },
    { id: 'd', geo: hTopGeo, x: 0, y: -1.18, explodeDir: [0, -0.45, 0.25] },
    { id: 'e', geo: vOuterGeo, x: -0.58, y: -0.59, rotZ: -slant, explodeDir: [-0.45, -0.25, 0.25] },
    { id: 'f', geo: vOuterGeo, x: -0.58, y: 0.59, rotZ: -slant, explodeDir: [-0.45, 0.25, 0.25] },
    // Center Split Bar
    { id: 'g1', geo: hMidGeo, x: -0.29, y: 0, explodeDir: [-0.25, 0, 0.4] },
    { id: 'g2', geo: hMidGeo, x: 0.29, y: 0, explodeDir: [0.25, 0, 0.4] },
    // Center Verticals
    { id: 'i', geo: vCenterGeo, x: 0, y: 0.58, rotZ: -slant * 0.4, explodeDir: [0, 0.3, 0.35] },
    { id: 'l', geo: vCenterGeo, x: 0, y: -0.58, rotZ: -slant * 0.4, explodeDir: [0, -0.3, 0.35] },
    // Diagonals (Inner Spokes)
    { id: 'h', geo: diagGeo, x: -0.28, y: 0.58, rotZ: 0.62, explodeDir: [-0.35, 0.35, 0.3] },
    { id: 'j', geo: diagGeo, x: 0.28, y: 0.58, rotZ: -0.62, explodeDir: [0.35, 0.35, 0.3] },
    { id: 'k', geo: diagGeo, x: -0.28, y: -0.58, rotZ: -0.62, explodeDir: [-0.35, -0.35, 0.3] },
    { id: 'm', geo: diagGeo, x: 0.28, y: -0.58, rotZ: 0.62, explodeDir: [0.35, -0.35, 0.3] },
    // Decimal Point
    { id: 'dp', geo: dpGeo, x: 0.94, y: -1.18, explodeDir: [0.35, -0.35, 0.2] },
  ];

  const defaultPositions = new Map<FourteenSegmentId, THREE.Vector3>();
  const explodeDirections = new Map<FourteenSegmentId, THREE.Vector3>();

  function create3DLabel(text: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(7, 12, 22, 0.88)';
    ctx.beginPath();
    ctx.roundRect(14, 14, 100, 100, 24);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = 'bold 50px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const geo = new THREE.PlaneGeometry(0.24, 0.24);
    const m = new THREE.Mesh(geo, mat);
    m.visible = false;
    return m;
  }

  segmentDefs.forEach(({ id, geo, x, y, rotZ, explodeDir }) => {
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

    if (rotZ !== undefined) {
      mesh.rotation.z = rotZ;
    }

    group.add(mesh);
    segments.set(id, mesh);
    materials.set(id, mat);

    defaultPositions.set(id, new THREE.Vector3(slantedX, y, 0.07));
    explodeDirections.set(id, new THREE.Vector3(...explodeDir));

    const labelMesh = create3DLabel(id);
    labelMesh.position.set(slantedX, y, 0.16);
    group.add(labelMesh);
    labels.set(id, labelMesh);
  });

  let currentActiveSet = new Set<FourteenSegmentId>();

  function setSegmentState(id: FourteenSegmentId, active: boolean) {
    const mat = materials.get(id);
    if (!mat) return;
    if (active) {
      mat.color.setHex(0xff3b30);
      mat.emissive.setHex(0xff1e1e);
      mat.emissiveIntensity = 3.2;
      currentActiveSet.add(id);
    } else {
      mat.color.setHex(0x3d0b0b);
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0.0;
      currentActiveSet.delete(id);
    }
  }

  function setAllSegments(active: boolean) {
    segmentDefs.forEach(({ id }) => setSegmentState(id, active));
  }

  function setCharacter(char: string) {
    const upper = char.toUpperCase();
    const activeSegs = FOURTEEN_CHAR_SEGMENTS[upper] || ['a', 'b', 'c', 'e', 'f', 'g1', 'g2'];
    segmentDefs.forEach(({ id }) => {
      setSegmentState(id, activeSegs.includes(id));
    });
  }

  function highlightSegment(id: FourteenSegmentId | null) {
    if (!id) {
      segmentDefs.forEach(({ id: sId }) => {
        setSegmentState(sId, currentActiveSet.has(sId));
      });
      return;
    }
    segmentDefs.forEach(({ id: sId }) => {
      const mat = materials.get(sId);
      if (!mat) return;
      if (sId === id) {
        mat.color.setHex(0xffffff);
        mat.emissive.setHex(0xff2200);
        mat.emissiveIntensity = 4.8;
      } else {
        mat.color.setHex(0x1a0505);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0.0;
      }
    });
  }

  function setLabelsVisible(visible: boolean) {
    labels.forEach((lbl) => {
      lbl.visible = visible;
    });
  }

  function setExploded(progress: number) {
    segmentDefs.forEach(({ id }) => {
      const mesh = segments.get(id);
      const defPos = defaultPositions.get(id);
      const dir = explodeDirections.get(id);
      if (mesh && defPos && dir) {
        mesh.position.set(
          defPos.x + dir.x * progress * 0.9,
          defPos.y + dir.y * progress * 0.9,
          defPos.z + dir.z * progress * 0.9
        );
        const lbl = labels.get(id);
        if (lbl) {
          lbl.position.set(
            mesh.position.x,
            mesh.position.y,
            mesh.position.z + 0.14
          );
        }
      }
    });
  }

  function update(time: number, delta: number) {
    // Subtle idle breathing pulse on active segments
    currentActiveSet.forEach((id) => {
      const mat = materials.get(id);
      if (mat) {
        mat.emissiveIntensity = 3.0 + Math.sin(time * 3.5 + id.charCodeAt(0)) * 0.4;
      }
    });
  }

  function dispose() {
    bodyGeo.dispose();
    bodyMat.dispose();
    faceGeo.dispose();
    faceMat.dispose();
    pinGeo.dispose();
    pinMat.dispose();
    hTopGeo.dispose();
    hMidGeo.dispose();
    vOuterGeo.dispose();
    vCenterGeo.dispose();
    diagGeo.dispose();
    dpGeo.dispose();
    materials.forEach((m) => m.dispose());
  }

  return {
    group,
    segments,
    materials,
    labels,
    setCharacter,
    setSegmentState,
    setAllSegments,
    highlightSegment,
    setLabelsVisible,
    setExploded,
    update,
    dispose,
  };
}

// =========================================================================
// 2. 14-SEGMENT ELECTRONIC CIRCUIT & CA/CC POLARITY SYSTEM
// =========================================================================
export interface FourteenCircuitSystem {
  group: THREE.Group;
  setConfig: (mode: CircuitConfig) => void;
  update: (time: number, delta: number) => void;
  dispose: () => void;
}

export function createFourteenCircuitSystem(): FourteenCircuitSystem {
  const group = new THREE.Group();
  group.name = 'FourteenCircuitSystem';

  // 1. PCB Board
  const pcbGeo = new THREE.BoxGeometry(4.6, 3.4, 0.08);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x071b12, roughness: 0.65, metalness: 0.3 });
  const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
  pcbMesh.position.set(0, 0, -0.1);
  group.add(pcbMesh);

  // 2. Power Supply Block (Left: x = -1.6)
  const psuGroup = new THREE.Group();
  psuGroup.position.set(-1.6, 0, 0);

  const psuBoxGeo = new THREE.BoxGeometry(0.8, 1.8, 0.4);
  const psuBoxMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.6 });
  const psuBox = new THREE.Mesh(psuBoxGeo, psuBoxMat);
  psuGroup.add(psuBox);

  // Power status LED
  const psuLedGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);
  psuLedGeo.rotateX(Math.PI / 2);
  const psuLedMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 3.0 });
  const psuLed = new THREE.Mesh(psuLedGeo, psuLedMat);
  psuLed.position.set(0, 0.6, 0.22);
  psuGroup.add(psuLed);

  // Terminal posts (+5V red, GND black)
  const termMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 });
  const termMatBlk = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.2 });
  const termGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 16);
  termGeo.rotateX(Math.PI / 2);

  const termVcc = new THREE.Mesh(termGeo, termMatRed);
  termVcc.position.set(0, 0.2, 0.25);
  psuGroup.add(termVcc);

  const termGnd = new THREE.Mesh(termGeo, termMatBlk);
  termGnd.position.set(0, -0.3, 0.25);
  psuGroup.add(termGnd);

  group.add(psuGroup);

  // 3. Bank of 14 Miniature 220Ω Resistors (x = -0.75)
  const resGroup = new THREE.Group();
  resGroup.position.set(-0.75, 0, 0);
  const resBodyGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.16, 12);
  const resBodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 }); // tan body

  for (let i = 0; i < 14; i++) {
    const y = -1.1 + i * 0.17;
    const r = new THREE.Mesh(resBodyGeo, resBodyMat);
    r.position.set(0, y, 0.08);
    r.rotation.z = Math.PI / 2;
    resGroup.add(r);
  }
  group.add(resGroup);

  // 4. Center 14-Segment Display Module (x = 0.35, scale = 0.65)
  const display = createFourteenSegmentDisplay();
  display.group.position.set(0.35, 0, 0.05);
  display.group.scale.set(0.65, 0.65, 0.65);
  display.setCharacter('A');
  group.add(display.group);

  // 5. Right Control Circuit (Microcontroller / Driver IC chip at x = 1.6)
  const icGroup = new THREE.Group();
  icGroup.position.set(1.6, 0, 0);
  const icBodyGeo = new THREE.BoxGeometry(0.65, 2.2, 0.2);
  const icBodyMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5, metalness: 0.4 });
  const icBody = new THREE.Mesh(icBodyGeo, icBodyMat);
  icGroup.add(icBody);

  // IC Pins
  const icPinGeo = new THREE.BoxGeometry(0.12, 0.025, 0.02);
  const icPinMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });
  for (let i = 0; i < 12; i++) {
    const y = -0.9 + i * 0.16;
    const pL = new THREE.Mesh(icPinGeo, icPinMat);
    pL.position.set(-0.35, y, 0);
    icGroup.add(pL);
    const pR = new THREE.Mesh(icPinGeo, icPinMat);
    pR.position.set(0.35, y, 0);
    icGroup.add(pR);
  }
  group.add(icGroup);

  // 6. Interactive Voltage Rails (Top Rail & Bottom Rail)
  const railGeo = new THREE.BoxGeometry(3.8, 0.08, 0.03);
  const topRailMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.5 });
  const topRail = new THREE.Mesh(railGeo, topRailMat);
  topRail.position.set(0, 1.45, 0.02);
  group.add(topRail);

  const btmRailMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.5 });
  const btmRail = new THREE.Mesh(railGeo, btmRailMat);
  btmRail.position.set(0, -1.45, 0.02);
  group.add(btmRail);

  // 7. Dynamic Current Flow Particles
  const particleCount = 60;
  const pPos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pPos[i * 3] = -1.5 + Math.random() * 3.0;
    pPos[i * 3 + 1] = -1.2 + Math.random() * 2.4;
    pPos[i * 3 + 2] = 0.12;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.06,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);

  let currentMode: CircuitConfig = 'CA';

  function setConfig(mode: CircuitConfig) {
    currentMode = mode;
    if (mode === 'CA') {
      // Common Anode (+5V VCC Shared)
      topRailMat.color.setHex(0xf59e0b);
      topRailMat.emissive.setHex(0xf59e0b);
      topRailMat.emissiveIntensity = 2.4;

      btmRailMat.color.setHex(0x334155);
      btmRailMat.emissive.setHex(0x000000);
      btmRailMat.emissiveIntensity = 0.0;

      pMat.color.setHex(0xfbbf24); // warm amber current flow
      display.setCharacter('A');
    } else {
      // Common Cathode (GND Shared)
      topRailMat.color.setHex(0x334155);
      topRailMat.emissive.setHex(0x000000);
      topRailMat.emissiveIntensity = 0.0;

      btmRailMat.color.setHex(0x10b981);
      btmRailMat.emissive.setHex(0x10b981);
      btmRailMat.emissiveIntensity = 2.4;

      pMat.color.setHex(0x34d399); // emerald/cyan current flow
      display.setCharacter('A');
    }
  }

  function update(time: number, delta: number) {
    display.update(time, delta);

    // Animate current flow particles along circuit tracks
    const pos = pGeo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const speed = currentMode === 'CA' ? 0.8 : -0.8;

    for (let i = 0; i < particleCount; i++) {
      let x = arr[i * 3];
      x += delta * speed;
      if (x > 1.6) x = -1.6;
      if (x < -1.6) x = 1.6;
      arr[i * 3] = x;
    }
    pos.needsUpdate = true;
  }

  function dispose() {
    pcbGeo.dispose();
    pcbMat.dispose();
    psuBoxGeo.dispose();
    psuBoxMat.dispose();
    psuLedGeo.dispose();
    psuLedMat.dispose();
    termMatRed.dispose();
    termMatBlk.dispose();
    termGeo.dispose();
    resBodyGeo.dispose();
    resBodyMat.dispose();
    icBodyGeo.dispose();
    icBodyMat.dispose();
    icPinGeo.dispose();
    icPinMat.dispose();
    railGeo.dispose();
    topRailMat.dispose();
    btmRailMat.dispose();
    pGeo.dispose();
    pMat.dispose();
    display.dispose();
  }

  return {
    group,
    setConfig,
    update,
    dispose,
  };
}

// =========================================================================
// 3. 16-SEGMENT VS 7-SEGMENT COMPARISON SYSTEM (Genuine 7-Seg vs 16-Seg)
// =========================================================================
export interface FourteenVsSevenComparison {
  group: THREE.Group;
  setCharacter: (char: string) => void;
  update: (time: number) => void;
  dispose: () => void;
}

// Standalone Genuine 7-Segment LED Model (Only 7 Physical Segments)
function createGenuineSevenSegmentModel() {
  const group = new THREE.Group();
  group.name = 'GenuineSevenSegment';

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
  group.add(bodyMesh);

  const faceGeo = new THREE.BoxGeometry(pkgW - 0.22, pkgH - 0.24, 0.03);
  const faceMat = new THREE.MeshStandardMaterial({ color: 0x0c111e, roughness: 0.7, metalness: 0.25 });
  const faceMesh = new THREE.Mesh(faceGeo, faceMat);
  faceMesh.position.set(0, 0, 0.02);
  group.add(faceMesh);

  function createHBar(len: number, w: number) {
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

  function createVBar(len: number, w: number) {
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

  const hGeo = createHBar(0.76, 0.20);
  const vGeo = createVBar(0.82, 0.20);
  const spX = 0.48;
  const spY = 0.52;

  const segments = new Map<string, THREE.Mesh>();
  const materials = new Map<string, THREE.MeshStandardMaterial>();

  const segDefs = [
    { id: 'a', geo: hGeo, x: 0, y: spY * 2 },
    { id: 'b', geo: vGeo, x: spX, y: spY },
    { id: 'c', geo: vGeo, x: spX, y: -spY },
    { id: 'd', geo: hGeo, x: 0, y: -spY * 2 },
    { id: 'e', geo: vGeo, x: -spX, y: -spY },
    { id: 'f', geo: vGeo, x: -spX, y: spY },
    { id: 'g', geo: hGeo, x: 0, y: 0 },
  ];

  segDefs.forEach(({ id, geo, x, y }) => {
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
  });

  function setSegmentState(id: string, active: boolean) {
    const mat = materials.get(id);
    if (!mat) return;
    if (active) {
      mat.color.setHex(0xff2222);
      mat.emissive.setHex(0xff1515);
      mat.emissiveIntensity = 3.5;
    } else {
      mat.color.setHex(0x350808);
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0.0;
    }
  }

  function setAllSegments(active: boolean) {
    ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach((s) => setSegmentState(s, active));
  }

  function setCharacter(char: string) {
    setAllSegments(false);
    const upper = char.toUpperCase();
    const map7: Record<string, string[]> = {
      'A': ['a', 'b', 'c', 'e', 'f', 'g'],
      'B': ['c', 'd', 'e', 'f', 'g'],
      'C': ['a', 'd', 'e', 'f'],
      'D': ['b', 'c', 'd', 'e', 'g'],
      'E': ['a', 'd', 'e', 'f', 'g'],
      'F': ['a', 'e', 'f', 'g'],
      '0': ['a', 'b', 'c', 'd', 'e', 'f'],
      '1': ['b', 'c'],
      '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    };
    const activeSegs = map7[upper] || ['a', 'b', 'c', 'e', 'f', 'g'];
    activeSegs.forEach((seg) => setSegmentState(seg, true));
  }

  function dispose() {
    bodyGeo.dispose();
    bodyMat.dispose();
    faceGeo.dispose();
    faceMat.dispose();
    hGeo.dispose();
    vGeo.dispose();
    materials.forEach((m) => m.dispose());
  }

  return { group, setCharacter, dispose };
}

export function createFourteenVsSevenComparisonSystem(): FourteenVsSevenComparison {
  const group = new THREE.Group();
  group.name = 'FourteenVsSevenComparison';

  // Left side: Genuine 7-Segment LED Display (Only 7 physical segment cutouts)
  const leftDisplay = createGenuineSevenSegmentModel();
  leftDisplay.group.position.set(-1.3, 0, 0);
  leftDisplay.group.scale.set(0.72, 0.72, 0.72);
  group.add(leftDisplay.group);

  // Right side: True 16-segment LED Display (16 physical segment cutouts)
  const rightDisplay = createFourteenSegmentDisplay();
  rightDisplay.group.position.set(1.3, 0, 0);
  rightDisplay.group.scale.set(0.72, 0.72, 0.72);
  group.add(rightDisplay.group);

  function createHeaderBanner(title: string, subtitle: string, color: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 380, 100);
    ctx.fillStyle = 'rgba(7, 12, 22, 0.9)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 360, 80, 16);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, 190, 44);

    ctx.font = '15px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(subtitle, 190, 72);

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(1.4, 0.38);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    return new THREE.Mesh(geo, mat);
  }

  const leftBadge = createHeaderBanner('7-SEGMENT', 'Limited Alphabetic', '#ef4444');
  leftBadge.position.set(-1.3, 1.65, 0.1);
  group.add(leftBadge);

  const rightBadge = createHeaderBanner('16-SEGMENT', 'Full Alphanumeric + Symbols', '#38bdf8');
  rightBadge.position.set(1.3, 1.65, 0.1);
  group.add(rightBadge);

  function setCharacter(char: string) {
    const upper = char.toUpperCase();
    leftDisplay.setCharacter(upper);
    rightDisplay.setCharacter(upper);
  }

  setCharacter('A');

  function update(time: number) {
    rightDisplay.update(time, 0.016);
  }

  function dispose() {
    leftDisplay.dispose();
    rightDisplay.dispose();
  }

  return {
    group,
    setCharacter,
    update,
    dispose,
  };
}

// =========================================================================
// 4. 4-DIGIT 16-SEGMENT MULTIPLEXING SYSTEM ("2026")
// =========================================================================
export interface FourteenMultiplexSystem {
  group: THREE.Group;
  update: (time: number) => void;
  dispose: () => void;
}

export function createFourteenMultiplexSystem(): FourteenMultiplexSystem {
  const group = new THREE.Group();
  group.name = 'FourteenMultiplexSystem';

  const displays: FourteenSegmentModel[] = [];
  const digits = ['2', '0', '2', '6'];
  const spacing = 0.92;

  for (let i = 0; i < 4; i++) {
    const d = createFourteenSegmentDisplay();
    d.group.position.set(-1.38 + i * spacing, 0.05, 0);
    d.group.scale.set(0.52, 0.52, 0.52);
    d.setCharacter(digits[i]);
    group.add(d.group);
    displays.push(d);
  }

  // Common Segment Bus (Horizontal Copper Wire Lines)
  const busGeo = new THREE.BoxGeometry(3.6, 0.018, 0.018);
  const busMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.2 });
  for (let j = 0; j < 5; j++) {
    const wire = new THREE.Mesh(busGeo, busMat);
    wire.position.set(0, -1.0 - j * 0.07, 0.05);
    group.add(wire);
  }

  let strobeTimer = 0;
  let activeIndex = 0;

  function update(time: number) {
    strobeTimer += 0.016;
    if (strobeTimer > 0.08) {
      strobeTimer = 0;
      activeIndex = (activeIndex + 1) % 4;
      displays.forEach((d, idx) => {
        if (idx === activeIndex) {
          d.setCharacter(digits[idx]);
        } else {
          d.setAllSegments(false);
        }
      });
    }
  }

  function dispose() {
    busGeo.dispose();
    busMat.dispose();
    displays.forEach((d) => d.dispose());
  }

  return {
    group,
    update,
    dispose,
  };
}

// =========================================================================
// 5. 16-SEGMENT APPLICATIONS GALLERY
// =========================================================================
export interface FourteenApplicationsGallery {
  group: THREE.Group;
  setApplication: (app: FourteenApplicationType) => void;
  update: (time: number) => void;
  dispose: () => void;
}

export function createFourteenApplicationsSystem(): FourteenApplicationsGallery {
  const group = new THREE.Group();
  group.name = 'FourteenApplicationsGallery';

  // Front Bezel Panel
  const panelGeo = new THREE.BoxGeometry(3.2, 2.2, 0.18);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x0b101c, roughness: 0.6, metalness: 0.4 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  group.add(panel);

  // Recessed Display Window
  const winGeo = new THREE.BoxGeometry(2.8, 1.2, 0.08);
  const winMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.8 });
  const win = new THREE.Mesh(winGeo, winMat);
  win.position.set(0, 0.15, 0.1);
  group.add(win);

  // 4 Display Digits in window
  const chars = ['M', 'O', 'N', ' '];
  const displays: FourteenSegmentModel[] = [];
  for (let i = 0; i < 4; i++) {
    const d = createFourteenSegmentDisplay();
    d.group.position.set(-0.95 + i * 0.64, 0.15, 0.14);
    d.group.scale.set(0.42, 0.42, 0.42);
    d.setCharacter(chars[i] || ' ');
    group.add(d.group);
    displays.push(d);
  }

  function setApplication(app: FourteenApplicationType) {
    const details = FOURTEEN_APPLICATIONS[app];
    if (!details) return;
    const str = details.readout.replace(/[^A-Za-z0-9]/g, '').padEnd(4, ' ').slice(0, 4);
    for (let i = 0; i < 4; i++) {
      displays[i].setCharacter(str[i] || ' ');
    }
  }

  setApplication('clocks');

  function update(time: number) {
    displays.forEach((d) => d.update(time, 0.016));
  }

  function dispose() {
    panelGeo.dispose();
    panelMat.dispose();
    winGeo.dispose();
    winMat.dispose();
    displays.forEach((d) => d.dispose());
  }

  return {
    group,
    setApplication,
    update,
    dispose,
  };
}

// =========================================================================
// 6. 3D 8x8 DOT MATRIX LED DISPLAY SYSTEM (Slide 13 New Model)
// =========================================================================
export interface DotMatrixDisplaySystem {
  group: THREE.Group;
  setPattern: (patternKey: string) => void;
  update: (time: number) => void;
  dispose: () => void;
}

export function createDotMatrixDisplaySystem(): DotMatrixDisplaySystem {
  const group = new THREE.Group();
  group.name = 'DotMatrixDisplaySystem';

  const pkgW = 2.4;
  const pkgH = 2.4;
  const pkgD = 0.42;

  // Outer epoxy package
  const bodyGeo = new THREE.BoxGeometry(pkgW, pkgH, pkgD);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.6, metalness: 0.3 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.z = -pkgD / 2;
  group.add(bodyMesh);

  // Recessed black faceplate
  const faceGeo = new THREE.BoxGeometry(pkgW - 0.16, pkgH - 0.16, 0.03);
  const faceMat = new THREE.MeshStandardMaterial({ color: 0x050811, roughness: 0.7 });
  const faceMesh = new THREE.Mesh(faceGeo, faceMat);
  faceMesh.position.set(0, 0, 0.01);
  group.add(faceMesh);

  // 8x8 LED Dots Grid
  const dotMeshes: THREE.Mesh[] = [];
  const dotMats: THREE.MeshStandardMaterial[] = [];
  const dotGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.06, 16);
  dotGeo.rotateX(Math.PI / 2);

  const gridRows = 8;
  const gridCols = 8;
  const spacing = 0.24;
  const startX = -((gridCols - 1) * spacing) / 2;
  const startY = ((gridRows - 1) * spacing) / 2;

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x180505,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        roughness: 0.25,
      });
      const dot = new THREE.Mesh(dotGeo, mat);
      dot.position.set(startX + c * spacing, startY - r * spacing, 0.04);
      group.add(dot);
      dotMeshes.push(dot);
      dotMats.push(mat);
    }
  }

  // 16 Pin Header (8 top, 8 bottom)
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xd8dde8, metalness: 0.9, roughness: 0.2 });
  const pinGeo = new THREE.BoxGeometry(0.035, 0.35, 0.025);
  for (let i = 0; i < 8; i++) {
    const x = -0.84 + i * 0.24;
    const pt = new THREE.Mesh(pinGeo, pinMat);
    pt.position.set(x, pkgH / 2 + 0.15, -pkgD / 2);
    group.add(pt);
    const pb = new THREE.Mesh(pinGeo, pinMat);
    pb.position.set(x, -pkgH / 2 - 0.15, -pkgD / 2);
    group.add(pb);
  }

  const PATTERNS: Record<string, number[]> = {
    'A': [
      0b00111100,
      0b01100110,
      0b01100110,
      0b01111110,
      0b01100110,
      0b01100110,
      0b01100110,
      0b00000000,
    ],
    'B': [
      0b01111100,
      0b01100110,
      0b01100110,
      0b01111100,
      0b01100110,
      0b01100110,
      0b01111100,
      0b00000000,
    ],
    '8': [
      0b00111100,
      0b01100110,
      0b01100110,
      0b00111100,
      0b01100110,
      0b01100110,
      0b00111100,
      0b00000000,
    ],
    'HEART': [
      0b00000000,
      0b01100110,
      0b11111111,
      0b11111111,
      0b01111110,
      0b00111100,
      0b00011000,
      0b00000000,
    ],
    'SMILE': [
      0b00111100,
      0b01000010,
      0b10100101,
      0b10000001,
      0b10100101,
      0b10011001,
      0b01000010,
      0b00111100,
    ],
  };

  let activePatternKey = 'A';

  function setPattern(patternKey: string) {
    activePatternKey = patternKey.toUpperCase();
    const rows = PATTERNS[activePatternKey] || PATTERNS['A'];

    for (let r = 0; r < 8; r++) {
      const rowByte = rows[r] || 0;
      for (let c = 0; c < 8; c++) {
        const idx = r * 8 + c;
        const bitOn = (rowByte & (1 << (7 - c))) !== 0;
        const mat = dotMats[idx];
        if (bitOn) {
          mat.color.setHex(0xff2222);
          mat.emissive.setHex(0xff1818);
          mat.emissiveIntensity = 4.2;
        } else {
          mat.color.setHex(0x180505);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
        }
      }
    }
  }

  setPattern('A');

  function update(time: number) {
    const rows = PATTERNS[activePatternKey] || PATTERNS['A'];
    for (let r = 0; r < 8; r++) {
      const rowByte = rows[r] || 0;
      for (let c = 0; c < 8; c++) {
        const idx = r * 8 + c;
        if ((rowByte & (1 << (7 - c))) !== 0) {
          dotMats[idx].emissiveIntensity = 3.8 + Math.sin(time * 4.0 + idx) * 0.5;
        }
      }
    }
  }

  function dispose() {
    bodyGeo.dispose();
    bodyMat.dispose();
    faceGeo.dispose();
    faceMat.dispose();
    dotGeo.dispose();
    pinGeo.dispose();
    pinMat.dispose();
    dotMats.forEach((m) => m.dispose());
  }

  return {
    group,
    setPattern,
    update,
    dispose,
  };
}


