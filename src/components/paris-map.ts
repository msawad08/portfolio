import * as THREE from "three";

const PARIS_TILE_ZOOM = 16;
const PARIS_TILE_SIZE = 3.05;
const PARIS_TILE_RADIUS = 4;
const PARIS_TILE_COUNT = PARIS_TILE_RADIUS * 2 + 1;
const PARIS_CORE_RADIUS = 1;
const PARIS_BUILDING_HEIGHT_SCALE = 0.012;
const PARIS_LOW_DETAIL_BUILDING_LIMIT = 3000;
export const PARIS_MAP_VIEW_WIDTH = PARIS_TILE_SIZE * 3;

export type ParisMapProjection = {
  tileZoom: number;
  tileSize: number;
  centerTileX: number;
  centerTileY: number;
};

type ParisTileRequest = {
  x: number;
  y: number;
  material: THREE.MeshBasicMaterial;
};

type OSMBuildingWay = {
  id: number;
  tags?: Record<string, string>;
  geometry: { lat: number; lon: number }[];
};

type OSMBuildingCenter = {
  id: number;
  tags?: Record<string, string>;
  center: { lat: number; lon: number };
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
};

type ProjectedBuilding = {
  way: OSMBuildingWay;
  points: THREE.Vector2[];
  center: THREE.Vector2;
  area: number;
};

type ProjectedBuildingCenter = {
  building: OSMBuildingCenter;
  center: THREE.Vector2;
  width: number;
  depth: number;
};

function addParisGround(map: THREE.Group, size: number) {
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(size, 0.14, size),
    new THREE.MeshStandardMaterial({ color: "#39413b", roughness: 0.82 }),
  );
  ground.position.set(0, -0.7, 0);
  map.add(ground);
}

function longitudeToTile(longitude: number, zoom: number) {
  return ((longitude + 180) / 360) * 2 ** zoom;
}

function latitudeToTile(latitude: number, zoom: number) {
  const radians = (latitude * Math.PI) / 180;
  return ((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * 2 ** zoom;
}

function projectParisCoordinate(
  latitude: number,
  longitude: number,
  projection: ParisMapProjection,
) {
  return new THREE.Vector2(
    (longitudeToTile(longitude, projection.tileZoom) -
      projection.centerTileX -
      0.5) *
      projection.tileSize,
    (latitudeToTile(latitude, projection.tileZoom) -
      projection.centerTileY -
      0.5) *
      projection.tileSize,
  );
}

function tileToLongitude(tileX: number, zoom: number) {
  return (tileX / 2 ** zoom) * 360 - 180;
}

function tileToLatitude(tileY: number, zoom: number) {
  return (
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * tileY) / 2 ** zoom))) * 180) /
    Math.PI
  );
}

