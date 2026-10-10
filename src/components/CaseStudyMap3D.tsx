import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { CaseStudyFeature } from "../content/case-studies";

type CaseStudyMap3DProps = {
  caseTitle: string;
  features: CaseStudyFeature[];
  activeFeatureId: string;
  onFeatureSelect: (featureId: string) => void;
};

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

function CaseStudyMap3D({
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
    const hub = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.78, 2),
      new THREE.MeshStandardMaterial({
        color: "#35492f",
        emissive: "#233b20",
        emissiveIntensity: 0.75,
        metalness: 0.45,
        roughness: 0.28,
        flatShading: true,
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

    const nodeGroups: THREE.Group[] = [];
    const nodeRadius = features.length > 4 ? 2.65 : 2.25;
    features.forEach((feature, index) => {
      const angle = (index / features.length) * Math.PI * 2 - Math.PI / 2;
      const node = new THREE.Group();
      node.position.set(
        Math.cos(angle) * nodeRadius,
        0.35 + Math.sin(index * 1.7) * 0.26,
        Math.sin(angle) * nodeRadius * 0.64,
      );
      node.userData.featureId = feature.id;
      node.userData.label = feature.title;
      node.userData.baseY = 0.35 + Math.sin(index * 1.7) * 0.26;

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

      const label = createLabel(
        feature.title,
        feature.id === activeFeatureRef.current,
      );
      if (label) node.add(label);
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
      if (!pausedRef.current && !reducedMotionRef.current) {
        hub.rotation.y += 0.002;
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
  }, [caseTitle, features]);

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
