import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { TrackedVessel } from '../../types';
import { PortMapPoint, ChokepointMarker, MonsoonZone } from '../../data/vesselTrackingData';
import { MapLayerState, MapThemeMode, WorldMonitorSelection } from './types';
import earthNightTexture from '../../assets/earth-night.jpg';
import earthCloudsTexture from '../../assets/earth-clouds.png';
import earthNormalTexture from '../../assets/earth-normal.jpg';
import earthSpecularTexture from '../../assets/earth-specular.jpg';

interface Globe3DViewProps {
  vessels: TrackedVessel[];
  ports: PortMapPoint[];
  chokepoints: ChokepointMarker[];
  monsoonZones: MonsoonZone[];
  selectedItem: WorldMonitorSelection;
  highlightedChokepointId: string | null;
  onSelectVessel: (vessel: TrackedVessel) => void;
  onSelectPort: (port: PortMapPoint) => void;
  onSelectChokepoint: (chokepoint: ChokepointMarker) => void;
  layers: MapLayerState;
  theme: MapThemeMode;
  targetFocusCoord?: { lat: number; lng: number } | null;
}

// Convert geographic coordinates (lat, lng in degrees) to 3D Cartesian (x, y, z) on a sphere of radius R
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate 3D quadratic/cubic Bézier curve points rising above the sphere surface for trade routes
function createArcCurve(startVec: THREE.Vector3, endVec: THREE.Vector3, globeRadius: number, altitude: number = 0.12): THREE.Vector3[] {
  const distance = startVec.distanceTo(endVec);
  const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  const midLength = midPoint.length();
  
  // Height scales with distance
  const arcHeight = globeRadius + Math.max(0.06, Math.min(0.35, distance * altitude));
  midPoint.normalize().multiplyScalar(arcHeight);

  // Create curve with multiple interpolation points
  const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
  return curve.getPoints(50);
}

