import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { CaseStudyFeature } from "../content/case-studies";

type CaseStudyMap3DProps = {
  caseId: string;
  caseTitle: string;
  features: CaseStudyFeature[];
  activeFeatureId: string;
  onFeatureSelect: (featureId: string) => void;
};

function addBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  color: string,
  roughness = 0.72,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color, roughness }),
  );
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function addBeam(
  parent: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  color: string,
) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), 6),
    new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.38 }),
  );
  beam.position.copy(start).add(end).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  parent.add(beam);
}

function addCarStudio(map: THREE.Group) {
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 3.5, 0.12, 64),
    new THREE.MeshStandardMaterial({
      color: "#26312d",
      metalness: 0.45,
      roughness: 0.32,
    }),
  );
  floor.position.y = -0.58;
  map.add(floor);

  const car = new THREE.Group();
  map.add(car);
  const profile = new THREE.Shape();
  profile.moveTo(-1.6, -0.25);
  profile.lineTo(1.6, -0.25);
  profile.lineTo(1.6, 0.12);
  profile.lineTo(1.2, 0.28);
  profile.lineTo(0.72, 0.82);
  profile.lineTo(-0.62, 0.82);
  profile.lineTo(-1.08, 0.34);
  profile.lineTo(-1.6, 0.2);
  profile.closePath();
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(profile, {
      depth: 1.32,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      steps: 1,
    }),
    new THREE.MeshStandardMaterial({
      color: "#94aa99",
      metalness: 0.46,
      roughness: 0.25,
    }),
  );
  body.position.set(0, -0.08, -0.66);
  car.add(body);
  const windowShape = new THREE.Shape();
  windowShape.moveTo(-0.9, 0.4);
  windowShape.lineTo(-0.55, 0.75);
  windowShape.lineTo(0.62, 0.75);
  windowShape.lineTo(0.31, 0.4);
  windowShape.closePath();
  const windows = new THREE.Mesh(
    new THREE.ShapeGeometry(windowShape),
    new THREE.MeshStandardMaterial({
      color: "#243b3a",
      metalness: 0.28,
      roughness: 0.2,
      side: THREE.DoubleSide,
    }),
  );
  windows.position.set(0, 0, 0.68);
  car.add(windows);
  const farWindows = windows.clone();
  farWindows.position.z = -0.68;
  car.add(farWindows);
  addBox(car, [0.12, 0.12, 0.32], [1.64, 0.04, -0.42], "#e8d9a3", 0.26);
  addBox(car, [0.12, 0.12, 0.32], [1.64, 0.04, 0.42], "#e8d9a3", 0.26);

  for (const x of [-1.05, 1.02]) {
    for (const z of [-0.7, 0.7]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.22, 20),
        new THREE.MeshStandardMaterial({
          color: "#303a36",
          roughness: 0.62,
        }),
      );
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, -0.24, z * 1.16);
      car.add(wheel);
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.035, 16),
        new THREE.MeshStandardMaterial({
          color: "#b4b8a5",
          metalness: 0.76,
          roughness: 0.28,
        }),
      );
      hub.rotation.x = Math.PI / 2;
      hub.position.set(x, -0.24, z * 1.29);
      car.add(hub);
    }
  }

  for (const [x, z] of [
    [-2.65, -1.6],
    [2.65, -1.6],
  ]) {
    const softbox = addBox(map, [0.13, 2.7, 1.05], [x, 1.18, z], "#e2d9bb");
    softbox.rotation.z = -0.08;
  }
}

function addInteriorRoom(map: THREE.Group) {
  addBox(map, [7, 0.12, 4.2], [0, -0.62, 0], "#685c4b");
  addBox(map, [7, 3.2, 0.1], [0, 0.95, -2.05], "#b9b09b");
  addBox(map, [0.1, 3.2, 4.2], [-3.45, 0.95, 0], "#928b78");
  addBox(map, [0.1, 3.2, 4.2], [3.45, 0.95, 0], "#928b78");
  addBox(map, [7, 0.06, 0.06], [0, -0.52, -1.91], "#d0c6b1");
}

