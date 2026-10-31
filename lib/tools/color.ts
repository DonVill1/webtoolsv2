export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parse #rgb, #rrggbb or rgb(r, g, b). Returns null for anything else. */
export function parseColor(input: string): Rgb | null {
  const value = input.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return {
      r: parseInt(value[1]! + value[1]!, 16),
      g: parseInt(value[2]! + value[2]!, 16),
      b: parseInt(value[3]! + value[3]!, 16),
    };
  }
  if (/^#[0-9a-f]{6}$/.test(value)) {
    return {
      r: parseInt(value.slice(1, 3), 16),
      g: parseInt(value.slice(3, 5), 16),
      b: parseInt(value.slice(5, 7), 16),
    };
  }
  const rgb = /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/.exec(value);
  if (rgb) {
    const [r, g, b] = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    if ([r, g, b].every((channel) => channel >= 0 && channel <= 255)) return { r, g, b };
  }
  return null;
}

export function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const linear = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export interface ContrastVerdicts {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}

export function contrastVerdicts(text: Rgb, background: Rgb): ContrastVerdicts {
  const ratio = contrastRatio(text, background);
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

/**
 * Nearest passing colour by blending the text colour toward black or white.
 * Hue and saturation move with the blend; the result is a starting point.
 */
export function suggestPassing(text: Rgb, background: Rgb, target = 4.5): Rgb | null {
  const darken = relativeLuminance(background) > 0.4;
  const anchor: Rgb = darken ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  for (let step = 1; step <= 100; step += 1) {
    const amount = step / 100;
    const candidate: Rgb = {
      r: text.r + (anchor.r - text.r) * amount,
      g: text.g + (anchor.g - text.g) * amount,
      b: text.b + (anchor.b - text.b) * amount,
    };
    if (contrastRatio(candidate, background) >= target) return candidate;
  }
  return null;
}
