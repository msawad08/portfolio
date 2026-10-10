import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import carModelUrl from "../assets/3d-models/low-poly_toyota_corolla_e80_sedan.glb?url";
import cameraModelUrl from "../assets/3d-models/camera.glb?url";
import eiffelModelUrl from "../assets/3d-models/Eiffel.glb?url";
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
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(2.9, 2.96, 0.24, 64),
    new THREE.MeshStandardMaterial({
      color: "#5b655f",
      metalness: 0.45,
      roughness: 0.32,
    }),
  );
  platform.position.y = -0.68;
  map.add(platform);
  const studioDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(2.85, 2.85, 0.035, 64),
    new THREE.MeshStandardMaterial({
      color: "#252e2a",
      metalness: 0.28,
      roughness: 0.34,
    }),
  );
  studioDeck.position.y = -0.535;
  map.add(studioDeck);
  const stageRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.83, 0.018, 8, 96),
    new THREE.MeshStandardMaterial({
      color: "#9cad94",
      metalness: 0.6,
      roughness: 0.3,
    }),
  );
  stageRing.rotation.x = Math.PI / 2;
  stageRing.position.y = -0.51;
  map.add(stageRing);
}

function createCameraFallback() {
  const rig = new THREE.Group();
  const legs: [number, number, number][] = [
    [-0.38, -0.48, -0.34],
    [0.38, -0.48, -0.34],
    [0, -0.48, 0.42],
  ];
  for (const [x, y, z] of legs) {
    addBeam(
      rig,
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(x, y, z),
      0.035,
      "#38413c",
    );
  }
  addBox(rig, [0.96, 0.58, 0.5], [0, 0.62, -0.08], "#39443e", 0.32);
  addBox(rig, [0.52, 0.39, 0.035], [0, 0.63, 0.18], "#7b9480", 0.25);
  addBox(rig, [0.4, 0.1, 0.13], [0, 0.98, -0.08], "#313b36", 0.38);
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.19, 0.34, 20),
    new THREE.MeshStandardMaterial({
      color: "#222b29",
      metalness: 0.62,
      roughness: 0.2,
    }),
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.6, 0.39);
  rig.add(lens);
  const lensGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 20),
    new THREE.MeshBasicMaterial({ color: "#91b9ae" }),
  );
  lensGlass.position.set(0, 0.6, 0.58);
  rig.add(lensGlass);
  return rig;
}

function fitModelToHeight(model: THREE.Object3D, height: number) {
  model.updateMatrixWorld(true);
  const initialBounds = new THREE.Box3().setFromObject(model);
  const initialSize = initialBounds.getSize(new THREE.Vector3());
  const largestDimension = Math.max(
    initialSize.x,
    initialSize.y,
    initialSize.z,
  );
  if (!Number.isFinite(largestDimension) || largestDimension <= 0) {
    throw new Error("3D model has no measurable geometry.");
  }

  model.scale.multiplyScalar(height / largestDimension);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= bounds.min.y;
  model.position.z -= center.z;
  return model;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((material) => {
      if ("map" in material && material.map instanceof THREE.Texture) {
        material.map.dispose();
      }
      material.dispose();
    });
  });
}