function addEiffelTower(map: THREE.Group) {
  const tower = new THREE.Group();
  tower.position.set(0, 0.15, -1.85);
  tower.scale.setScalar(1.18);
  map.add(tower);
  const bronze = "#bd9667";
  const feet = [
    new THREE.Vector3(-0.7, -0.55, -1.4),
    new THREE.Vector3(0.7, -0.55, -1.4),
    new THREE.Vector3(-0.7, -0.55, -0.1),
    new THREE.Vector3(0.7, -0.55, -0.1),
  ];
  const shoulders = feet.map(
    (foot) => new THREE.Vector3(foot.x * 0.36, 1.7, foot.z * 0.36 - 0.75),
  );
  feet.forEach((foot, index) => {
    addBeam(tower, foot, shoulders[index], 0.045, bronze);
    addBeam(
      tower,
      foot,
      shoulders[(index + 1) % shoulders.length],
      0.018,
      bronze,
    );
  });
  const waist = new THREE.Vector3(0, 1.7, -0.75);
  const crown = new THREE.Vector3(0, 2.75, -0.75);
  shoulders.forEach((shoulder) =>
    addBeam(tower, shoulder, waist, 0.035, bronze),
  );
  addBeam(tower, waist, crown, 0.025, bronze);
  addBeam(
    tower,
    new THREE.Vector3(-0.42, 1.05, -0.75),
    new THREE.Vector3(0.42, 1.05, -0.75),
    0.055,
    bronze,
  );
  addBeam(
    tower,
    new THREE.Vector3(-0.25, 1.72, -0.75),
    new THREE.Vector3(0.25, 1.72, -0.75),
    0.05,
    bronze,
  );
}

function addParisCity(map: THREE.Group) {
  const pavement = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.1, 5),
    new THREE.MeshStandardMaterial({ color: "#3e4643", roughness: 0.88 }),
  );
  pavement.position.set(0, -0.68, -1.1);
  map.add(pavement);
  const blocks = [
    [-3.05, 0.45, -2.4, 1.05, 1.6, 0.85],
    [2.95, 0.65, -2.35, 1.1, 2, 0.9],
    [-2.95, 0.28, 0.55, 0.9, 1.25, 0.85],
    [2.95, 0.35, 0.48, 1, 1.4, 0.85],
    [0, 0.2, -3.25, 1.2, 1, 0.8],
  ];
  blocks.forEach(([x, y, z, width, height, depth], index) => {
    const building = new THREE.Group();
    building.position.set(x, y - 0.62, z);
    map.add(building);
    const facade = ["#c7b69b", "#b8a88f", "#d0c3a9"][index % 3];
    addBox(building, [width, height, depth], [0, height / 2, 0], facade);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(width * 0.72, 0.36, index % 2 ? 4 : 8),
      new THREE.MeshStandardMaterial({ color: "#495253", roughness: 0.82 }),
    );
    roof.position.set(0, height + 0.18, 0);
    roof.rotation.y = index % 2 ? Math.PI / 4 : 0;
    building.add(roof);
    for (let row = 0; row < 2; row += 1) {
      for (let column = -1; column <= 1; column += 1) {
        addBox(
          building,
          [0.12, 0.18, 0.025],
          [column * width * 0.25, 0.28 + row * 0.36, depth / 2 + 0.02],
          "#59666a",
          0.35,
        );
      }
    }
  });
  addEiffelTower(map);
}

function addOfficeDesk(map: THREE.Group) {
  addBox(map, [5.2, 0.18, 2.3], [0, -0.25, 0], "#554b40");
  for (const x of [-2.25, 2.25]) {
    addBox(map, [0.14, 1.7, 0.14], [x, -1.1, 0], "#383c39");
  }
}

