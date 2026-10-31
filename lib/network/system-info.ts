export interface GpuInfo {
  vendor: string;
  renderer: string;
  version: string;
  webgl2: boolean;
  maxTexture: number | null;
}

export interface DisplaySnapshot {
  mounted: boolean;
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  nativeWidth: number;
  nativeHeight: number;
  availWidth: number;
  availHeight: number;
  devicePixelRatio: number;
  orientation: string;
  colorDepth: number;
  colorGamut: string;
  dynamicRange: string;
  colorScheme: "Dark" | "Light";
  reducedMotion: boolean;
  contrast: string;
  forcedColors: boolean;
  pointer: string;
  hover: boolean;
  touchPoints: number;
  gpu: GpuInfo;
}

export const EMPTY_GPU: GpuInfo = {
  vendor: "Unavailable",
  renderer: "Unavailable",
  version: "Unavailable",
  webgl2: false,
  maxTexture: null,
};

export const EMPTY_DISPLAY: DisplaySnapshot = {
  mounted: false,
  viewportWidth: 0,
  viewportHeight: 0,
  screenWidth: 0,
  screenHeight: 0,
  nativeWidth: 0,
  nativeHeight: 0,
  availWidth: 0,
  availHeight: 0,
  devicePixelRatio: 1,
  orientation: "unknown",
  colorDepth: 0,
  colorGamut: "Unknown",
  dynamicRange: "Unknown",
  colorScheme: "Light",
  reducedMotion: false,
  contrast: "Unknown",
  forcedColors: false,
  pointer: "Unknown",
  hover: false,
  touchPoints: 0,
  gpu: EMPTY_GPU,
};

const MEDIA_QUERIES = [
  "(prefers-color-scheme: dark)",
  "(prefers-reduced-motion: reduce)",
  "(prefers-contrast: more)",
  "(prefers-contrast: less)",
  "(forced-colors: active)",
  "(color-gamut: rec2020)",
  "(color-gamut: p3)",
  "(color-gamut: srgb)",
  "(dynamic-range: high)",
  "(pointer: fine)",
  "(pointer: coarse)",
  "(hover: hover)",
] as const;

const mediaLists = new Map<string, MediaQueryList>();
const listeners = new Set<() => void>();

function mediaList(query: string): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  let list = mediaLists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    list.addEventListener("change", () => {
      for (const listener of listeners) listener();
    });
    mediaLists.set(query, list);
  }
  return list;
}

function media(query: string): boolean {
  return mediaList(query)?.matches ?? false;
}

let gpuCache: GpuInfo | null = null;

export function readGpu(): GpuInfo {
  if (gpuCache) return gpuCache;
  if (typeof document === "undefined") return EMPTY_GPU;

  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    const gl: WebGLRenderingContext | WebGL2RenderingContext | null = gl2 ?? canvas.getContext("webgl");
    if (!gl) {
      gpuCache = { ...EMPTY_GPU, renderer: "WebGL unavailable", vendor: "WebGL unavailable" };
      return gpuCache;
    }

    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debug ? String(gl.getParameter(debug.UNMASKED_VENDOR_WEBGL)) : "Hidden by the browser";
    const renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "Hidden by the browser";

    gpuCache = {
      vendor,
      renderer,
      version: String(gl.getParameter(gl.VERSION) ?? "Unavailable"),
      webgl2: Boolean(gl2),
      maxTexture: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || null,
    };
    return gpuCache;
  } catch {
    gpuCache = { ...EMPTY_GPU, renderer: "Blocked by the browser", vendor: "Blocked by the browser" };
    return gpuCache;
  }
}

function readColorGamut(): string {
  if (media("(color-gamut: rec2020)")) return "Rec. 2020";
  if (media("(color-gamut: p3)")) return "Display P3";
  if (media("(color-gamut: srgb)")) return "sRGB";
  return "Unknown";
}

function readContrast(): string {
  if (media("(prefers-contrast: more)")) return "More";
  if (media("(prefers-contrast: less)")) return "Less";
  if (media("(prefers-contrast: custom)")) return "Custom";
  return "No preference";
}

let cachedDisplay: DisplaySnapshot | null = null;
let cachedSignature = "";

export function getDisplaySnapshot(): DisplaySnapshot {
  if (typeof window === "undefined") return EMPTY_DISPLAY;

  const screen = window.screen;
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const values = {
    viewportWidth: width,
    viewportHeight: height,
    screenWidth: screen.width,
    screenHeight: screen.height,
    nativeWidth: Math.round(screen.width * dpr),
    nativeHeight: Math.round(screen.height * dpr),
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    devicePixelRatio: Math.round(dpr * 100) / 100,
    orientation:
      screen.orientation?.type ?? (width > height ? "landscape-primary" : "portrait-primary"),
    colorDepth: screen.colorDepth,
    colorGamut: readColorGamut(),
    dynamicRange: media("(dynamic-range: high)") ? "High (HDR)" : "Standard (SDR)",
    colorScheme: media("(prefers-color-scheme: dark)") ? "Dark" : "Light",
    reducedMotion: media("(prefers-reduced-motion: reduce)"),
    contrast: readContrast(),
    forcedColors: media("(forced-colors: active)"),
    pointer: media("(pointer: fine)")
      ? "Fine (mouse or trackpad)"
      : media("(pointer: coarse)")
        ? "Coarse (touch)"
        : "None",
    hover: media("(hover: hover)"),
    touchPoints: navigator.maxTouchPoints ?? 0,
  } satisfies Omit<DisplaySnapshot, "mounted" | "gpu">;

  const signature = JSON.stringify(values);
  if (cachedDisplay && signature === cachedSignature) return cachedDisplay;

  cachedSignature = signature;
  cachedDisplay = { ...values, mounted: true, gpu: readGpu() };
  return cachedDisplay;
}

