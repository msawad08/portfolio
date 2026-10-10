export type CaseStudyFeature = {
  id: string;
  title: string;
  summary: string;
  details: string[];
};

export type CaseStudyLayer = {
  id: string;
  title: string;
  featureId: string;
};

export type CaseStudy = {
  id: string;
  number: string;
  type: string;
  title: string;
  summary: string;
  role: string;
  period: string;
  technologies: string[];
  outcomes: { value: string; label: string }[];
  features: CaseStudyFeature[];
  layers: CaseStudyLayer[];
};

export const caseStudies: CaseStudy[] = [
  {
    id: "omni-3d",
    number: "01",
    type: "PLATFORM · AI · REAL-TIME 3D",
    title: "AI-powered rendering platform",
    summary:
      "An enterprise on-demand 3D rendering and marketing-content platform, spanning browser workflows, real-time rendering, AI orchestration, and cloud infrastructure.",
    role: "Lead Software Engineer; previously Senior Software Engineer · Omnicom Media Group",
    period: "MAY 2023 — PRESENT",
    technologies: [
      "React",
      "NestJS",
      "PostgreSQL",
      "Redis",
      "LangGraph",
      "AWS",
      "Unreal Engine",
    ],
    outcomes: [],
    features: [
      {
        id: "platform",
        title: "Full-stack platform",
        summary:
          "Built the initial product foundation, then took ownership of architecture and technical direction across the platform.",
        details: [
          "The initial platform combined a React and Tailwind frontend, NestJS/Node.js services, PostgreSQL, and authentication.",
          "As Lead Software Engineer, I own the end-to-end architecture and roadmap across frontend, backend, AI orchestration, and 3D rendering infrastructure.",
        ],
      },
      {
        id: "streaming",
        title: "Real-time rendering",
        summary:
          "Connected interactive browser workflows to Unreal Engine Pixel Streaming and coordinated parallel sessions.",
        details: [
          "Integrated Unreal Engine Pixel Streaming through WebRTC and Kinesis Video Streams on AWS.",
          "Built Redis-backed multi-user instance management for parallel rendering sessions and a WebSocket signaling server.",
        ],
      },
      {
        id: "ai",
        title: "AI orchestration",
        summary:
          "Used workflow orchestration to make scene control and asset discovery more accessible.",
        details: [
          "Built LangGraph workflows integrating Claude for camera animation and natural-language scene control.",
          "Added retrieval-augmented asset management to help users find and work with relevant 3D assets.",
        ],
      },
      {
        id: "automation",
        title: "Generative workflows",
        summary:
          "Applied generative models and computer-vision-assisted workflows to image and 3D production tasks.",
        details: [
          "Integrated FLUX AI for generative background creation and post-render image enhancement.",
          "Developed camera matching from annotated reference images and led CAD-to-camera-ready automation for mesh generation, material mapping, and geometry processing.",
        ],
      },
      {
        id: "direction",
        title: "Platform direction",
        summary:
          "Current architecture work is broadening the platform toward configurable AI workflows.",
        details: [
          "Architecting a general-purpose node-graph workflow builder, a LiteLLM-based model-routing layer, and a generic MCP adapter framework.",
          "These describe ongoing platform work from the supplied resume; this portfolio does not connect to or reproduce the employer platform.",
        ],
      },
    ],
    layers: [
      { id: "web", title: "React web app", featureId: "platform" },
      { id: "api", title: "NestJS API", featureId: "platform" },
      { id: "data", title: "PostgreSQL + auth", featureId: "platform" },
      { id: "stream", title: "WebRTC / Kinesis", featureId: "streaming" },
      { id: "engine", title: "Unreal Pixel Streaming", featureId: "streaming" },
      { id: "orchestration", title: "LangGraph + Claude", featureId: "ai" },
      { id: "assets", title: "RAG asset workflows", featureId: "ai" },
      {
        id: "direction",
        title: "LiteLLM · MCP · node graph",
        featureId: "direction",
      },
    ],
  },
  {
    id: "webgl-editor",
    number: "02",
    type: "CREATIVE TOOLING · WEBGL",
    title: "Custom Three.js WebGL editor",
    summary:
      "A custom browser-based editor that brought model, animation, and hotspot workflows into a focused tool for 3D artists.",
    role: "Senior Software Engineer · Omnicom Media Group",
    period: "MAY 2023 — APR 2026",
    technologies: ["Three.js", "WebGL", "Animation tooling", "Hotspots"],
    outcomes: [],
    features: [
      {
        id: "editing",
        title: "Editor workflows",
        summary:
          "Built a custom Three.js editor around the practical tasks artists needed to complete in the browser.",
        details: [
          "Implemented animation tooling, hotspot management, and model-addition workflows.",
          "The editor brought several content-authoring tasks into one browser-based experience.",
        ],
      },
      {
        id: "collaboration",
        title: "Artist–engineering handoff",
        summary:
          "Focused the tooling on reducing friction between 3D artists and developers.",
        details: [
          "The resume describes improved 3D artist productivity and reduced developer–artist iteration cycles.",
          "No numeric productivity claim is added because the resume does not provide one.",
        ],
      },
      {
        id: "ownership",
        title: "My contribution",
        summary:
          "Hands-on engineering of an editor as part of the broader interactive 3D platform work.",
        details: [
          "Built the custom Three.js-based editor and its core animation, hotspot, and model workflows.",
          "This case study describes the professional work; no employer-owned editor interface or source code is included.",
        ],
      },
    ],
    layers: [
      { id: "author", title: "Artist workflow", featureId: "editing" },
      { id: "editor", title: "Three.js editor", featureId: "editing" },
      {
        id: "tools",
        title: "Animation · hotspots · models",
        featureId: "editing",
      },
      {
        id: "handoff",
        title: "Developer–artist handoff",
        featureId: "collaboration",
      },
    ],
  },
  {
    id: "homelane",
    number: "03",
    type: "PRODUCT · REAL-TIME VISUALIZATION",
    title: "HomeLane interior platform",
    summary:
      "An interior-design product connecting real-time 3D visualization, designer-client collaboration, and production-ready design assets.",
    role: "Software Engineer II · HomeLane",
    period: "NOV 2020 — APR 2023",
    technologies: [
      "React",
      "Node.js",
      "WebSockets",
      "Three.js",
      "PBR",
      "Draco",
    ],
    outcomes: [
      { value: "50,000+", label: "monthly users served by the platform" },
      { value: "80%", label: "fewer in-person site meetings" },
      { value: "40%", label: "smaller optimized 3D assets" },
    ],
    features: [
      {
        id: "collaboration",
        title: "Real-time collaboration",
        summary:
          "Enabled designers and clients to edit a project together while keeping shared state in sync.",
        details: [
          "Architected a collaboration system with a React frontend, Node.js backend, and WebSocket infrastructure for distributed state synchronization.",
          "The resume attributes an 80% reduction in in-person site meetings to the real-time visualization work.",
        ],
      },
      {
        id: "visualization",
        title: "Interior visualization",
        summary:
          "Built a real-time rendering experience for photorealistic furniture visualization.",
        details: [
          "Developed a Three.js rendering engine using physically based rendering shaders.",
          "The platform served more than 50,000 monthly users, according to the supplied resume.",
        ],
      },
      {
        id: "assets",
        title: "Asset and drawing pipeline",
        summary:
          "Connected design assets to the practical documents and optimized models needed downstream.",
        details: [
          "Designed a CAD asset pipeline that converted high-poly models into optimized glTF/OBJ with Draco compression, reducing asset sizes by 40%.",
          "Built installation drawing generation with raw-material calculations and an asset platform for artists to prepare design-ready models.",
        ],
      },
    ],
    layers: [
      { id: "design", title: "Designer + client", featureId: "collaboration" },
      {
        id: "state",
        title: "WebSocket state sync",
        featureId: "collaboration",
      },
      { id: "render", title: "Three.js + PBR", featureId: "visualization" },
      { id: "assets", title: "CAD → optimized glTF/OBJ", featureId: "assets" },
      { id: "delivery", title: "Installation drawings", featureId: "assets" },
    ],
  },
  {
    id: "geospatial",
    number: "04",
    type: "SPATIAL DATA · PERFORMANCE",
    title: "Geospatial visualization",
    summary:
      "A WebGL urban-data experience designed to render large spatial datasets and procedurally generate explorable city scenes.",
    role: "Associate Software Developer · Juego Studios Pvt Ltd",
    period: "JUL 2017 — FEB 2019",
    technologies: [
      "Three.js",
      "WebGL",
      "GeoJSON",
      "Web Workers",
      "GLSL",
      "WebVR",
    ],
    outcomes: [{ value: "1M+", label: "data points supported" }],
    features: [
      {
        id: "scale",
        title: "Large spatial datasets",
        summary:
          "Built a high-performance urban visualization application for data at million-point scale.",
        details: [
          "The application supported more than one million data points, using level-of-detail optimization.",
          "This figure describes the professional application in the resume, not this portfolio site.",
        ],
      },
      {
        id: "processing",
        title: "Parallel processing",
        summary:
          "Moved computational work off the main UI thread and generated geometry from spatial data.",
        details: [
          "Implemented Web Workers for parallel processing.",
          "Used custom GLSL shaders and GeoJSON-driven procedural building generation.",
        ],
      },
      {
        id: "exploration",
        title: "City exploration",
        summary:
          "Made spatial scenes explorable across desktop and immersive web experiences.",
        details: [
          "Created 3D city exploration experiences for desktop and WebVR using Three.js.",
          "The portfolio presents the architecture and engineering details as an explainer rather than a stand-in for the professional application.",
        ],
      },
    ],
    layers: [
      { id: "source", title: "GeoJSON data", featureId: "processing" },
      { id: "workers", title: "Web Workers", featureId: "processing" },
      { id: "lod", title: "LOD + GLSL", featureId: "scale" },
      { id: "webgl", title: "WebGL visualization", featureId: "scale" },
      { id: "desktop", title: "Desktop + WebVR", featureId: "exploration" },
    ],
  },
];