function createOfficeObject(index: number) {
  const object = new THREE.Group();
  if (index === 0) {
    addBox(object, [1.62, 1.02, 0.12], [0, 0.52, 0], "#b5b6a8", 0.42);
    addBox(object, [1.46, 0.86, 0.025], [0, 0.53, 0.07], "#557d70", 0.24);
    addBox(object, [1.3, 0.045, 0.015], [0, 0.85, 0.09], "#d4ddca", 0.42);
    for (const x of [-0.38, -0.08, 0.22, 0.52]) {
      addBox(object, [0.025, 0.56, 0.015], [x, 0.47, 0.09], "#a8c4ae", 0.45);
    }
    for (const y of [0.25, 0.42, 0.59]) {
      addBox(object, [1.3, 0.018, 0.015], [0, y, 0.09], "#a8c4ae", 0.45);
    }
    addBox(object, [0.18, 0.35, 0.2], [0, 0.02, 0], "#a79b80");
    addBox(object, [0.68, 0.05, 0.08], [0, -0.17, 0.02], "#a79b80");
  } else if (index === 1) {
    addBox(object, [1.22, 0.08, 0.42], [0, 0, 0], "#292e2d", 0.36);
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 12; column += 1) {
        addBox(
          object,
          [0.065, 0.018, 0.065],
          [-0.52 + column * 0.095, 0.05, -0.12 + row * 0.11],
          "#99988b",
          0.48,
        );
      }
    }
  } else if (index === 2) {
    const mouse = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 12),
      new THREE.MeshStandardMaterial({ color: "#454e4b", roughness: 0.35 }),
    );
    mouse.scale.set(0.72, 0.55, 1.2);
    mouse.position.y = 0.02;
    object.add(mouse);
    addBox(object, [0.015, 0.08, 0.01], [0, 0.11, 0.01], "#b2ad9c");
  } else if (index === 3) {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: "#c1a582" }),
    );
    cup.position.y = 0.15;
    object.add(cup);
    addBox(object, [0.5, 0.04, 0.38], [0.48, 0.04, 0], "#826d55");
    const notebook = addBox(
      object,
      [0.48, 0.035, 0.34],
      [0.48, 0.08, 0],
      "#738475",
    );
    notebook.rotation.y = -0.12;
  } else {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: "#8b6954" }),
    );
    base.position.y = 0.11;
    object.add(base);
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.58, 8),
      new THREE.MeshStandardMaterial({ color: "#a89a7f", metalness: 0.45 }),
    );
    stem.position.set(0, 0.48, 0);
    object.add(stem);
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.32, 16, 1, true),
      new THREE.MeshStandardMaterial({
        color: "#d2bf93",
        side: THREE.DoubleSide,
        metalness: 0.35,
      }),
    );
    shade.position.set(0, 0.8, 0);
    object.add(shade);
  }
  return object;
}

function createLabel(text: string, active: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.font = "600 43px Segoe UI, sans-serif";
  const labelWidth = Math.min(
    canvas.width - 40,
    Math.max(250, context.measureText(text).width + 72),
  );
  const left = (canvas.width - labelWidth) / 2;
  context.fillStyle = active
    ? "rgba(36, 49, 30, 0.96)"
    : "rgba(20, 25, 21, 0.94)";
  context.strokeStyle = active ? "#a9d965" : "#566151";
  context.lineWidth = 4;
  context.beginPath();
  context.roundRect(left, 12, labelWidth, 104, 23);
  context.fill();
  context.stroke();
  context.fillStyle = active ? "#e7f4d1" : "#c5cec0";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, 66, labelWidth - 48);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  texture.offset.x = left / canvas.width;
  texture.repeat.x = labelWidth / canvas.width;
  texture.needsUpdate = true;
  sprite.scale.set(Math.min(2.8, Math.max(1.55, labelWidth / 350)), 0.58, 1);
  sprite.position.set(0, 0.48, 0);
  return sprite;
}

function createParisBuilding(index: number, active: boolean) {
  const building = new THREE.Group();
  const width = index % 2 === 0 ? 0.78 : 0.66;
  const height = 0.88 + (index % 3) * 0.16;
  const facade = active ? "#e0c7a3" : "#c7b69b";
  addBox(building, [width, height, 0.62], [0, height / 2 - 0.25, 0], facade);

  if (index % 3 === 0) {
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(width * 0.74, 0.42, 4),
      new THREE.MeshStandardMaterial({ color: "#414c4d" }),
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = height - 0.02;
    building.add(roof);
  } else if (index % 3 === 1) {
    addBox(
      building,
      [width + 0.12, 0.12, 0.72],
      [0, height - 0.06, 0],
      "#434d4e",
    );
    addBox(
      building,
      [width * 0.62, 0.28, 0.52],
      [0, height + 0.12, 0],
      "#515b5a",
    );
  } else {
    const roof = new THREE.Mesh(
      new THREE.SphereGeometry(
        width * 0.43,
        12,
        8,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2,
      ),
      new THREE.MeshStandardMaterial({ color: "#4c5756" }),
    );
    roof.position.y = height - 0.02;
    building.add(roof);
  }

  for (let row = 0; row < 2; row += 1) {
    for (let column = -1; column <= 1; column += 1) {
      addBox(
        building,
        [0.09, 0.14, 0.025],
        [column * width * 0.27, 0.05 + row * 0.31, 0.32],
        "#59666a",
        0.35,
      );
    }
  }
  return building;
}

