"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatBytes } from "@/lib/format";
import {
  describeHints,
  describePlatform,
  describeUserAgent,
  getDisplaySnapshot,
  getServerSnapshot,
  subscribeDisplay,
  type UaDataLike,
  type UaHighEntropy,
} from "@/lib/network/system-info";
import { useToolView } from "./useToolView";

interface StorageInfo {
  usage: number;
  quota: number;
  persisted: boolean;
}

interface Row {
  label: string;
  value: string;
}

interface Section {
  title: string;
  rows: Row[];
}

function memoryLabel(value: number | undefined): string {
  if (!value) return "Not exposed";
  if (value >= 8) return "8 GB or more (capped by the browser)";
  return `${value} GB (rounded by the browser)`;
}

function utcOffset(): string {
  const minutes = -new Date().getTimezoneOffset();
  const sign = minutes >= 0 ? "+" : "−";
  const absolute = Math.abs(minutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const rest = String(absolute % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${rest}`;
}

function percent(usage: number, quota: number): string {
  if (!quota) return "—";
  const share = (usage / quota) * 100;
  if (share > 0 && share < 0.01) return "< 0.01% of quota";
  return `${share.toFixed(2)}% of quota`;
}

interface NetworkInformationLike {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

interface NavigatorExtras extends Navigator {
  deviceMemory?: number;
  userAgentData?: UaDataLike;
  connection?: NetworkInformationLike;
}

const SECTION_BY_VIEW: Record<string, string[]> = {
  general: ["Browser", "Platform and hardware"],
  display: ["Display"],
  graphics: ["Graphics"],
  network: ["Network"],
  storage: ["Storage and time"],
};

const VIEW_NOTE: Record<string, string> = {
  general: "What the browser reports about itself and the machine it runs on.",
  display: "Screen, viewport and the display preferences the page can detect.",
  graphics: "The WebGL adapter the browser exposes, and the limits it reports.",
  network: "Connection estimates exposed by the Network Information API; browsers cap or hide these values.",
  storage: "Quota, usage, time zone and locale for this origin.",
};

function buildSections(
  snapshot: ReturnType<typeof getDisplaySnapshot>,
  hints: UaHighEntropy | null,
  storage: StorageInfo | null,
): Section[] {
  const navigatorWithHints = navigator as NavigatorExtras;
  const uaData = navigatorWithHints.userAgentData;
  const legacy = describeUserAgent(navigator.userAgent);
  const brands = hints?.fullVersionList ?? uaData?.brands;
  const brandLabel = describeHints(brands);
  const reportedPlatform = hints?.platform ?? uaData?.platform;
  const platform = describePlatform(reportedPlatform, hints?.platformVersion);
  const connection = navigatorWithHints.connection;
  const architecture = [hints?.architecture, hints?.bitness ? `${hints.bitness}-bit` : ""]
    .filter(Boolean)
    .join(" ");
  const electron = navigator.userAgent.match(/Electron\/([\d.]+)/)?.[1];

  return [
    {
      title: "Browser",
      rows: [
        { label: "Browser", value: brandLabel || legacy.browser },
        { label: "Engine", value: legacy.engine },
        { label: "Runtime", value: electron ? `Electron ${electron}` : "Browser tab" },
        { label: "Reported brands", value: describeHints(uaData?.brands) || "Not exposed" },
        { label: "User agent", value: navigator.userAgent },
        { label: "Languages", value: navigator.languages?.join(", ") || navigator.language || "—" },
        { label: "Cookies enabled", value: navigator.cookieEnabled ? "Yes" : "No" },
        { label: "Online", value: navigator.onLine ? "Yes" : "No" },
      ],
    },
    {
      title: "Platform and hardware",
      rows: [
        { label: "Platform", value: platform || navigator.platform || "Not exposed" },
        ...(reportedPlatform === "Windows" && hints?.platformVersion
          ? [{ label: "Reported platform version", value: hints.platformVersion }]
          : []),
        {
          label: "Architecture",
          value: architecture || "Not exposed",
        },
        { label: "Device model", value: hints?.model || "Not reported" },
        { label: "Mobile device", value: (hints?.mobile ?? uaData?.mobile) ? "Yes" : "No" },
        { label: "Logical cores", value: String(navigator.hardwareConcurrency ?? "Not exposed") },
        { label: "Device memory", value: memoryLabel(navigatorWithHints.deviceMemory) },
        { label: "Max touch points", value: String(navigator.maxTouchPoints ?? 0) },
        { label: "Primary pointer", value: snapshot.pointer },
        { label: "Hover capable", value: snapshot.hover ? "Yes" : "No" },
      ],
    },
    {
      title: "Display",
      rows: [
        {
          label: "Viewport",
          value: `${snapshot.viewportWidth} × ${snapshot.viewportHeight} CSS px`,
        },
        { label: "Screen", value: `${snapshot.screenWidth} × ${snapshot.screenHeight} CSS px` },
        {
          label: "Native resolution",
          value: `${snapshot.nativeWidth} × ${snapshot.nativeHeight} device px (estimated from the pixel ratio)`,
        },
        {
          label: "Available screen",
          value: `${snapshot.availWidth} × ${snapshot.availHeight} CSS px`,
        },
        { label: "Pixel ratio", value: `${snapshot.devicePixelRatio}×` },
        {
          label: "Scrollbar width",
          value: `${Math.max(0, snapshot.viewportWidth - document.documentElement.clientWidth)} CSS px`,
        },
        { label: "Orientation", value: snapshot.orientation },
        { label: "Colour depth", value: `${snapshot.colorDepth}-bit` },
        { label: "Colour gamut", value: snapshot.colorGamut },
        { label: "Dynamic range", value: snapshot.dynamicRange },
        { label: "Colour scheme", value: snapshot.colorScheme },
        { label: "Contrast preference", value: snapshot.contrast },
        { label: "Forced colours", value: snapshot.forcedColors ? "Active" : "No" },
        { label: "Reduced motion", value: snapshot.reducedMotion ? "Requested" : "No preference" },
      ],
    },
    {
      title: "Graphics",
      rows: [
        { label: "WebGL vendor", value: snapshot.gpu.vendor },
        { label: "WebGL renderer", value: snapshot.gpu.renderer },
        { label: "WebGL version", value: snapshot.gpu.version },
        { label: "WebGL 2", value: snapshot.gpu.webgl2 ? "Available" : "Unavailable" },
        {
          label: "Max texture size",
          value: snapshot.gpu.maxTexture ? `${snapshot.gpu.maxTexture} px` : "—",
        },
      ],
    },
    {
      title: "Network",
      rows: [
        { label: "Effective type", value: connection?.effectiveType ?? "Not exposed" },
        {
          label: "Downlink estimate",
          value: connection?.downlink ? `${connection.downlink} Mbit/s` : "Not exposed",
        },
        { label: "Round-trip time", value: connection?.rtt ? `${connection.rtt} ms` : "Not exposed" },
        { label: "Save-Data", value: connection?.saveData ? "On" : "Off or not exposed" },
        { label: "Connection type", value: connection?.type ?? "Not exposed" },
      ],
    },
    {
      title: "Storage and time",
      rows: [
        { label: "Storage used", value: storage ? formatBytes(storage.usage) : "Not exposed" },
        { label: "Storage quota", value: storage ? formatBytes(storage.quota) : "Not exposed" },
        {
          label: "Quota used",
          value: storage ? percent(storage.usage, storage.quota) : "Not exposed",
        },
        {
          label: "Persistent storage",
          value: storage ? (storage.persisted ? "Granted" : "Not granted") : "Not exposed",
        },
        {
          label: "Time zone",
          value: Intl.DateTimeFormat().resolvedOptions().timeZone || "Not exposed",
        },
        { label: "UTC offset", value: utcOffset() },
        {
          label: "Locale",
          value: Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || "—",
        },
      ],
    },
  ];
}

export default function SystemInfo() {
  const { view } = useToolView("system-info");
  const snapshot = useSyncExternalStore(subscribeDisplay, getDisplaySnapshot, getServerSnapshot);
  const [hints, setHints] = useState<UaHighEntropy | null>(null);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [capturedAt, setCapturedAt] = useState(() => Date.now());
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const navigatorWithHints = navigator as NavigatorExtras;
    const data = navigatorWithHints.userAgentData;

    if (data?.getHighEntropyValues) {
      data
        .getHighEntropyValues([
          "platform",
          "platformVersion",
          "architecture",
          "bitness",
          "model",
          "uaFullVersion",
          "fullVersionList",
        ])
        .then((values) => {
          if (!cancelled) setHints(values);
        })
        .catch(() => {
          // Client Hints are optional; the fallback values stay in place.
        });
    }

    if (navigator.storage?.estimate) {
      Promise.all([
        navigator.storage.estimate(),
        navigator.storage.persisted?.() ?? Promise.resolve(false),
      ])
        .then(([estimate, persisted]) => {
          if (cancelled) return;
          setStorage({
            usage: estimate.usage ?? 0,
            quota: estimate.quota ?? 0,
            persisted,
          });
        })
        .catch(() => {
          // Storage estimates are optional too.
        });
    }

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const sections = snapshot.mounted ? buildSections(snapshot, hints, storage) : [];
  const visibleSections = sections.filter((section) =>
    (SECTION_BY_VIEW[view] ?? SECTION_BY_VIEW.general!).includes(section.title),
  );
  const report = [
    `System report — ${new Date(capturedAt).toISOString()}`,
    ...sections.map(
      (section) =>
        `\n${section.title}\n${section.rows.map((row) => `${row.label}: ${row.value}`).join("\n")}`,
    ),
  ].join("\n");

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <p className="micro" style={{ alignSelf: "end" }}>
          Read locally through browser APIs, updated as the window changes. Nothing is sent to the server.
          {snapshot.mounted ? (
            <>
              {" "}
              Refreshed at{" "}
              {new Date(capturedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
              .
            </>
          ) : null}
        </p>
        <div className="row-wrap" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setRefreshToken((token) => token + 1);
              setCapturedAt(Date.now());
            }}
          >
            Refresh
          </button>
          <CopyButton value={report} label="Copy report" />
        </div>
      </div>

      {snapshot.mounted ? (
        <div style={{ display: "grid", gap: 18 }}>
          <p className="micro" style={{ margin: 0 }}>{VIEW_NOTE[view] ?? VIEW_NOTE.general}</p>
          {visibleSections.map((section) => (
            <div key={section.title} className="table-wrap">
              <table className="table">
                <caption>{section.title}</caption>
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" style={{ width: "34%" }}>
                        {row.label}
                      </th>
                      <td className="mono" style={{ overflowWrap: "anywhere" }}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <p className="micro">Reading browser properties…</p>
      )}

      <div className="callout" style={{ marginTop: 18 }}>
        <strong>Your user agent is a fingerprint.</strong> Sharing a full system report can identify your
        browser build. Remove lines you do not need before posting it in a bug report.
      </div>
    </div>
  );
}
