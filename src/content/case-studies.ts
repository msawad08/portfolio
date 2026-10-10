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
  outcomesAreProjected?: boolean;
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
      "An on-demand 3D rendering and marketing platform connecting browser workflows, Unreal Engine, AI orchestration, and cloud infrastructure.",
    role: "Lead Software Engineer; previously Senior Software Engineer · Omnicom Media Group",
    period: "MAY 2023 — PRESENT",
    technologies: [
      "React",
      "Node.js",
      "NestJS",
      "PostgreSQL",
      "Redis",
      "LangGraph",
      "AWS",
      "Unreal Engine",
      "Blueprint",
      "C++",
      "Shadcn",
      "Generative AI",
    ],
    outcomes: [
      { value: "50%", label: "less asset-generation turnaround time" },
      { value: "On-demand", label: "asset generation" },
      {
        value: "Reduced",
        label: "repetitive work for artists",
      },
    ],
    features: [
      {
        id: "platform",
        title: "Full-stack platform",
        summary:
          "A full-stack foundation supporting product configuration, AI orchestration, and cloud rendering.",
        details: [
          "The platform combines a React and Tailwind frontend with NestJS/Node.js services, PostgreSQL, and authentication.",
          "Technical direction spans frontend and backend architecture, AI orchestration, and 3D rendering infrastructure.",
        ],
      },
      {
        id: "streaming",
        title: "Real-time rendering",
        summary:
          "Interactive browser workflows connect to Unreal Engine Pixel Streaming and parallel cloud rendering sessions.",
        details: [
          "Unreal Engine Pixel Streaming runs through WebRTC and Kinesis Video Streams on AWS.",
          "Redis-backed instance management supports parallel multi-user rendering sessions, coordinated by a WebSocket signaling server.",
          "A web frontend provides product and scene configuration during remote rendering.",
          "Browser controls cover post-processing, time of day, backdrops, and HDRI environments.",
          "Preset and custom free-camera animations include timeline controls, with still-image and video rendering in multiple formats.",
        ],
      },
      {
        id: "ai",
        title: "AI orchestration",
        summary:
          "Workflow orchestration makes scene control and asset discovery more accessible.",
        details: [
          "LangGraph workflows with Claude support camera animation and natural-language scene control.",
          "Retrieval-augmented asset management helps users find relevant 3D assets.",
        ],
      },
      {
        id: "automation",
        title: "Generative workflows",
        summary:
          "Generative models and computer-vision-assisted workflows streamline image and 3D production.",
        details: [
          "FLUX AI supports generative background creation and post-render image enhancement.",
          "Dynamic prop and background generation is integrated into product and scene configuration.",
          "Camera matching uses annotated reference images, while CAD-to-camera-ready automation handles mesh generation, material mapping, and geometry processing.",
        ],
      },
      {
        id: "direction",
        title: "Platform direction",
        summary:
          "The platform architecture is expanding toward configurable AI workflows.",
        details: [
          "Current architecture work includes a general-purpose node-graph workflow builder, LiteLLM-based model routing, and a generic MCP adapter framework.",
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
    title: "In-house WebGL framework & editor based on Three.js",
    summary:
      "An open-source NunuStudio foundation extended into a customized Three.js WebGL framework and editor for streamlined project authoring.",
    role: "Senior Software Engineer · Omnicom Media Group",
    period: "MAY 2023 — APR 2026",
    technologies: [
      "Three.js",
      "WebGL",
      "GLSL",
      "Animation tooling",
      "Hotspots",
    ],
    outcomes: [
      { value: "5 workflows", label: "unified in one WebGL authoring tool" },
      {
        value: "Automated",
        label: "project configuration generation",
      },
      {
        value: "Reduced back-and-forth",
        label: "between developers and artists",
      },
    ],
    features: [
      {
        id: "editing",
        title: "Editor workflows",
        summary:
          "A custom Three.js editor brings common 3D authoring tasks into the browser.",
        details: [
          "Workflows cover hotspots, animation, project configuration, color and accessory selection, and product variants.",
          "JSON configuration generated from project files creates matching interface controls dynamically.",
          "Editor-authored settings connect to WebGL projects to keep interactive controls and scene behavior in sync.",
        ],
      },
      {
        id: "collaboration",
        title: "Artist–engineering handoff",
        summary:
          "Connected authoring tools reduce friction between 3D artists and developers.",
        details: [
          "Framework updates support newer Three.js versions, custom materials, and node-based shaders.",
          "Automated setup and configuration reduce repetitive work and shorten developer–artist feedback cycles.",
        ],
      },
      {
        id: "ownership",
        title: "Framework extensions",
        summary:
          "A tailored framework, authoring interface, and integration workflows for organizational WebGL projects.",
        details: [
          "The open-source NunuStudio foundation became an in-house framework and editor tailored to organizational WebGL projects.",
          "The implementation includes an authoring interface, generated configuration pipeline, and framework-level Three.js material and shader support.",
        ],
      },
    ],
    layers: [
      { id: "author", title: "Artist workflow", featureId: "editing" },
      { id: "editor", title: "Three.js editor", featureId: "editing" },
      {
        id: "tools",
        title: "Variants · animation · hotspots",
        featureId: "editing",
      },
      {
        id: "handoff",
        title: "JSON · UI · WebGL integration",
        featureId: "collaboration",
      },
      {
        id: "framework",
        title: "Three.js · GLSL · custom materials",
        featureId: "ownership",
      },
    ],
  },
  {
    id: "homelane",
    number: "03",
    type: "PRODUCT · REAL-TIME VISUALIZATION",
    title: "Interior design platform",
    summary:
      "An in-house 2D and 3D interior-design application for personalized home layouts, real-time visualization, pricing, and production documentation.",
    role: "Software Engineer II",
    period: "NOV 2020 — APR 2023",
    technologies: [
      "React",
      "Node.js",
      "WebSockets",
      "Three.js",
      "WebGL",
      "GLSL",
      "PBR",
      "Draco",
    ],
    outcomes: [
      { value: "50,000+", label: "monthly users" },
      { value: "80%", label: "fewer in-person site meetings" },
      { value: "40%", label: "smaller optimized 3D assets" },
    ],
    features: [
      {
        id: "collaboration",
        title: "Real-time collaboration",
        summary:
          "Designers and clients can work on the same project with shared state kept in sync.",
        details: [
          "A React frontend, Node.js backend, and WebSocket infrastructure support distributed state synchronization.",
          "Real-time visualization and collaboration helped reduce in-person site meetings by 80%.",
        ],
      },
      {
        id: "visualization",
        title: "Interior visualization",
        summary:
          "Real-time rendering brings photorealistic interior visualization into the design workflow.",
        details: [
          "A Three.js rendering engine uses physically based rendering shaders.",
          "Optimized materials, textures, and progressive shadow generation add depth while managing rendering cost.",
          "The platform serves more than 50,000 users each month.",
        ],
      },
      {
        id: "assets",
        title: "Asset and drawing pipeline",
        summary:
          "Design assets, optimized models, and production documents are connected in one pipeline.",
        details: [
          "Dynamic mesh generation keeps cabinetry and other interior modules connected, while automated placement streamlines design work.",
          "Real-time pricing shows the budget impact as room designs evolve.",
          "2D production documents generated from 3D designs support accurate manufacturing and installation.",
          "A CAD asset pipeline converts high-poly models into optimized glTF/OBJ with Draco compression, reducing asset sizes by 40%.",
          "Raw-material calculations and asset preparation workflows help produce design-ready models.",
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
      {
        id: "modules",
        title: "Dynamic modules · placement",
        featureId: "visualization",
      },
      {
        id: "pricing",
        title: "Real-time pricing",
        featureId: "visualization",
      },
      { id: "assets", title: "CAD → optimized glTF/OBJ", featureId: "assets" },
      {
        id: "delivery",
        title: "2D production documents",
        featureId: "assets",
      },
    ],
  },
  {
    id: "geospatial",
    number: "04",
    type: "SPATIAL DATA · PERFORMANCE",
    title: "Geospatial visualization",
    summary:
      "A WebGL urban-data experience for large spatial datasets and procedurally generated, explorable city scenes.",
    role: "Associate Software Developer · Juego Studios Pvt Ltd",
    period: "JUL 2017 — FEB 2019",
    technologies: [
      "Three.js",
      "WebGL",
      "GeoJSON",
      "Web Workers",
      "GLSL",
      "WebVR",
      "Custom shaders",
    ],
    outcomes: [
      { value: "1M+", label: "data points supported" },
      {
        value: "3D visualization",
        label: "of complex urban data",
      },
      { value: "Optimized scenes", label: "workers, merged geometry, and LOD" },
    ],
    features: [
      {
        id: "scale",
        title: "Large spatial datasets",
        summary:
          "High-performance urban visualization supports datasets at million-point scale.",
        details: [
          "Level-of-detail optimization supports more than one million data points.",
          "Merged geometry and vector colors replace per-object and multi-material rendering to improve scene efficiency.",
        ],
      },
      {
        id: "processing",
        title: "Parallel processing",
        summary:
          "Computational work runs off the main UI thread as spatial data is transformed into 3D geometry.",
        details: [
          "Web Workers handle parallel processing.",
          "GeoJSON generates buildings, trees, and monuments, with roof and window details derived from building parameters.",
          "Custom GLSL shaders generate terrain from height data.",
        ],
      },
      {
        id: "exploration",
        title: "City exploration",
        summary:
          "Spatial scenes support desktop and immersive web exploration.",
        details: [
          "Three.js powers 3D city exploration experiences for desktop and WebVR.",
          "Configurable 360-degree video paths support immersive exploration, while level of detail adapts scene complexity.",
          "Three.js framework optimizations reduce rendering overhead.",
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
  {
    id: "timesheet-ai",
    number: "05",
    type: "PERSONAL PROJECT · AI · MULTI-TENANT SAAS",
    title: "Timesheet AI",
    summary:
      "An AI-assisted timesheet platform for natural-language work logging, semantic project matching, and multi-tenant access control.",
    role: "Personal project",
    period: "2026",
    technologies: [
      "Next.js",
      "NestJS",
      "Fastify",
      "PostgreSQL + pgvector",
      "Redis",
      "Ollama",
      "CASL",
    ],
    outcomes: [
      {
        value: "50%",
        label: "projected reduction in time spent logging hours",
      },
      { value: "Accurate tracking", label: "for accounting and billing" },
      { value: "2 options", label: "cloud SaaS or self-hosted deployment" },
    ],
    outcomesAreProjected: true,
    features: [
      {
        id: "logging",
        title: "AI time logging",
        summary:
          "Everyday work descriptions become structured timesheet entries through a streaming AI assistant.",
        details: [
          "A timesheet grid is paired with an AI chat interface.",
          "A dedicated Fastify worker streams conversational parsing results using server-sent events.",
        ],
      },
      {
        id: "matching",
        title: "Semantic project matching",
        summary:
          "Vector embeddings match logged work descriptions with relevant projects.",
        details: [
          "PostgreSQL with pgvector powers semantic matching.",
          "Local AI services run with Ollama, Qwen 2.5, and nomic-embed-text models.",
        ],
      },
      {
        id: "tenancy",
        title: "Multi-tenant platform",
        summary:
          "Organization data stays isolated across cloud SaaS and self-hosted deployments.",
        details: [
          "An API gateway handles authentication, tenant management, and project management.",
          "Shared Prisma data models serve the application services.",
        ],
      },
      {
        id: "access",
        title: "Attribute-based access",
        summary:
          "Dynamic role- and attribute-based permissions govern platform access.",
        details: [
          "CASL rules provide attribute-based access control.",
          "Redis accelerates permission checks.",
        ],
      },
      {
        id: "streaming",
        title: "Streaming AI services",
        summary:
          "Conversational AI processing runs separately from the main web and API services.",
        details: [
          "A Fastify service streams AI responses over server-sent events.",
          "A NestJS API gateway and Next.js web client support the primary application services.",
        ],
      },
    ],
    layers: [
      { id: "grid", title: "Timesheet grid", featureId: "logging" },
      { id: "assistant", title: "AI assistant", featureId: "logging" },
      {
        id: "vectors",
        title: "Project matching · pgvector",
        featureId: "matching",
      },
      { id: "tenants", title: "Tenant isolation", featureId: "tenancy" },
      { id: "permissions", title: "CASL · Redis", featureId: "access" },
      {
        id: "services",
        title: "NestJS · Fastify · Next.js",
        featureId: "streaming",
      },
    ],
  },
];