function createInteriorFurniture(index: number, active: boolean) {
  const furniture = new THREE.Group();
  const wood = active ? "#b99167" : "#92785e";
  const panel = active ? "#d8c9ae" : "#c2b49d";
  if (index % 3 === 0) {
    addBox(furniture, [0.9, 1.6, 0.48], [0, 0.35, 0], wood);
    addBox(furniture, [0.78, 1.42, 0.04], [0, 0.35, 0.26], panel);
    addBox(furniture, [0.02, 1.35, 0.03], [0, 0.35, 0.29], wood);
    for (const x of [-0.22, 0.22]) {
      const handle = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshStandardMaterial({ color: "#cfb77e", metalness: 0.72 }),
      );
      handle.position.set(x, 0.35, 0.34);
      furniture.add(handle);
    }
  } else if (index % 3 === 1) {
    addBox(furniture, [1.05, 0.54, 0.48], [0, -0.05, 0], wood);
    addBox(furniture, [1.18, 0.1, 0.58], [0, 0.28, 0], panel);
    addBox(furniture, [0.94, 0.4, 0.4], [0, 0.68, -0.04], wood);
    addBox(furniture, [0.96, 0.04, 0.42], [0, 0.88, -0.04], panel);
    for (const x of [-0.3, 0, 0.3]) {
      addBox(furniture, [0.015, 0.4, 0.02], [x, -0.05, 0.25], panel);
    }
  } else {
    addBox(furniture, [1.18, 0.48, 0.36], [0, -0.12, 0], wood);
    addBox(furniture, [1.28, 0.68, 0.08], [0, 0.48, -0.05], "#1e2828", 0.28);
    addBox(furniture, [1.18, 0.56, 0.025], [0, 0.49, 0], "#5e7774", 0.25);
    for (const x of [-0.35, 0, 0.35]) {
      addBox(furniture, [0.02, 0.4, 0.02], [x, -0.12, 0.19], panel);
    }
  }
  return furniture;
}