export function subscribeDisplay(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  listeners.add(onChange);
  const onResize = () => {
    for (const listener of listeners) listener();
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  for (const query of MEDIA_QUERIES) mediaList(query);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
  };
}

export function getServerSnapshot(): DisplaySnapshot {
  return EMPTY_DISPLAY;
}

export interface UserAgentDescription {
  browser: string;
  engine: string;
}

function major(version: string | undefined): string {
  if (!version) return "";
  const [head] = version.split(".");
  return head ? ` ${head}` : "";
}

/**
 * Legacy user-agent parsing. Kept as a fallback for browsers without Client
 * Hints; the component prefers the brand list when it is available.
 */
export function describeUserAgent(userAgent: string): UserAgentDescription {
  const match = (pattern: RegExp) => userAgent.match(pattern)?.[1];

  if (/CriOS\//.test(userAgent)) {
    return { browser: `Chrome${major(match(/CriOS\/([\d.]+)/))} (iOS)`, engine: "WebKit (iOS)" };
  }
  if (/FxiOS\//.test(userAgent)) {
    return { browser: `Firefox${major(match(/FxiOS\/([\d.]+)/))} (iOS)`, engine: "WebKit (iOS)" };
  }
  if (/EdgiOS\//.test(userAgent)) {
    return { browser: `Edge${major(match(/EdgiOS\/([\d.]+)/))} (iOS)`, engine: "WebKit (iOS)" };
  }
  if (/Electron\//.test(userAgent) && /Chrome\//.test(userAgent)) {
    const electron = major(match(/Electron\/([\d.]+)/));
    const chromium = major(match(/Chrome\/([\d.]+)/));
    return { browser: `Electron${electron} (Chromium${chromium})`, engine: "Blink (Electron)" };
  }
  if (/Edg\//.test(userAgent)) {
    return { browser: `Edge${major(match(/Edg\/([\d.]+)/))}`, engine: "Blink" };
  }
  if (/OPR\//.test(userAgent)) {
    return { browser: `Opera${major(match(/OPR\/([\d.]+)/))}`, engine: "Blink" };
  }
  if (/Firefox\//.test(userAgent)) {
    return { browser: `Firefox${major(match(/Firefox\/([\d.]+)/))}`, engine: "Gecko" };
  }
  if (/Chrome\//.test(userAgent)) {
    return { browser: `Chrome${major(match(/Chrome\/([\d.]+)/))}`, engine: "Blink" };
  }
  if (/Safari\//.test(userAgent) && /Version\//.test(userAgent)) {
    return { browser: `Safari${major(match(/Version\/([\d.]+)/))}`, engine: "WebKit" };
  }
  return { browser: "Not recognised", engine: "Not recognised" };
}

/**
 * Client Hints report an operating-system build number for Windows, not a
 * marketing name: Windows 11 starts at 13.0.0 and every earlier value is
 * Windows 10. Showing "Windows 19.0.0" would look like a made-up version.
 */
export function describePlatform(platform: string | undefined, version: string | undefined): string {
  if (!platform) return "";
  if (!version) return platform;

  const majorVersion = Number.parseInt(version, 10);

  if (platform === "Windows") {
    if (!Number.isFinite(majorVersion) || majorVersion <= 0) return "Windows";
    return majorVersion >= 13 ? "Windows 11" : "Windows 10";
  }
  if (platform === "macOS" || platform === "macOS X") {
    return `macOS ${version.replace(/\.0$/, "")}`;
  }
  if (platform === "Android") {
    return `Android ${version.split(".")[0]}`;
  }
  if (platform === "Chrome OS") {
    return `Chrome OS ${version}`;
  }
  return `${platform} ${version}`;
}

export interface UaBrand {
  brand: string;
  version: string;
}

export interface UaDataLike {
  brands?: UaBrand[];
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<UaHighEntropy>;
}

export interface UaHighEntropy {
  platform?: string;
  platformVersion?: string;
  architecture?: string;
  bitness?: string;
  model?: string;
  mobile?: boolean;
  uaFullVersion?: string;
  fullVersionList?: UaBrand[];
}

/** Picks the meaningful brand: Client Hints include placeholder brands like "Not A(Brand". */
export function meaningfulBrands(brands: UaBrand[] | undefined): UaBrand[] {
  return (brands ?? []).filter(
    (entry) => !/not.?a.?brand/i.test(entry.brand) && entry.brand !== "Chromium",
  );
}

export function describeHints(brands: UaBrand[] | undefined): string {
  const meaningful = meaningfulBrands(brands);
  if (meaningful.length === 0) return "";
  return meaningful.map((entry) => `${entry.brand} ${entry.version}`).join(", ");
}