function updateFeatureVisuals(map: THREE.Group, activeFeatureId: string) {
  map.traverse((featureNode) => {
    if (typeof featureNode.userData.featureId !== "string") return;
    const active = featureNode.userData.featureId === activeFeatureId;
    featureNode.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const material = object.material;
      if (
        object.userData.featureSphere &&
        material instanceof THREE.MeshStandardMaterial
      ) {
        material.color.set(
          active ? "#e7e5b0" : String(object.userData.baseColor ?? "#78a9a2"),
        );
        material.emissiveIntensity = active ? 0.45 : 0.12;
      }
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
}

function createPlatformRack() {
  const rack = new THREE.Group();
  addBox(rack, [0.82, 1.2, 0.62], [0, 0.58, 0], "#3b4540", 0.34);
  addBox(rack, [0.72, 0.22, 0.04], [0, 0.96, 0.33], "#202926", 0.28);
  for (let row = 0; row < 3; row += 1) {
    addBox(
      rack,
      [0.68, 0.025, 0.035],
      [0, 0.7 - row * 0.28, 0.34],
      "#899488",
      0.4,
    );
    for (let light = 0; light < 4; light += 1) {
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshBasicMaterial({
          color: light % 2 === 0 ? "#a6cb84" : "#d5b875",
        }),
      );
      led.position.set(-0.24 + light * 0.16, 0.62 - row * 0.28, 0.37);
      rack.add(led);
    }
  }
  for (const x of [-0.34, 0.34]) {
    for (const z of [-0.24, 0.24]) {
      addBox(rack, [0.08, 0.12, 0.08], [x, -0.03, z], "#313a35");
    }
  }
  return rack;
}

function createCinematicSequence() {
  const sequence = new THREE.Group();
  sequence.position.y = -0.16;
  addBox(sequence, [1.38, 0.13, 0.56], [0, 0.12, 0], "#303a35", 0.42);

  const slate = new THREE.Group();
  addBox(slate, [0.82, 0.58, 0.09], [0, 0.78, 0], "#303936", 0.38);
  addBox(slate, [0.86, 0.12, 0.13], [0, 1.13, 0], "#b5b8a3", 0.56);
  for (const x of [-0.29, -0.1, 0.1, 0.29]) {
    const stripe = addBox(
      slate,
      [0.09, 0.12, 0.015],
      [x, 1.13, 0.075],
      "#46534a",
      0.58,
    );
    stripe.rotation.z = -0.42;
  }
  slate.rotation.z = -0.08;
  sequence.add(slate);

  for (let track = 0; track < 3; track += 1) {
    const z = -0.19 + track * 0.18;
    addBox(sequence, [1.18, 0.035, 0.035], [0, 0.25, z], "#84927e", 0.52);
    for (let keyframe = 0; keyframe < 4; keyframe += 1) {
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.055, 0),
        new THREE.MeshStandardMaterial({
          color: keyframe === 2 ? "#dfc480" : "#91b0a0",
          emissive: keyframe === 2 ? "#66502e" : "#34463d",
          roughness: 0.4,
        }),
      );
      marker.position.set(-0.48 + keyframe * 0.32, 0.3, z);
      sequence.add(marker);
    }
  }

  addBox(sequence, [0.035, 0.42, 0.035], [0.16, 0.38, 0.12], "#d4bc7b", 0.38);
  return sequence;
}

function createSceneLightRig() {
  const rig = new THREE.Group();

  for (const side of [-1, 1]) {
    const x = side * 0.48;
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.055, 16),
      new THREE.MeshStandardMaterial({ color: "#39423c", roughness: 0.62 }),
    );
    foot.position.set(x, 0, 0);
    rig.add(foot);
    addBeam(
      rig,
      new THREE.Vector3(x, 0.03, 0),
      new THREE.Vector3(x, 1.18, 0),
      0.035,
      "#727e70",
    );
    const softbox = addBox(
      rig,
      [0.58, 0.72, 0.12],
      [x, 1.32, 0],
      "#414b43",
      0.48,
    );
    softbox.rotation.z = side * -0.1;
    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.62, 0.025),
      new THREE.MeshStandardMaterial({
        color: "#eee2c2",
        emissive: "#b5a878",
        emissiveIntensity: 0.8,
        roughness: 0.46,
      }),
    );
    diffuser.position.set(x, 1.32, 0.075);
    diffuser.rotation.z = softbox.rotation.z;
    rig.add(diffuser);
    addBeam(
      rig,
      new THREE.Vector3(x, 0.03, 0),
      new THREE.Vector3(x - side * 0.31, -0.02, 0.24),
      0.022,
      "#59655a",
    );
  }

  return rig;
}

function createOmniFeature(index: number) {
  if (index === 0) {
    const placeholder = new THREE.Group();
    placeholder.userData.modelFallback = true;
    return placeholder;
  }
  if (index === 1) {
    const placeholder = createCameraFallback();
    placeholder.userData.modelFallback = true;
    return placeholder;
  }
  if (index === 2) return createCinematicSequence();
  if (index === 3) return createSceneLightRig();
  return createPlatformRack();
}

function createEditorPlanet(index: number, active: boolean) {
  const planet = new THREE.Group();
  const colors = ["#c98764", "#78a9a2", "#d2b675", "#8393bd", "#b47782"];
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.23 + (index % 2) * 0.06, 24, 18),
    new THREE.MeshStandardMaterial({
      color: active ? "#d3e69a" : colors[index % colors.length],
      emissive: colors[index % colors.length],
      emissiveIntensity: active ? 0.45 : 0.12,
      roughness: 0.42,
      metalness: 0.08,
    }),
  );
  sphere.userData.featureSphere = true;
  sphere.userData.baseColor = colors[index % colors.length];
  planet.add(sphere);
  return planet;
}