function CaseStudyMap3D({
  caseId,
  caseTitle,
  features,
  activeFeatureId,
  onFeatureSelect,
}: CaseStudyMap3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const renderRequestRef = useRef<(() => void) | null>(null);
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const featureCallbackRef = useRef(onFeatureSelect);
  const activeFeatureRef = useRef(activeFeatureId);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    pausedRef.current = isPaused;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !isPaused && !reducedMotionRef.current;
      renderRequestRef.current?.();
    }
  }, [isPaused]);

  useEffect(() => {
    featureCallbackRef.current = onFeatureSelect;
  }, [onFeatureSelect]);

  useEffect(() => {
    activeFeatureRef.current = activeFeatureId;
    mapRef.current?.children.forEach((child) => {
      if (typeof child.userData.featureId !== "string") return;
      const active = child.userData.featureId === activeFeatureId;
      child.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const material = object.material;
        if (
          object.userData.nodeSphere &&
          material instanceof THREE.MeshStandardMaterial
        ) {
          material.color.set(active ? "#c7ef79" : "#90b95b");
          material.emissive.set(active ? "#8fbf4d" : "#476a32");
          object.scale.setScalar(active ? 1.25 : 1);
        } else if (
          object.userData.nodeRing &&
          material instanceof THREE.MeshBasicMaterial
        ) {
          material.opacity = active ? 1 : 0.6;
        }
      });
    });
    renderRequestRef.current?.();
  }, [activeFeatureId]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    const lowPowerDisplay = window.matchMedia(
      "(max-width: 640px), (pointer: coarse)",
    ).matches;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !lowPowerDisplay,
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, lowPowerDisplay ? 1 : 1.5),
    );
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "case-map-canvas";
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute(
      "aria-label",
      `Interactive 3D system map for ${caseTitle}. Drag to rotate. Select a labeled component to explore its feature.`,
    );
    const fallback = mount.querySelector<HTMLElement>(".case-map-fallback");
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (fallback) fallback.style.display = "grid";
    };
    const handleContextRestored = () => {
      if (fallback) fallback.style.display = "none";
      renderer.render(scene, camera);
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      handleContextRestored,
    );
    mount.appendChild(renderer.domElement);
    if (fallback) fallback.style.display = "none";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 3.45, 7.7);

    scene.add(new THREE.HemisphereLight("#e3efd7", "#1c241d", 2.2));
    const keyLight = new THREE.DirectionalLight("#fff0d8", 3);
    keyLight.position.set(-4, 7, 6);
    scene.add(keyLight);
    scene.add(new THREE.AmbientLight("#afc79e", 0.65));

    const map = new THREE.Group();
    scene.add(map);
    mapRef.current = map;
    if (caseId === "omni-3d") addCarStudio(map);
    if (caseId === "homelane") addInteriorRoom(map);
    if (caseId === "geospatial") addParisCity(map);
    if (caseId === "timesheet-ai") addOfficeDesk(map);

    if (caseId === "webgl-editor") {
      const hub = new THREE.Mesh(
        new THREE.SphereGeometry(0.63, 32, 24),
        new THREE.MeshStandardMaterial({
          color: "#35492f",
          emissive: "#233b20",
          emissiveIntensity: 0.75,
          metalness: 0.45,
          roughness: 0.28,
        }),
      );
      hub.position.y = 0.55;
      map.add(hub);

      const hubRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.08, 0.012, 6, 96),
        new THREE.MeshBasicMaterial({
          color: "#82996a",
          transparent: true,
          opacity: 0.65,
        }),
      );
      hubRing.rotation.x = Math.PI / 2;
      hubRing.position.y = 0.55;
      map.add(hubRing);
    }

    const nodeGroups: THREE.Group[] = [];
    const nodeRadius = features.length > 4 ? 2.65 : 2.25;
    features.forEach((feature, index) => {
      const angle = (index / features.length) * Math.PI * 2 - Math.PI / 2;
      const node = new THREE.Group();
      if (caseId === "homelane") {
        node.position.set(
          (index - (features.length - 1) / 2) * 1.65,
          -0.18,
          0.68,
        );
      } else if (caseId === "geospatial") {
        node.position.set(
          (index - (features.length - 1) / 2) * 2.4,
          -0.3,
          0.95,
        );
      } else if (caseId === "timesheet-ai") {
        const deskPositions: [number, number, number][] = [
          [-1.2, -0.1, -0.62],
          [-0.42, -0.12, 0.48],
          [0.82, -0.12, 0.45],
          [-2.05, -0.12, 0.25],
          [2.02, -0.12, -0.3],
        ];
        node.position.set(...deskPositions[index % deskPositions.length]);
      } else {
        node.position.set(
          Math.cos(angle) * nodeRadius,
          0.35 + Math.sin(index * 1.7) * 0.26,
          Math.sin(angle) * nodeRadius * 0.64,
        );
      }
      node.userData.featureId = feature.id;
      node.userData.label = feature.title;
      node.userData.baseY = node.position.y;

      if (caseId === "homelane") {
        node.add(
          createInteriorFurniture(
            index,
            feature.id === activeFeatureRef.current,
          ),
        );
      } else if (caseId === "geospatial") {
        node.add(
          createParisBuilding(index, feature.id === activeFeatureRef.current),
        );
      } else if (caseId === "timesheet-ai") {
        node.add(createOfficeObject(index));
      } else {
        const sphere = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.24, 2),
          new THREE.MeshStandardMaterial({
            color: "#90b95b",
            emissive: "#476a32",
            emissiveIntensity: 0.7,
            metalness: 0.4,
            roughness: 0.3,
            flatShading: true,
          }),
        );
        sphere.userData.nodeSphere = true;
        node.add(sphere);

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.35, 0.012, 6, 48),
          new THREE.MeshBasicMaterial({
            color: "#9ac66d",
            transparent: true,
            opacity: 0.6,
          }),
        );
        ring.userData.nodeRing = true;
        ring.rotation.x = Math.PI / 2.8;
        node.add(ring);
      }

      if (caseId === "homelane" || caseId === "geospatial") {
        const baseRing = new THREE.Mesh(
          new THREE.TorusGeometry(
            caseId === "geospatial" ? 0.52 : 0.72,
            0.014,
            6,
            48,
          ),
          new THREE.MeshBasicMaterial({
            color: "#9ac66d",
            transparent: true,
            opacity: feature.id === activeFeatureRef.current ? 1 : 0.45,
          }),
        );
        baseRing.userData.nodeRing = true;
        baseRing.rotation.x = Math.PI / 2;
        baseRing.position.y = -0.48;
        node.add(baseRing);
      }

      const sceneLabels: Record<string, string[]> = {
        "omni-3d": [
          "PLATFORM",
          "PIXEL STREAM",
          "AI WORKFLOWS",
          "IMAGE GEN",
          "NODE GRAPH",
        ],
        homelane: ["WARDROBE", "KITCHEN", "TV UNIT"],
        geospatial: ["DATA SETS", "WEB WORKERS", "CITY / WEBVR"],
        "timesheet-ai": [
          "MONITOR",
          "KEYBOARD",
          "MOUSE",
          "DESK NOTES",
          "TASK LAMP",
        ],
      };
      const label = createLabel(
        sceneLabels[caseId]?.[index] ?? feature.title,
        feature.id === activeFeatureRef.current,
      );
      if (label) {
        if (caseId === "homelane") {
          label.position.y = 1.35;
        } else if (caseId === "geospatial") {
          label.position.y = 1.85;
        } else if (caseId === "timesheet-ai") {
          label.position.y = index === 0 ? 1.55 : 0.65;
        }
        node.add(label);
      }
      map.add(node);
      nodeGroups.push(node);
    });
    map.children.forEach((child) => {
      if (typeof child.userData.featureId !== "string") return;
      const active = child.userData.featureId === activeFeatureRef.current;
      child.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const material = object.material;
        if (
          object.userData.nodeSphere &&
          material instanceof THREE.MeshStandardMaterial
        ) {
          material.color.set(active ? "#c7ef79" : "#90b95b");
          material.emissive.set(active ? "#8fbf4d" : "#476a32");
          object.scale.setScalar(active ? 1.25 : 1);
        } else if (
          object.userData.nodeRing &&
          material instanceof THREE.MeshBasicMaterial
        ) {
          material.opacity = active ? 1 : 0.6;
        }
      });
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.55, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 6.5;
    controls.maxDistance = 10;
    controls.minPolarAngle = 0.72;
    controls.maxPolarAngle = 1.65;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reducedMotionRef.current = reducedMotion;
    controls.autoRotate = !reducedMotion && !pausedRef.current;
    controls.autoRotateSpeed = 0.2;
    controls.listenToKeyEvents(renderer.domElement);
    controls.update();
    controls.saveState();
    controlsRef.current = controls;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown: { x: number; y: number } | null = null;
    const handlePointerDown = (event: PointerEvent) => {
      pointerDown = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (!pointerDown) return;
      const moved = Math.hypot(
        event.clientX - pointerDown.x,
        event.clientY - pointerDown.y,
      );
      pointerDown = null;
      if (moved > 6) return;

      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(nodeGroups, true)[0];
      let target: THREE.Object3D | null = hit?.object ?? null;
      while (target && typeof target.userData.featureId !== "string") {
        target = target.parent;
      }
      if (target)
        featureCallbackRef.current(target.userData.featureId as string);
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const resizeObserver = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.render(scene, camera);
    });
    resizeObserver.observe(mount);

    let animationFrame = 0;
    const render = () => {
      animationFrame = 0;
      controls.update();
      if (
        !pausedRef.current &&
        !reducedMotionRef.current &&
        (caseId === "webgl-editor" || caseId === "omni-3d")
      ) {
        nodeGroups.forEach((node, index) => {
          node.position.y =
            node.userData.baseY +
            Math.sin(performance.now() * 0.0007 + index) * 0.035;
        });
      }
      renderer.render(scene, camera);
      if (!pausedRef.current && !reducedMotionRef.current) scheduleRender();
    };
    const scheduleRender = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };
    controls.addEventListener("change", scheduleRender);
    renderRequestRef.current = scheduleRender;
    scheduleRender();

    return () => {
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        handleContextLost,
      );
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        handleContextRestored,
      );
      controls.removeEventListener("change", scheduleRender);
      controls.dispose();
      controlsRef.current = null;
      renderRequestRef.current = null;
      mapRef.current = null;
      reducedMotionRef.current = false;
      map.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Sprite)) {
          return;
        }
        object.geometry?.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => {
          if (material instanceof THREE.SpriteMaterial) {
            material.map?.dispose();
          }
          material.dispose();
        });
      });
      scene.clear();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [caseId, caseTitle, features]);

  return (
    <div className="case-map-stage">
      <div className="case-map-canvas-wrap" ref={mountRef}>
        <div className="case-map-fallback" role="status">
          Interactive 3D system map is unavailable in this browser. Use the
          feature selectors below.
        </div>
      </div>
      <span className="case-map-hint">DRAG TO ROTATE · SELECT A FEATURE</span>
      <div className="case-map-actions">
        {prefersReducedMotion ? (
          <span>Animation paused for reduced motion</span>
        ) : (
          <button
            type="button"
            aria-pressed={isPaused}
            onClick={() => setIsPaused((paused) => !paused)}
          >
            {isPaused ? "Resume animation" : "Pause animation"}
          </button>
        )}
        <button type="button" onClick={() => controlsRef.current?.reset()}>
          Reset view
        </button>
      </div>
    </div>
  );
}

export default CaseStudyMap3D;
