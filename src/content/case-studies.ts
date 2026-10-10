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
      "I lead architecture and engineering for an on-demand 3D rendering and marketing platform, connecting browser workflows, Unreal Engine, AI orchestration, and cloud infrastructure.",
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
          "I built the initial product foundation and now lead architecture and technical direction across the platform.",
        details: [
          "I established the platform with a React and Tailwind frontend, NestJS/Node.js services, PostgreSQL, and authentication.",
          "As Lead Software Engineer, I guide the end-to-end architecture and roadmap across frontend, backend, AI orchestration, and 3D rendering infrastructure.",
        ],
      },
      {
        id: "streaming",
        title: "Real-time rendering",
        summary:
          "I connected interactive browser workflows to Unreal Engine Pixel Streaming and coordinated parallel rendering sessions.",
        details: [
          "I integrated Unreal Engine Pixel Streaming through WebRTC and Kinesis Video Streams on AWS.",
          "I built Redis-backed multi-user instance management for parallel rendering sessions and a WebSocket signaling server.",
          "I connected the Unreal application to a web frontend for product and scene configuration during remote rendering.",
          "I added post-processing controls, time-of-day settings, backdrops, and HDRI environments to the browser workflow.",
          "I enabled preset and custom free-camera animations with timeline controls, plus still-image and video rendering in multiple formats.",
        ],
      },
      {
        id: "ai",
        title: "AI orchestration",
        summary:
          "I use workflow orchestration to make scene control and asset discovery more accessible.",
        details: [
          "I built LangGraph workflows with Claude for camera animation and natural-language scene control.",
          "I added retrieval-augmented asset management to help users find relevant 3D assets.",
        ],
      },
      {
        id: "automation",
        title: "Generative workflows",
        summary:
          "I apply generative models and computer-vision-assisted workflows to image and 3D production.",
        details: [
          "I integrated FLUX AI for generative background creation and post-render image enhancement.",
          "I added dynamic prop and background generation to the product and scene configuration workflow.",
          "I developed camera matching from annotated reference images and led CAD-to-camera-ready automation for mesh generation, material mapping, and geometry processing.",
        ],
      },
      {
        id: "direction",
        title: "Platform direction",
        summary:
          "I’m broadening the platform architecture toward configurable AI workflows.",
        details: [
          "I’m architecting a general-purpose node-graph workflow builder, a LiteLLM-based model-routing layer, and a generic MCP adapter framework.",
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
      "I extended the open-source NunuStudio into a customized Three.js WebGL framework and editor, streamlining authoring workflows for organizational projects.",
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
          "I built a custom Three.js editor around the everyday authoring tasks 3D artists handle in the browser.",
        details: [
          "I created workflows for hotspots, animation, project configuration, color and accessory selection, and product variants.",
          "I generated JSON configuration from project files to create matching interface controls dynamically.",
          "I connected editor-authored settings to WebGL projects, keeping interactive controls and scene behavior in sync.",
        ],
      },
      {
        id: "collaboration",
        title: "Artist–engineering handoff",
        summary:
          "I focused the tooling on reducing friction between 3D artists and developers.",
        details: [
          "I updated the framework for newer Three.js versions and modified its internals to support custom materials and node-based shaders.",
          "I automated repetitive setup and configuration tasks to improve authoring productivity and shorten developer–artist feedback cycles.",
        ],
      },
      {
        id: "ownership",
        title: "My contribution",
        summary:
          "I extended the framework and delivered its authoring interface and integration workflows.",
        details: [
          "I extended the open-source NunuStudio foundation into an in-house framework and editor tailored to organizational WebGL projects.",
          "I delivered the authoring interface, generated configuration pipeline, and framework-level Three.js material and shader support.",
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
      "I helped build an in-house 2D and 3D interior-design application for personalized home layouts, with real-time visualization, pricing, and production-document workflows.",
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
          "I enabled designers and clients to edit projects together while keeping shared state in sync.",
        details: [
          "I architected a collaboration system with a React frontend, Node.js backend, and WebSocket infrastructure for distributed state synchronization.",
          "My real-time visualization and collaboration work helped reduce in-person site meetings by 80%.",
        ],
      },
      {
        id: "visualization",
        title: "Interior visualization",
        summary:
          "I built a real-time rendering experience for photorealistic interior visualization.",
        details: [
          "I developed a Three.js rendering engine using physically based rendering shaders.",
          "I optimized materials and textures for high-quality visualization, with progressive shadow generation to add depth while managing rendering cost.",
          "I contributed to a platform serving more than 50,000 users each month.",
        ],
      },
      {
        id: "assets",
        title: "Asset and drawing pipeline",
        summary:
          "I connected design assets to production documents and optimized models.",
        details: [
          "I generated meshes dynamically so cabinetry and other interior modules connect cleanly, and automated module placement to streamline design work.",
          "I added real-time pricing so designers could understand budget impact while iterating on a room.",
          "I generated 2D production documents from 3D designs to support accurate manufacturing and installation.",
          "I designed a CAD asset pipeline that converted high-poly models into optimized glTF/OBJ with Draco compression, reducing asset sizes by 40%.",
          "I added raw-material calculations and an asset workflow for preparing design-ready models.",
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
      "I built a WebGL urban-data experience for large spatial datasets and procedurally generated, explorable city scenes.",
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
          "I built a high-performance urban visualization application for datasets at million-point scale.",
        details: [
          "I used level-of-detail optimization to support more than one million data points.",
          "I merged geometry and used vector colors instead of per-object and multi-material rendering, improving scene efficiency.",
        ],
      },
      {
        id: "processing",
        title: "Parallel processing",
        summary:
          "I moved computational work off the main UI thread and generated geometry from spatial data.",
        details: [
          "I implemented Web Workers for parallel processing.",
          "I generated buildings, trees, and monuments from GeoJSON, deriving roof and window details from building parameters.",
          "I used custom GLSL shaders to generate terrain from height data.",
        ],
      },
      {
        id: "exploration",
        title: "City exploration",
        summary:
          "I made spatial scenes explorable across desktop and immersive web experiences.",
        details: [
          "I created 3D city exploration experiences for desktop and WebVR using Three.js.",
          "I added configurable 360-degree video paths for immersive exploration and used level of detail to adapt scene complexity.",
          "I optimized the Three.js framework to reduce overhead for rendering.",
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
      "I’m building an AI-assisted timesheet platform for natural-language work logging, semantic project matching, and multi-tenant access control.",
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
          "I turn everyday work descriptions into structured timesheet entries through a streaming AI assistant.",
        details: [
          "I paired a timesheet grid with an AI chat interface.",
          "I built a dedicated Fastify worker to stream conversational parsing results using server-sent events.",
        ],
      },
      {
        id: "matching",
        title: "Semantic project matching",
        summary:
          "I use vector embeddings to match logged work descriptions with relevant projects.",
        details: [
          "I use PostgreSQL with pgvector for semantic matching.",
          "I run local AI services with Ollama, Qwen 2.5, and nomic-embed-text models.",
        ],
      },
      {
        id: "tenancy",
        title: "Multi-tenant platform",
        summary:
          "I support isolated organization data across cloud SaaS and self-hosted deployments.",
        details: [
          "I built an API gateway for authentication, tenant management, and project management.",
          "I use shared Prisma data models across the application services.",
        ],
      },
      {
        id: "access",
        title: "Attribute-based access",
        summary:
          "I apply dynamic role- and attribute-based permissions across the platform.",
        details: [
          "I use CASL rules for attribute-based access control.",
          "I use Redis to accelerate permission checks.",
        ],
      },
      {
        id: "streaming",
        title: "Streaming AI services",
        summary:
          "I separate conversational AI processing from the main web and API services.",
        details: [
          "I built a Fastify service that streams AI responses over server-sent events.",
          "I use a NestJS API gateway and a Next.js web client for the other primary application services.",
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