export const Globe3DView: React.FC<Globe3DViewProps> = ({
  vessels,
  ports,
  chokepoints,
  monsoonZones,
  selectedItem,
  highlightedChokepointId,
  onSelectVessel,
  onSelectPort,
  onSelectChokepoint,
  layers,
  theme,
  targetFocusCoord
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Three.js State Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const interactiveObjectsRef = useRef<Array<{ mesh: THREE.Object3D; type: 'VESSEL' | 'PORT' | 'CHOKEPOINT'; data: any }>>([]);
  const frameIdRef = useRef<number | null>(null);
  const chokepointPulseRefsRef = useRef<Array<{ ring: THREE.Mesh; baseOpacity: number; phase: number }>>([]);
  const monsoonPulseRefsRef = useRef<Array<{ mesh: THREE.Mesh | THREE.LineLoop; baseOpacity: number; phase: number }>>([]);
  const cloudMeshRef = useRef<THREE.Mesh | null>(null);
  const starfieldRef = useRef<THREE.Points | null>(null);
  
  // Camera & Orbit State
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraDistanceRef = useRef<number>(2.6);
  const rotationVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Camera smooth tweening state
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);

  // Hover state
  const [hoveredInfo, setHoveredInfo] = useState<{
    x: number;
    y: number;
    title: string;
    subtitle: string;
    type: 'VESSEL' | 'PORT' | 'CHOKEPOINT';
    badge?: string;
  } | null>(null);

  const GLOBE_RADIUS = 1.0;

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = cameraDistanceRef.current;
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // 4. Globe Root Group
    const globeGroup = new THREE.Group();
    // Default orientation focused on Indian Ocean & Indo-Pacific (approx lat 0, lng 90)
    globeGroup.rotation.y = -Math.PI * 0.45;
    globeGroup.rotation.x = 0.15;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x90cdf4, 1.8);
    dirLight1.position.set(5, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffeedd, 0.8);
    dirLight2.position.set(-5, -2, -3);
    scene.add(dirLight2);

    // 6. Base Globe Sphere with a real photographic Earth-at-night texture (NASA-derived,
    // public domain). The graticule grid is drawn on top of the loaded image so the
    // existing layers.graticuleGrid toggle keeps working unchanged. A real normal map (surface
    // relief) and specular map (ocean-vs-land shininess mask) are layered on top for a much
    // less flat-looking sphere under the directional lights.
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 2048;
    textureCanvas.height = 1024;
    const ctx = textureCanvas.getContext('2d')!;

    const earthImage = new Image();
    earthImage.onload = () => {
      ctx.drawImage(earthImage, 0, 0, textureCanvas.width, textureCanvas.height);

      // Tactical Lat/Long Graticule Grid overlaid on the real imagery
      ctx.strokeStyle = 'rgba(140, 180, 210, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      for (let lat = -80; lat <= 80; lat += 20) {
        const y = ((90 - lat) / 180) * textureCanvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(textureCanvas.width, y);
        ctx.stroke();
      }
      for (let lng = -180; lng <= 180; lng += 30) {
        const x = ((lng + 180) / 360) * textureCanvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, textureCanvas.height);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      globeTexture.needsUpdate = true;
    };
    earthImage.src = earthNightTexture;

    const globeTexture = new THREE.CanvasTexture(textureCanvas);
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load(earthNormalTexture);
    const specularMap = textureLoader.load(earthSpecularTexture);
    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: globeTexture,
      normalMap,
      normalScale: new THREE.Vector2(0.55, 0.55),
      specularMap,
      shininess: 14,
      specular: new THREE.Color(0x3A6D93)
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    // 6.5 Cloud Layer — a slightly larger, semi-transparent sphere that spins independently of
    // the surface (real Earth clouds drift faster than the globe's own slow rotation), giving
    // the sphere a "living planet" feel instead of a static painted ball.
    const cloudsTextureImg = textureLoader.load(earthCloudsTexture);
    const cloudsGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 96, 96);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTextureImg,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    globeGroup.add(cloudsMesh);
    cloudMeshRef.current = cloudsMesh;

    // 6.6 Starfield backdrop — procedural (no texture fetch needed), scattered on a large shell
    // around the scene so the globe reads as a body in space rather than floating on a flat
    // background.
    const STAR_COUNT = 2200;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const radius = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi);
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xcfe8ff,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true
    });
    const starfield = new THREE.Points(starGeometry, starMaterial);
    scene.add(starfield);
    starfieldRef.current = starfield;

    // 7. Outer Atmospheric Glow Halo
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.03, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.18, 0.58, 0.88, 1.0) * intensity * 0.75;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // 8. Equator and Prime Meridian 3D Glowing Rings
    const ringMat = new THREE.LineBasicMaterial({ color: 0x00b4d8, transparent: true, opacity: 0.35 });
    const equatorGeo = new THREE.BufferGeometry();
    const equatorPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      equatorPts.push(new THREE.Vector3(Math.cos(theta) * GLOBE_RADIUS * 1.002, 0, Math.sin(theta) * GLOBE_RADIUS * 1.002));
    }
    equatorGeo.setFromPoints(equatorPts);
    const equatorLine = new THREE.Line(equatorGeo, ringMat);
    globeGroup.add(equatorLine);

    // Animation Render Loop
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Handle Auto-Rotation or Momentum
      if (globeGroupRef.current) {
        if (targetRotationRef.current) {
          // Smoothly interpolate towards target focus
          globeGroupRef.current.rotation.y += (targetRotationRef.current.y - globeGroupRef.current.rotation.y) * 0.08;
          globeGroupRef.current.rotation.x += (targetRotationRef.current.x - globeGroupRef.current.rotation.x) * 0.08;
          if (
            Math.abs(targetRotationRef.current.y - globeGroupRef.current.rotation.y) < 0.005 &&
            Math.abs(targetRotationRef.current.x - globeGroupRef.current.rotation.x) < 0.005
          ) {
            targetRotationRef.current = null;
          }
        } else if (layers.autoRotate && !isDraggingRef.current) {
          globeGroupRef.current.rotation.y += delta * 0.15;
        } else if (!isDraggingRef.current) {
          // Friction damping
          globeGroupRef.current.rotation.y += rotationVelocityRef.current.x;
          globeGroupRef.current.rotation.x += rotationVelocityRef.current.y;
          rotationVelocityRef.current.x *= 0.92;
          rotationVelocityRef.current.y *= 0.92;
        }
      }

      // Clouds drift independently of (and slightly faster than) the globe's own rotation.
      if (cloudMeshRef.current) {
        cloudMeshRef.current.rotation.y += delta * 0.03;
      }
      // Starfield drifts almost imperceptibly so it doesn't read as a static painted backdrop.
      if (starfieldRef.current) {
        starfieldRef.current.rotation.y += delta * 0.004;
      }

      // Continuous chokepoint hazard pulse (always-on highlighting, not just on select/hover)
      const pulseTime = now / 1000;
      chokepointPulseRefsRef.current.forEach(({ ring, baseOpacity, phase }) => {
        const wave = (Math.sin(pulseTime * 2 + phase) + 1) / 2; // 0..1
        const scale = 1 + wave * 0.35;
        ring.scale.setScalar(scale);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = baseOpacity * (0.55 + wave * 0.45);
      });

      // Gentle "breathing" opacity pulse for monsoon/weather hazard zones
      monsoonPulseRefsRef.current.forEach(({ mesh, baseOpacity, phase }) => {
        const wave = (Math.sin(pulseTime * 0.6 + phase) + 1) / 2; // slower breathing cadence
        const mat = mesh.material as THREE.MeshBasicMaterial | THREE.LineBasicMaterial;
        mat.opacity = baseOpacity * (0.5 + wave * 0.5);
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Update Scene Elements (Corridors, Vessels, Ports, Chokepoints) whenever data/layers change
  useEffect(() => {
    if (!globeGroupRef.current) return;
    const globeGroup = globeGroupRef.current;

    // Remove existing dynamic objects (identified with name 'dynamic_layer')
    const toRemove: THREE.Object3D[] = [];
    globeGroup.children.forEach(child => {
      if (child.name === 'dynamic_layer') {
        toRemove.push(child);
      }
    });
    toRemove.forEach(obj => globeGroup.remove(obj));

    interactiveObjectsRef.current = [];
    chokepointPulseRefsRef.current = [];
    monsoonPulseRefsRef.current = [];

    const dynamicRoot = new THREE.Group();
    dynamicRoot.name = 'dynamic_layer';
    globeGroup.add(dynamicRoot);

    // --- 1. TRADE CORRIDORS (3D Great-Circle Curved Arcs) ---
    if (layers.tradeCorridors) {
      const corridors = [
        {
          name: 'Malacca Standard Track (Optimal)',
          color: 0xbc412b,
          points: [
            { lat: -32.92, lng: 151.78 }, // Newcastle
            { lat: -10.55, lng: 142.15 }, // Torres
            { lat: 1.25, lng: 103.80 },   // Singapore / Malacca
            { lat: 20.26, lng: 86.67 }    // Paradip
          ],
          highlighted: highlightedChokepointId === 'malacca_tss' || highlightedChokepointId === 'singapore_strait'
        },
        {
          name: 'Lombok Deep-Water Corridor (Capesize)',
          color: 0xf59e0b,
          points: [
            { lat: -32.92, lng: 151.78 },
            { lat: -34.80, lng: 125.00 },
            { lat: -8.75, lng: 115.75 },  // Lombok
            { lat: 20.26, lng: 86.67 }
          ],
          highlighted: highlightedChokepointId === 'lombok_strait'
        },
        {
          name: 'Sunda Strait Corridor',
          color: 0x14b8a6,
          points: [
            { lat: -3.72, lng: 114.47 },  // Indonesia
            { lat: -5.92, lng: 105.75 },  // Sunda
            { lat: 20.26, lng: 86.67 }
          ],
          highlighted: highlightedChokepointId === 'sunda_strait'
        },
        {
          name: 'South Africa Richards Bay Track',
          color: 0x3b82f6,
          points: [
            { lat: -28.80, lng: 32.05 },
            { lat: 6.40, lng: 80.50 },
            { lat: 20.26, lng: 86.67 }
          ],
          highlighted: false
        }
      ];

      corridors.forEach(corr => {
        for (let i = 0; i < corr.points.length - 1; i++) {
          const p1 = corr.points[i];
          const p2 = corr.points[i + 1];
          const v1 = latLngToVector3(p1.lat, p1.lng, GLOBE_RADIUS);
          const v2 = latLngToVector3(p2.lat, p2.lng, GLOBE_RADIUS);
          
          const arcPoints = createArcCurve(v1, v2, GLOBE_RADIUS, 0.12);
          const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
          const arcMat = new THREE.LineBasicMaterial({
            color: corr.highlighted ? 0xff3344 : corr.color,
            linewidth: corr.highlighted ? 3 : 1.5,
            transparent: true,
            opacity: corr.highlighted ? 0.95 : 0.65
          });
          const line = new THREE.Line(arcGeo, arcMat);
          dynamicRoot.add(line);
        }
      });
    }

    // --- 1.5 MONSOON / WEATHER HAZARD ZONES (Translucent Surface Overlays) ---
    if (layers.weatherRadar) {
      monsoonZones.forEach(zone => {
        if (zone.coordinates.length < 3) return;

        const surfaceRadius = GLOBE_RADIUS * 1.004;
        const vertices = zone.coordinates.map(c => latLngToVector3(c.lat, c.lng, surfaceRadius));

        // Centroid pulled onto the sphere surface, used as the fan's shared vertex
        const centroid = vertices
          .reduce((acc, v) => acc.add(v), new THREE.Vector3())
          .divideScalar(vertices.length)
          .normalize()
          .multiplyScalar(surfaceRadius);

        const fanPositions: number[] = [];
        for (let i = 0; i < vertices.length; i++) {
          const next = vertices[(i + 1) % vertices.length];
          fanPositions.push(centroid.x, centroid.y, centroid.z);
          fanPositions.push(vertices[i].x, vertices[i].y, vertices[i].z);
          fanPositions.push(next.x, next.y, next.z);
        }

        const fanGeo = new THREE.BufferGeometry();
        fanGeo.setAttribute('position', new THREE.Float32BufferAttribute(fanPositions, 3));
        const fanMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const fanMesh = new THREE.Mesh(fanGeo, fanMat);
        dynamicRoot.add(fanMesh);

        const boundaryGeo = new THREE.BufferGeometry().setFromPoints(vertices);
        const boundaryMat = new THREE.LineBasicMaterial({
          color: 0xffb84d,
          transparent: true,
          opacity: 0.55
        });
        const boundaryLine = new THREE.LineLoop(boundaryGeo, boundaryMat);
        dynamicRoot.add(boundaryLine);

        const phaseSeed = zone.coordinates[0].lat + zone.coordinates[0].lng;
        monsoonPulseRefsRef.current.push({ mesh: fanMesh, baseOpacity: 0.16, phase: phaseSeed });
        monsoonPulseRefsRef.current.push({ mesh: boundaryLine, baseOpacity: 0.55, phase: phaseSeed + 1.5 });
      });
    }

    // --- 2. CHOKEPOINTS (3D Warning Diamonds & Glowing Rings) ---
    if (layers.chokepoints) {
      chokepoints.forEach(cp => {
        const pos = latLngToVector3(cp.lat, cp.lng, GLOBE_RADIUS * 1.012);
        const isTarget = highlightedChokepointId === cp.id || (selectedItem.type === 'CHOKEPOINT' && selectedItem.id === cp.id);

        const chokepointGroup = new THREE.Group();
        chokepointGroup.position.copy(pos);

        // Orient group perpendicular to globe center
        chokepointGroup.lookAt(pos.clone().multiplyScalar(2));

        // Diamond Marker Geometry
        const diamondGeo = new THREE.OctahedronGeometry(isTarget ? 0.032 : 0.022);
        const diamondMat = new THREE.MeshBasicMaterial({
          color: isTarget ? 0xff2222 : cp.riskLevel === 'ELEVATED' ? 0xff5533 : 0xffaa00,
          wireframe: false
        });
        const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
        chokepointGroup.add(diamondMesh);

        // Warning Radar Ring
        const ringGeo = new THREE.RingGeometry(isTarget ? 0.038 : 0.028, isTarget ? 0.046 : 0.034, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isTarget ? 0xff3333 : 0xffaa00,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isTarget ? 0.9 : 0.5
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        chokepointGroup.add(ringMesh);

        dynamicRoot.add(chokepointGroup);

        // Register for continuous ambient pulse (always-on hazard highlighting)
        chokepointPulseRefsRef.current.push({
          ring: ringMesh,
          baseOpacity: isTarget ? 0.9 : 0.5,
          phase: cp.lat + cp.lng
        });

        // Register interactive target
        interactiveObjectsRef.current.push({
          mesh: diamondMesh,
          type: 'CHOKEPOINT',
          data: cp
        });
      });
    }

    // --- 3. PORTS (3D Glowing Circular Nodes) ---
    if (layers.portNodes) {
      ports.forEach(port => {
        const pos = latLngToVector3(port.lat, port.lng, GLOBE_RADIUS * 1.008);
        const isSelected = selectedItem.type === 'PORT' && selectedItem.id === port.id;
        const isDischarge = port.type === 'DISCHARGE';

        const portGroup = new THREE.Group();
        portGroup.position.copy(pos);
        portGroup.lookAt(pos.clone().multiplyScalar(2));

        // Core Sphere Node
        const coreGeo = new THREE.SphereGeometry(isDischarge ? 0.018 : 0.014, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
          color: isDischarge ? 0x00f5d4 : 0xffffff
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        portGroup.add(coreMesh);

        // Halo Ring
        const haloGeo = new THREE.RingGeometry(isDischarge ? 0.024 : 0.018, isDischarge ? 0.030 : 0.022, 20);
        const haloMat = new THREE.MeshBasicMaterial({
          color: port.status === 'OPTIMAL' ? 0x00f5d4 : port.status === 'CONGESTED' ? 0xff3366 : 0xffaa00,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        portGroup.add(haloMesh);

        dynamicRoot.add(portGroup);

        // Register for raycasting click
        interactiveObjectsRef.current.push({
          mesh: coreMesh,
          type: 'PORT',
          data: port
        });
      });
    }

    // --- 4. AIS FLEET VESSELS (3D Ships with Heading Needles & Wake) ---
    if (layers.aisFleet) {
      vessels.forEach(vessel => {
        const pos = latLngToVector3(vessel.coordinates.lat, vessel.coordinates.lng, GLOBE_RADIUS * 1.015);
        const isSelected = selectedItem.type === 'VESSEL' && selectedItem.id === vessel.id;

        const vesselGroup = new THREE.Group();
        vesselGroup.position.copy(pos);
        vesselGroup.lookAt(pos.clone().multiplyScalar(2));

        // Heading rotation around normal axis
        vesselGroup.rotateZ(-vessel.heading * (Math.PI / 180));

        // Ship Hull (Cone / Pyramid pointing forward)
        const shipGeo = new THREE.ConeGeometry(isSelected ? 0.022 : 0.016, isSelected ? 0.045 : 0.032, 4);
        
        let vesselColor = 0xbc412b;
        if (vessel.vesselClass === 'Capesize' || vessel.vesselClass === 'Newcastlemax') vesselColor = 0xf59e0b;
        else if (vessel.vesselClass === 'Supramax') vesselColor = 0x14b8a6;
        else if (vessel.vesselClass === 'Handysize') vesselColor = 0x3b82f6;

        if (!vessel.isDraftCompliant) {
          vesselColor = 0xff2a4d; // Non-compliant hydrographic warning color
        }

        const shipMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x00f5d4 : vesselColor
        });
        const shipMesh = new THREE.Mesh(shipGeo, shipMat);
        shipMesh.rotateX(Math.PI * 0.5); // align with heading
        vesselGroup.add(shipMesh);

        // Pulsing Selection / Draft Halo
        if (isSelected || !vessel.isDraftCompliant) {
          const auraGeo = new THREE.RingGeometry(0.028, 0.036, 16);
          const auraMat = new THREE.MeshBasicMaterial({
            color: !vessel.isDraftCompliant ? 0xff2a4d : 0x00f5d4,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
          });
          const auraMesh = new THREE.Mesh(auraGeo, auraMat);
          vesselGroup.add(auraMesh);
        }

        dynamicRoot.add(vesselGroup);

        // Register interactive target
        interactiveObjectsRef.current.push({
          mesh: shipMesh,
          type: 'VESSEL',
          data: vessel
        });

        // 3D Wake Trail
        if (layers.aisWakeTrails && vessel.recentTrail && vessel.recentTrail.length > 1) {
          const trailPoints: THREE.Vector3[] = [];
          vessel.recentTrail.forEach(t => {
            trailPoints.push(latLngToVector3(t.lat, t.lng, GLOBE_RADIUS * 1.006));
          });
          trailPoints.push(pos);

          const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPoints);
          const trailMat = new THREE.LineBasicMaterial({
            color: isSelected ? 0x00f5d4 : vesselColor,
            transparent: true,
            opacity: isSelected ? 0.9 : 0.4
          });
          const trailLine = new THREE.Line(trailGeo, trailMat);
          dynamicRoot.add(trailLine);
        }
      });
    }

  }, [vessels, ports, chokepoints, monsoonZones, selectedItem, highlightedChokepointId, layers]);

  // Focus Camera smoothly on Lat/Lng target
  const focusOnCoordinates = useCallback((lat: number, lng: number) => {
    if (!globeGroupRef.current) return;
    
    // Target rotation angles to center lat, lng facing the camera (+Z axis)
    const targetY = -((lng + 90) * (Math.PI / 180));
    const targetX = (lat) * (Math.PI / 180);

    targetRotationRef.current = {
      x: Math.max(-Math.PI * 0.4, Math.min(Math.PI * 0.4, targetX)),
      y: targetY
    };
  }, []);

  // Trigger focus when targetFocusCoord changes
  useEffect(() => {
    if (targetFocusCoord) {
      focusOnCoordinates(targetFocusCoord.lat, targetFocusCoord.lng);
    }
  }, [targetFocusCoord, focusOnCoordinates]);

  // Mouse & Pointer Interactions (Drag Orbit & Click Raycasting)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    targetRotationRef.current = null; // cancel active tween
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current) return;

    // 1. Dragging Orbit
    if (isDraggingRef.current && globeGroupRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      const rotSpeed = 0.005;
      globeGroupRef.current.rotation.y += deltaX * rotSpeed;
      globeGroupRef.current.rotation.x += deltaY * rotSpeed;

      // Clamp X tilt
      globeGroupRef.current.rotation.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, globeGroupRef.current.rotation.x));

      rotationVelocityRef.current = {
        x: deltaX * rotSpeed * 0.2,
        y: deltaY * rotSpeed * 0.2
      };

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // 2. Hover Raycast Detection
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const meshes = interactiveObjectsRef.current.map(o => o.mesh);
    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const matched = interactiveObjectsRef.current.find(
        o => o.mesh === hitMesh || (hitMesh.parent && o.mesh === hitMesh.parent) || o.mesh.children.includes(hitMesh)
      );

      if (matched) {
        if (matched.type === 'VESSEL') {
          const v: TrackedVessel = matched.data;
          setHoveredInfo({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            title: v.name,
            subtitle: `${v.vesselClass} · ${v.sog} kts · ${v.destinationPort}`,
            type: 'VESSEL',
            badge: v.isDraftCompliant ? 'COMPLIANT' : 'DRAFT WARNING'
          });
        } else if (matched.type === 'PORT') {
          const p: PortMapPoint = matched.data;
          setHoveredInfo({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            title: p.name,
            subtitle: `${p.country} · Max Draft ${p.maxDraftM}m · Queue ~${p.currentWaitHours}h`,
            type: 'PORT',
            badge: p.status
          });
        } else if (matched.type === 'CHOKEPOINT') {
          const c: ChokepointMarker = matched.data;
          setHoveredInfo({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            title: c.name,
            subtitle: `Draft Limit: ${c.maxDraft} · ${c.riskLevel} Risk`,
            type: 'CHOKEPOINT',
            badge: 'CHOKEPOINT'
          });
        }
        return;
      }
    }

    setHoveredInfo(null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const meshes = interactiveObjectsRef.current.map(o => o.mesh);
    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const matched = interactiveObjectsRef.current.find(
        o => o.mesh === hitMesh || (hitMesh.parent && o.mesh === hitMesh.parent) || o.mesh.children.includes(hitMesh)
      );

      if (matched) {
        if (matched.type === 'VESSEL') {
          onSelectVessel(matched.data);
          focusOnCoordinates(matched.data.coordinates.lat, matched.data.coordinates.lng);
        } else if (matched.type === 'PORT') {
          onSelectPort(matched.data);
          focusOnCoordinates(matched.data.lat, matched.data.lng);
        } else if (matched.type === 'CHOKEPOINT') {
          onSelectChokepoint(matched.data);
          focusOnCoordinates(matched.data.lat, matched.data.lng);
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const zoomDelta = e.deltaY * 0.0015;
    cameraDistanceRef.current = Math.max(1.5, Math.min(4.8, cameraDistanceRef.current + zoomDelta));
    cameraRef.current.position.z = cameraDistanceRef.current;
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#04080D] select-none rounded-lg"
      style={{ minHeight: '520px' }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* 3D Viewport Tactical Compass / Orientation HUD */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-none">
        <div className="bg-[#0A141E]/80 backdrop-blur-md border border-[#1F3348] rounded px-3 py-1.5 text-[10px] font-mono-data text-[#8CB4D2] flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-ping" />
          <span className="font-bold text-[#E8ECE9]">3D SPHERICAL ORBIT</span>
          <span>·</span>
          <span>RAYCAST ACTIVE</span>
        </div>
      </div>

      {/* Interactive Tooltip Card */}
      {hoveredInfo && (
        <div
          className="absolute z-30 pointer-events-none bg-[#0D1824]/95 backdrop-blur-md border border-[#00f5d4]/50 rounded-lg p-2.5 shadow-2xl transition-all text-xs"
          style={{
            left: Math.min(containerRef.current?.clientWidth ? containerRef.current.clientWidth - 220 : 100, hoveredInfo.x + 15),
            top: Math.max(15, hoveredInfo.y - 45)
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-editorial font-bold text-sm text-[#E8ECE9]">{hoveredInfo.title}</span>
            {hoveredInfo.badge && (
              <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.2 rounded ${
                hoveredInfo.badge === 'DRAFT WARNING' || hoveredInfo.badge === 'CONGESTED'
                  ? 'bg-[#BC412B]/30 text-[#FF6B6B] border border-[#BC412B]/50'
                  : 'bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/40'
              }`}>
                {hoveredInfo.badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#A3B1AB] font-mono-data">{hoveredInfo.subtitle}</p>
          <p className="text-[9px] text-[#5A738E] mt-1 font-mono-data">Click to inspect dossier &amp; focus 3D camera</p>
        </div>
      )}

    </div>
  );
};