function getParisTileBounds(projection: ParisMapProjection, radius: number) {
  return {
    west: tileToLongitude(projection.centerTileX - radius, projection.tileZoom),
    east: tileToLongitude(
      projection.centerTileX + radius + 1,
      projection.tileZoom,
    ),
    north: tileToLatitude(projection.centerTileY - radius, projection.tileZoom),
    south: tileToLatitude(
      projection.centerTileY + radius + 1,
      projection.tileZoom,
    ),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}

function isCoordinate(value: unknown): value is { lat: number; lon: number } {
  return (
    isRecord(value) &&
    typeof value.lat === "number" &&
    Number.isFinite(value.lat) &&
    typeof value.lon === "number" &&
    Number.isFinite(value.lon)
  );
}

function hasBuildingWayGeometry(value: unknown): value is OSMBuildingWay {
  return (
    isRecord(value) &&
    value.type === "way" &&
    typeof value.id === "number" &&
    Number.isFinite(value.id) &&
    Array.isArray(value.geometry) &&
    value.geometry.length >= 4 &&
    value.geometry.every(isCoordinate) &&
    (!("tags" in value) || isStringRecord(value.tags))
  );
}

function hasBuildingCenter(value: unknown): value is OSMBuildingCenter {
  if (
    !isRecord(value) ||
    value.type !== "way" ||
    typeof value.id !== "number" ||
    !Number.isFinite(value.id) ||
    !isCoordinate(value.center) ||
    ("tags" in value && !isStringRecord(value.tags))
  ) {
    return false;
  }
  const bounds = value.bounds;
  return (
    bounds === undefined ||
    (isRecord(bounds) &&
      typeof bounds.minlat === "number" &&
      typeof bounds.minlon === "number" &&
      typeof bounds.maxlat === "number" &&
      typeof bounds.maxlon === "number" &&
      Number.isFinite(bounds.minlat) &&
      Number.isFinite(bounds.minlon) &&
      Number.isFinite(bounds.maxlat) &&
      Number.isFinite(bounds.maxlon))
  );
}

async function requestParisOverpassElements(query: string) {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  const failures: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(
        `${endpoint}?data=${encodeURIComponent(query)}`,
        { signal: AbortSignal.timeout(25000) },
      );
      if (!response.ok) {
        throw new Error(`Overpass returned HTTP ${response.status}.`);
      }
      const data: unknown = await response.json();
      if (!isRecord(data) || !Array.isArray(data.elements)) {
        throw new Error("Overpass returned an invalid building response.");
      }
      return data.elements;
    } catch (error) {
      failures.push(
        `${endpoint}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  throw new Error(failures.join(" "));
}

function requestParisBuildings(
  projection: ParisMapProjection,
  onLowDetail: (buildings: OSMBuildingCenter[]) => void,
  onLowDetailError: (error: unknown) => void,
): Promise<OSMBuildingWay[]> {
  const outerBounds = getParisTileBounds(projection, PARIS_TILE_RADIUS);
  const coreBounds = getParisTileBounds(projection, PARIS_CORE_RADIUS);
  const lowDetailQuery = `[out:json][timeout:25];way["building"](${outerBounds.south},${outerBounds.west},${outerBounds.north},${outerBounds.east});out tags center bb;`;
  const detailedQuery = `[out:json][timeout:25];way["building"](${coreBounds.south},${coreBounds.west},${coreBounds.north},${coreBounds.east});out tags geom;`;
  void requestParisOverpassElements(lowDetailQuery)
    .then((elements) => onLowDetail(elements.filter(hasBuildingCenter)))
    .catch(onLowDetailError);
  return requestParisOverpassElements(detailedQuery).then((elements) =>
    elements.filter(hasBuildingWayGeometry),
  );
}

function calculateBuildingArea(points: THREE.Vector2[]) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }
  return Math.abs(area) / 2;
}

function isPointInPolygon(point: THREE.Vector2, polygon: THREE.Vector2[]) {
  let inside = false;
  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current, current += 1
  ) {
    const first = polygon[current];
    const second = polygon[previous];
    const crosses =
      first.y > point.y !== second.y > point.y &&
      point.x <
        ((second.x - first.x) * (point.y - first.y)) / (second.y - first.y) +
          first.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function projectBuildingWays(
  ways: OSMBuildingWay[],
  projection: ParisMapProjection,
) {
  const coreBounds = PARIS_TILE_SIZE * (PARIS_CORE_RADIUS + 0.5);
  const eiffelPoint = projectParisCoordinate(48.8584, 2.2945, projection);
  return ways.flatMap((way) => {
    const points = way.geometry.map(({ lat, lon }) =>
      projectParisCoordinate(lat, lon, projection),
    );
    const center = points
      .reduce((sum, point) => sum.add(point), new THREE.Vector2())
      .multiplyScalar(1 / points.length);
    if (
      Math.abs(center.x) > coreBounds ||
      Math.abs(center.y) > coreBounds ||
      isPointInPolygon(eiffelPoint, points) ||
      center.distanceTo(eiffelPoint) < 0.12
    ) {
      return [];
    }
    const area = calculateBuildingArea(points);
    if (area < 0.001) return [];
    return [{ way, points, center, area }];
  });
}

function projectBuildingCenters(
  buildings: OSMBuildingCenter[],
  projection: ParisMapProjection,
): ProjectedBuildingCenter[] {
  const outerBounds = (PARIS_TILE_SIZE * PARIS_TILE_COUNT) / 2;
  const coreBounds = PARIS_TILE_SIZE * (PARIS_CORE_RADIUS + 0.5);
  return buildings.flatMap((building) => {
    const center = projectParisCoordinate(
      building.center.lat,
      building.center.lon,
      projection,
    );
    if (
      Math.abs(center.x) > outerBounds ||
      Math.abs(center.y) > outerBounds ||
      (Math.abs(center.x) <= coreBounds && Math.abs(center.y) <= coreBounds)
    ) {
      return [];
    }
    const bounds = building.bounds;
    const width =
      bounds === undefined
        ? 0.055
        : projectParisCoordinate(building.center.lat, bounds.maxlon, projection)
            .x -
          projectParisCoordinate(building.center.lat, bounds.minlon, projection)
            .x;
    const depth =
      bounds === undefined
        ? 0.07
        : projectParisCoordinate(bounds.maxlat, building.center.lon, projection)
            .y -
          projectParisCoordinate(bounds.minlat, building.center.lon, projection)
            .y;
    return [
      {
        building,
        center,
        width: THREE.MathUtils.clamp(Math.abs(width), 0.025, 0.16),
        depth: THREE.MathUtils.clamp(Math.abs(depth), 0.025, 0.16),
      },
    ];
  });
}

function selectFeatureBuildings(buildings: ProjectedBuilding[], count: number) {
  const remaining = [...buildings];
  const selected: ProjectedBuilding[] = [];
  while (selected.length < count && remaining.length > 0) {
    const next =
      selected.length === 0
        ? remaining.reduce((nearest, building) =>
            building.center.length() < nearest.center.length()
              ? building
              : nearest,
          )
        : remaining.reduce((farthest, building) => {
            const buildingDistance = Math.min(
              ...selected.map((chosen) =>
                building.center.distanceTo(chosen.center),
              ),
            );
            const farthestDistance = Math.min(
              ...selected.map((chosen) =>
                farthest.center.distanceTo(chosen.center),
              ),
            );
            return buildingDistance > farthestDistance ? building : farthest;
          });
    selected.push(next);
    remaining.splice(remaining.indexOf(next), 1);
  }
  return selected;
}

function createOSMBuilding(building: ProjectedBuilding, center: THREE.Vector2) {
  const footprint = new THREE.Shape();
  building.points.forEach((point, index) => {
    const x = point.x - center.x;
    const y = -(point.y - center.y);
    if (index === 0) footprint.moveTo(x, y);
    else footprint.lineTo(x, y);
  });
  footprint.closePath();

  const tags = building.way.tags ?? {};
  const taggedHeight = Number.parseFloat(tags.height ?? "");
  const taggedLevels = Number.parseFloat(tags["building:levels"] ?? "");
  const heightInMetres =
    Number.isFinite(taggedHeight) && taggedHeight > 0
      ? taggedHeight
      : Number.isFinite(taggedLevels) && taggedLevels > 0
        ? taggedLevels * 3.2
        : 12;
  const height = THREE.MathUtils.clamp(
    heightInMetres * PARIS_BUILDING_HEIGHT_SCALE,
    0.08,
    0.55,
  );
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(footprint, {
      depth: height,
      bevelEnabled: false,
    }),
    new THREE.MeshStandardMaterial({
      color: "#b7aa91",
      roughness: 0.84,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.userData.cityBuilding = true;
  mesh.userData.baseColor = "#b7aa91";
  return mesh;
}

export function addParisBuildings(
  map: THREE.Group,
  projection: ParisMapProjection,
  nodeGroups: THREE.Group[],
  featureCount: number,
  getActiveFeatureId: () => string,
  updateFeatures: (map: THREE.Group, activeFeatureId: string) => void,
  requestRender: () => void,
  onLoaded: (status: string) => void,
  onError: (error: unknown) => void,
) {
  let detailedState: "loading" | "loaded" | "failed" = "loading";
  let lowDetailState: "loading" | "loaded" | "failed" = "loading";
  let detailedCount = 0;
  let lowDetailCount = 0;
  const reportStatus = () => {
    if (map.userData.disposed) return;
    if (detailedState === "failed" && lowDetailState === "failed") {
      onError(
        new Error("Detailed and low-detail OSM building requests failed."),
      );
      return;
    }
    const detailedMessage =
      detailedState === "loading"
        ? "Detailed core buildings loading"
        : detailedState === "failed"
          ? "Detailed core buildings unavailable"
          : `${detailedCount} detailed core buildings`;
    const lowDetailMessage =
      lowDetailState === "loading"
        ? "outer buildings loading"
        : lowDetailState === "failed"
          ? "outer buildings unavailable"
          : `${lowDetailCount} low-detail outer buildings`;
    onLoaded(`${detailedMessage} · ${lowDetailMessage}`);
  };
  const addLowDetailBuildings = (buildings: OSMBuildingCenter[]) => {
    if (map.userData.disposed) return;
    const coarseBuildings = projectBuildingCenters(buildings, projection)
      .sort((left, right) => left.center.lengthSq() - right.center.lengthSq())
      .slice(0, PARIS_LOW_DETAIL_BUILDING_LIMIT);
    lowDetailCount = coarseBuildings.length;
    lowDetailState = "loaded";
    if (coarseBuildings.length > 0) {
      const cityBuildings = new THREE.Group();
      cityBuildings.position.y = -0.625;
      const instances = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
          color: "#aaa18f",
          roughness: 0.92,
        }),
        coarseBuildings.length,
      );
      const transform = new THREE.Object3D();
      coarseBuildings.forEach(({ building, center, width, depth }, index) => {
        const tags = building.tags ?? {};
        const taggedHeight = Number.parseFloat(tags.height ?? "");
        const taggedLevels = Number.parseFloat(tags["building:levels"] ?? "");
        const heightInMetres =
          Number.isFinite(taggedHeight) && taggedHeight > 0
            ? taggedHeight
            : Number.isFinite(taggedLevels) && taggedLevels > 0
              ? taggedLevels * 3.2
              : 8;
        const height = THREE.MathUtils.clamp(
          heightInMetres * PARIS_BUILDING_HEIGHT_SCALE * 0.68,
          0.035,
          0.32,
        );
        transform.position.set(center.x, height / 2, center.y);
        transform.scale.set(width, height, depth);
        transform.updateMatrix();
        instances.setMatrixAt(index, transform.matrix);
      });
      instances.instanceMatrix.needsUpdate = true;
      cityBuildings.add(instances);
      map.add(cityBuildings);
    }
    reportStatus();
    requestRender();
  };
  const handleLowDetailError = (error: unknown) => {
    if (map.userData.disposed) return;
    console.error("Unable to load low-detail Paris OSM buildings.", error);
    lowDetailState = "failed";
    reportStatus();
  };

  void requestParisBuildings(
    projection,
    addLowDetailBuildings,
    handleLowDetailError,
  )
    .then((ways) => {
      if (map.userData.disposed) return;
      const buildings = projectBuildingWays(ways, projection);
      const featuredBuildings = selectFeatureBuildings(
        buildings,
        Math.min(featureCount, nodeGroups.length),
      );
      const featuredIds = new Set(
        featuredBuildings.map((building) => building.way.id),
      );
      const cityBuildings = new THREE.Group();
      cityBuildings.position.y = -0.625;
      map.add(cityBuildings);
      buildings.forEach((building) => {
        if (featuredIds.has(building.way.id)) return;
        const mesh = createOSMBuilding(building, building.center);
        mesh.position.set(building.center.x, 0, building.center.y);
        cityBuildings.add(mesh);
      });
      featuredBuildings.forEach((building, index) => {
        const node = nodeGroups[index];
        if (!node) return;
        node.position.set(building.center.x, -0.625, building.center.y);
        node.add(createOSMBuilding(building, building.center));
      });
      detailedCount = buildings.length;
      detailedState = "loaded";
      updateFeatures(map, getActiveFeatureId());
      reportStatus();
      requestRender();
    })
    .catch((error: unknown) => {
      if (map.userData.disposed) return;
      console.error("Unable to load detailed Paris OSM buildings.", error);
      detailedState = "failed";
      reportStatus();
    });
}

export function addParisCity(map: THREE.Group) {
  const tileZoom = PARIS_TILE_ZOOM;
  const tileSize = PARIS_TILE_SIZE;
  const tower = { latitude: 48.8584, longitude: 2.2945 };
  const towerTileX = longitudeToTile(tower.longitude, tileZoom);
  const towerTileY = latitudeToTile(tower.latitude, tileZoom);
  const projection: ParisMapProjection = {
    tileZoom,
    tileSize,
    centerTileX: Math.floor(towerTileX),
    centerTileY: Math.floor(towerTileY),
  };
  const towerPosition = projectParisCoordinate(
    tower.latitude,
    tower.longitude,
    projection,
  );
  const mapSize = tileSize * PARIS_TILE_COUNT;
  addParisGround(map, mapSize);
  const tiles = new THREE.Group();
  map.add(tiles);
  const tileLoader = new THREE.TextureLoader();
  tileLoader.setCrossOrigin("anonymous");
  const tileRequests: ParisTileRequest[] = [];
  for (let row = -PARIS_TILE_RADIUS; row <= PARIS_TILE_RADIUS; row += 1) {
    for (
      let column = -PARIS_TILE_RADIUS;
      column <= PARIS_TILE_RADIUS;
      column += 1
    ) {
      const material = new THREE.MeshBasicMaterial({ color: "#d2d3c6" });
      const tile = new THREE.Mesh(
        new THREE.PlaneGeometry(tileSize, tileSize),
        material,
      );
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(column * tileSize, -0.625, row * tileSize);
      tiles.add(tile);

      const x = projection.centerTileX + column;
      const y = projection.centerTileY + row;
      tileRequests.push({
        x,
        y,
        material: material,
      });
    }
  }
  tileRequests.sort((left, right) => {
    const leftDistance =
      (left.x - projection.centerTileX) ** 2 +
      (left.y - projection.centerTileY) ** 2;
    const rightDistance =
      (right.x - projection.centerTileX) ** 2 +
      (right.y - projection.centerTileY) ** 2;
    return leftDistance - rightDistance;
  });
  let nextTileIndex = 0;
  let activeTileRequests = 0;
  const loadNextTiles = () => {
    while (
      activeTileRequests < 2 &&
      nextTileIndex < tileRequests.length &&
      !map.userData.disposed
    ) {
      const { material, x, y } = tileRequests[nextTileIndex];
      nextTileIndex += 1;
      activeTileRequests += 1;
      tileLoader.load(
        `https://tile.openstreetmap.org/${tileZoom}/${x}/${y}.png`,
        (texture) => {
          activeTileRequests -= 1;
          if (map.userData.disposed) {
            texture.dispose();
            loadNextTiles();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.color.set("#ffffff");
          material.needsUpdate = true;
          loadNextTiles();
        },
        undefined,
        (error: unknown) => {
          console.warn(`Unable to load Paris map tile ${x}/${y}`, error);
          activeTileRequests -= 1;
          loadNextTiles();
        },
      );
    }
  };
  loadNextTiles();

  const eiffelAnchor = new THREE.Group();
  eiffelAnchor.name = "eiffel-tower-anchor";
  eiffelAnchor.position.set(towerPosition.x, -0.625, towerPosition.y);
  map.add(eiffelAnchor);
  return projection;
}
