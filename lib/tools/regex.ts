export interface RegexMatch {
  index: number;
  value: string;
  groups: Array<string | undefined>;
  named: Record<string, string | undefined>;
}

export interface RegexResult {
  error: string | null;
  matches: RegexMatch[];
  replaced: string;
  truncated: boolean;
}

const LIMIT = 1000;

/** Test a JavaScript pattern against text without leaking lastIndex between runs. */
export function testRegex(
  pattern: string,
  flags: string,
  text: string,
  replacement: string,
): RegexResult {
  const base: RegexResult = { error: null, matches: [], replaced: text, truncated: false };
  if (!pattern) return base;

  const uniqueFlags = Array.from(new Set(flags.split(""))).join("");
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, uniqueFlags.includes("g") ? uniqueFlags : `${uniqueFlags}g`);
  } catch (error) {
    return { ...base, error: error instanceof Error ? error.message : "That is not a valid regular expression." };
  }

  const matches: RegexMatch[] = [];
  let match: RegExpExecArray | null;
  let truncated = false;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      value: match[0],
      groups: match.slice(1),
      named: match.groups ? { ...match.groups } : {},
    });
    if (match[0] === "") regex.lastIndex += 1;
    if (matches.length >= LIMIT) {
      truncated = true;
      break;
    }
  }

  let replaced = text;
  if (replacement !== "") {
    try {
      replaced = text.replace(new RegExp(pattern, uniqueFlags), replacement);
    } catch {
      replaced = text;
    }
  }

  return { error: null, matches, replaced, truncated };
}