function addInteriorRoom(map: THREE.Group) {
  addBox(map, [7, 0.12, 4.2], [0, -0.62, 0], "#685c4b");
  addBox(map, [7, 3.2, 0.1], [0, 0.95, -2.05], "#b9b09b");
  addBox(map, [0.1, 3.2, 4.2], [-3.45, 0.95, 0], "#928b78");
  addBox(map, [0.1, 3.2, 4.2], [3.45, 0.95, 0], "#928b78");
  addBox(map, [7, 0.06, 0.06], [0, -0.52, -1.91], "#d0c6b1");
}

function addParisCity(map: THREE.Group) {
  const tileZoom = 16;
  const tileSize = 2.35;
  const tower = { latitude: 48.8584, longitude: 2.2945 };
  const tileCount = 2 ** tileZoom;
  const towerTileX = ((tower.longitude + 180) / 360) * tileCount;
  const latitudeRadians = (tower.latitude * Math.PI) / 180;
  const towerTileY =
    ((1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2) * tileCount;
  const centerTile = { x: Math.floor(towerTileX), y: Math.floor(towerTileY) };
  const towerPosition = {
    x: (towerTileX - centerTile.x - 0.5) * tileSize,
    z: (towerTileY - centerTile.y - 0.5) * tileSize,
  };
  addBox(map, [tileSize * 3, 0.14, tileSize * 3], [0, -0.7, 0], "#39413b");
  const tiles = new THREE.Group();
  map.add(tiles);
  const tileLoader = new THREE.TextureLoader();
  tileLoader.setCrossOrigin("anonymous");
  for (let row = -1; row <= 1; row += 1) {
    for (let column = -1; column <= 1; column += 1) {
      const material = new THREE.MeshBasicMaterial({ color: "#d2d3c6" });
      const tile = new THREE.Mesh(
        new THREE.PlaneGeometry(tileSize, tileSize),
        material,
      );
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(column * tileSize, -0.625, row * tileSize);
      tiles.add(tile);

      const x = centerTile.x + column;
      const y = centerTile.y + row;
      tileLoader.load(
        `https://tile.openstreetmap.org/${tileZoom}/${x}/${y}.png`,
        (texture) => {
          if (map.userData.disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.color.set("#ffffff");
          material.needsUpdate = true;
        },
        undefined,
        (error: unknown) => {
          console.warn(`Unable to load Paris map tile ${x}/${y}`, error);
        },
      );
    }
  }

  const eiffelAnchor = new THREE.Group();
  eiffelAnchor.name = "eiffel-tower-anchor";
  eiffelAnchor.position.set(towerPosition.x, -0.62, towerPosition.z);
  map.add(eiffelAnchor);
}

function addOfficeDesk(map: THREE.Group) {
  addBox(map, [5.4, 0.18, 2.5], [0, -0.25, 0], "#554b40");
  for (const x of [-2.35, 2.35]) {
    for (const z of [-0.9, 0.9]) {
      addBox(map, [0.14, 1.7, 0.14], [x, -1.1, z], "#383c39");
    }
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
    const wardrobe = new THREE.Group();
    addBox(wardrobe, [0.9, 1.6, 0.48], [0, 0.35, 0], wood);
    addBox(wardrobe, [0.78, 1.42, 0.04], [0, 0.35, 0.26], panel);
    addBox(wardrobe, [0.02, 1.35, 0.03], [0, 0.35, 0.29], wood);
    for (const x of [-0.22, 0.22]) {
      const handle = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshStandardMaterial({ color: "#cfb77e", metalness: 0.72 }),
      );
      handle.position.set(x, 0.35, 0.34);
      wardrobe.add(handle);
    }
    wardrobe.position.y = -0.11;
    furniture.add(wardrobe);
  } else if (index % 3 === 1) {
    const cabinet = new THREE.Group();
    addBox(cabinet, [1.05, 0.6, 0.48], [0, -0.05, 0], wood);
    addBox(cabinet, [1.18, 0.1, 0.58], [0, 0.28, 0], panel);
    addBox(cabinet, [1.05, 0.4, 0.4], [0, 0.98, -0.04], wood);
    addBox(cabinet, [1.05, 0.04, 0.42], [0, 1.18, -0.04], panel);
    for (const x of [-0.3, 0, 0.3]) {
      addBox(cabinet, [0.015, 0.4, 0.02], [x, -0.05, 0.25], panel);
    }
    cabinet.position.y = -0.21;
    furniture.add(cabinet);
  } else {
    const tvCabinet = new THREE.Group();
    addBox(tvCabinet, [1.18, 0.48, 0.36], [0, -0.12, 0], wood);
    addBox(tvCabinet, [1.28, 0.68, 0.08], [0, 0.48, -0.05], "#1e2828", 0.28);
    addBox(tvCabinet, [1.18, 0.56, 0.025], [0, 0.49, 0], "#5e7774", 0.25);
    for (const x of [-0.35, 0, 0.35]) {
      addBox(tvCabinet, [0.02, 0.4, 0.02], [x, -0.12, 0.19], panel);
    }
    tvCabinet.position.y = -0.2;
    furniture.add(tvCabinet);
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
    if (mapRef.current) updateFeatureVisuals(mapRef.current, activeFeatureId);
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
    camera.position.set(
      0,
      caseId === "omni-3d" ? 3.1 : 3.45,
      caseId === "omni-3d" ? 8.2 : caseId === "geospatial" ? 10.5 : 7.7,
    );

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
    const modelTargets: {
      parent: THREE.Group;
      url: string;
      height: number;
      rotationY: number;
    }[] = [];
    const orbitPivots: { group: THREE.Group; speed: number }[] = [];

    if (caseId === "webgl-editor") {
      const hub = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 24),
        new THREE.MeshStandardMaterial({
          color: "#e4bd70",
          emissive: "#b77835",
          emissiveIntensity: 1.2,
          metalness: 0.1,
          roughness: 0.42,
        }),
      );
      hub.position.y = 0.55;
      map.add(hub);
      const sunLight = new THREE.PointLight("#f4c77c", 2.5, 8);
      sunLight.position.copy(hub.position);
      map.add(sunLight);
      features.forEach((_, index) => {
        const radius = 1.25 + index * 0.75;
        const orbitPath = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.012, 6, 96),
          new THREE.MeshBasicMaterial({
            color: "#87977b",
            transparent: true,
            opacity: 0.38,
            depthWrite: false,
          }),
        );
        orbitPath.rotation.x = Math.PI / 2;
        orbitPath.position.y = hub.position.y;
        map.add(orbitPath);
      });
    }

    const nodeGroups: THREE.Group[] = [];
    const nodeRadius = features.length > 4 ? 2.65 : 2.25;
    features.forEach((feature, index) => {
      const angle = (index / features.length) * Math.PI * 2 - Math.PI / 2;
      const node = new THREE.Group();
      let nodeParent = map;
      if (caseId === "omni-3d") {
        const studioPositions: [number, number, number][] = [
          [0, -0.5, 0],
          [2.2, -0.52, 0.95],
          [-2.15, -0.52, 0.95],
          [-2.15, -0.52, -1.15],
          [2.2, -0.52, -1.15],
        ];
        node.position.set(...studioPositions[index % studioPositions.length]);
      } else if (caseId === "homelane") {
        const roomPositions: [number, number, number][] = [
          [-2.25, 0, -1.42],
          [0, 0, -1.42],
          [2.25, 0, -1.42],
          [-1.15, 0, 0.35],
          [1.15, 0, 0.35],
        ];
        node.position.set(...roomPositions[index % roomPositions.length]);
      } else if (caseId === "geospatial") {
        const cityPositions: [number, number, number][] = [
          [-2.65, -0.3, -2.2],
          [2.55, -0.3, -2.35],
          [-2.8, -0.3, 1.2],
          [2.85, -0.3, 1.15],
          [0.15, -0.3, 3.05],
        ];
        node.position.set(...cityPositions[index % cityPositions.length]);
      } else if (caseId === "timesheet-ai") {
        const deskPositions: [number, number, number][] = [
          [-1.35, -0.16, -0.48],
          [-0.15, -0.14, 0.57],
          [1.08, -0.08, 0.48],
          [-2.02, -0.16, 0.54],
          [2.02, -0.16, -0.28],
        ];
        node.position.set(...deskPositions[index % deskPositions.length]);
      } else if (caseId === "webgl-editor") {
        const orbitRadius = 1.25 + index * 0.75;
        node.position.set(orbitRadius, 0, 0);
        const pivot = new THREE.Group();
        pivot.position.set(0, 0.55, 0);
        pivot.rotation.y = angle;
        map.add(pivot);
        orbitPivots.push({
          group: pivot,
          speed: 0.46 / (1 + index * 0.32),
        });
        nodeParent = pivot;
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

      if (caseId === "omni-3d") {
        node.add(createOmniFeature(index));
        if (index === 0) {
          modelTargets.push({
            parent: node,
            url: carModelUrl,
            height: 2.5,
            rotationY: Math.PI / 2,
          });
        } else if (index === 1) {
          modelTargets.push({
            parent: node,
            url: cameraModelUrl,
            height: 1.45,
            rotationY: 160 * (Math.PI / 180),
          });
        } else {
          const display = node.children.find(
            (child) =>
              child instanceof THREE.Group && !child.userData.modelFallback,
          );
          if (display) display.scale.setScalar(index === 4 ? 0.72 : 1);
        }
      } else if (caseId === "homelane") {
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
      } else if (caseId === "webgl-editor") {
        node.add(
          createEditorPlanet(index, feature.id === activeFeatureRef.current),
        );
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

      const label = createLabel(feature.title, false);
      if (label) label.visible = false;
      if (label) {
        label.position.y =
          caseId === "geospatial" ? 1.85 : caseId === "omni-3d" ? 1.65 : 1.35;
        node.userData.hoverLabel = label;
        node.add(label);
      }
      nodeParent.add(node);
      nodeGroups.push(node);
    });
    if (caseId === "geospatial") {
      const eiffelAnchor = map.getObjectByName("eiffel-tower-anchor");
      if (eiffelAnchor instanceof THREE.Group) {
        modelTargets.push({
          parent: eiffelAnchor,
          url: eiffelModelUrl,
          height: 3.8,
          rotationY: 0,
        });
      }
    }
    let disposed = false;
    const modelLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
    modelLoader.setDRACOLoader(dracoLoader);
    modelTargets.forEach(({ parent, url, height, rotationY }) => {
      void modelLoader
        .loadAsync(url)
        .then(({ scene: model }) => {
          if (disposed) {
            disposeObject(model);
            return;
          }
          const fallback = parent.children.find(
            (child) => child.userData.modelFallback,
          );
          if (fallback) {
            parent.remove(fallback);
            disposeObject(fallback);
          }
          const fittedModel = fitModelToHeight(model, height);
          fittedModel.rotation.y = rotationY;
          fittedModel.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            child.castShadow = true;
            child.receiveShadow = true;
          });
          parent.add(fittedModel);
          renderRequestRef.current?.();
        })
        .catch((error: unknown) => {
          console.error(`Unable to load 3D model: ${url}`, error);
        });
    });
    updateFeatureVisuals(map, activeFeatureRef.current);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(
      0,
      caseId === "geospatial" ? 0.05 : caseId === "omni-3d" ? 0.05 : 0.55,
      0,
    );
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance =
      caseId === "omni-3d" ? 7.5 : caseId === "geospatial" ? 8.8 : 6.5;
    controls.maxDistance =
      caseId === "omni-3d" ? 11 : caseId === "geospatial" ? 14 : 10;
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
    let hoveredNode: THREE.Group | null = null;
    const setHoveredNode = (node: THREE.Group | null) => {
      if (hoveredNode === node) return;
      if (hoveredNode?.userData.hoverLabel instanceof THREE.Sprite) {
        hoveredNode.userData.hoverLabel.visible = false;
      }
      hoveredNode = node;
      if (hoveredNode?.userData.hoverLabel instanceof THREE.Sprite) {
        hoveredNode.userData.hoverLabel.visible = true;
      }
      renderer.domElement.style.cursor = hoveredNode ? "pointer" : "grab";
      renderRequestRef.current?.();
    };
    const featureAtPointer = (event: PointerEvent) => {
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
      return target instanceof THREE.Group ? target : null;
    };
    const handlePointerMove = (event: PointerEvent) => {
      setHoveredNode(featureAtPointer(event));
    };
    const handlePointerLeave = () => setHoveredNode(null);
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

      const target = featureAtPointer(event);
      if (target)
        featureCallbackRef.current(target.userData.featureId as string);
    };
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
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
    let previousFrameTime = 0;
    const render = (timestamp: number) => {
      animationFrame = 0;
      const delta = previousFrameTime
        ? Math.min((timestamp - previousFrameTime) / 1000, 0.05)
        : 0;
      previousFrameTime = timestamp;
      if (
        caseId === "webgl-editor" &&
        !pausedRef.current &&
        !reducedMotionRef.current
      ) {
        orbitPivots.forEach(({ group, speed }) => {
          group.rotation.y += delta * speed;
        });
      }
      controls.update();
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
      disposed = true;
      dracoLoader.dispose();
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
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
      map.userData.disposed = true;
      map.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Sprite)) {
          return;
        }
        object.geometry?.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => {
          if (
            (material instanceof THREE.SpriteMaterial || "map" in material) &&
            material.map instanceof THREE.Texture
          ) {
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
      {caseId === "geospatial" && (
        <a
          className="case-map-attribution"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          Map tiles and data © OpenStreetMap contributors · ODbL
        </a>
      )}
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
