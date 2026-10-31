export interface LoanRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface LoanResult {
  payment: number;
  totalPaid: number;
  totalInterest: number;
  months: number;
  schedule: LoanRow[];
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Fixed-rate, fully amortising loan with payments at the end of each month.
 * The final row absorbs rounding so the balance reaches exactly zero.
 */
export function loan(principal: number, annualRatePct: number, years: number): LoanResult | null {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRatePct) || !Number.isFinite(years)) return null;
  if (principal <= 0 || principal > 100_000_000) return null;
  if (annualRatePct < 0 || annualRatePct > 100) return null;
  if (years <= 0 || years > 50) return null;

  const months = Math.round(years * 12);
  const monthlyRate = annualRatePct / 100 / 12;
  const payment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

  const schedule: LoanRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let month = 1; month <= months; month += 1) {
    const interest = round(balance * monthlyRate);
    const isLast = month === months;
    const principalPart = isLast ? balance : Math.min(balance, round(payment - interest));
    const paid = round(interest + principalPart);
    balance = round(balance - principalPart);
    totalInterest = round(totalInterest + interest);
    schedule.push({ month, payment: paid, interest, principal: round(principalPart), balance });
  }

  return {
    payment: round(payment),
    totalPaid: round(schedule.reduce((sum, row) => sum + row.payment, 0)),
    totalInterest,
    months,
    schedule,
  };
}

export interface VatResult {
  net: number;
  vat: number;
  gross: number;
  factor: number;
}

/** Add VAT to a net amount or remove it from a gross amount. */
export function vat(amount: number, ratePct: number, mode: "add" | "remove"): VatResult | null {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000) return null;
  if (!Number.isFinite(ratePct) || ratePct < 0 || ratePct > 100) return null;
  const factor = 1 + ratePct / 100;
  if (factor <= 0) return null;

  if (mode === "add") {
    const gross = amount * factor;
    return { net: amount, vat: gross - amount, gross, factor };
  }
  const net = amount / factor;
  return { net, vat: amount - net, gross: amount, factor };
}

export interface TipResult {
  tip: number;
  total: number;
  perPerson: number;
  extra: number;
  people: number;
}

export function tip(
  bill: number,
  ratePct: number,
  people: number,
  roundUp: boolean,
): TipResult | null {
  if (!Number.isFinite(bill) || bill < 0 || bill > 1_000_000) return null;
  if (!Number.isFinite(ratePct) || ratePct < 0 || ratePct > 100) return null;
  if (!Number.isFinite(people)) return null;
  const heads = Math.min(100, Math.max(1, Math.floor(people)));
  const rawTip = (bill * ratePct) / 100;
  const rawTotal = bill + rawTip;
  const total = roundUp ? Math.ceil(rawTotal) : rawTotal;
  const extra = total - rawTotal;
  return {
    tip: extra + rawTip,
    total,
    perPerson: total / heads,
    extra,
    people: heads,
  };
}

const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
  BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, EG: 29,
  ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28,
  HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20,
  LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19,
  MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
  RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26, UA: 29,
  VA: 22, VG: 24, XK: 20,
};

export interface IbanResult {
  valid: boolean;
  normalized: string;
  formatted: string;
  country: string;
  checkDigits: string;
  bban: string;
  expectedLength: number | null;
  error: string | null;
}

function mod97(value: string): number {
  let remainder = 0;
  for (const char of value) {
    remainder = (remainder * 10 + Number(char)) % 97;
  }
  return remainder;
}

export function validateIban(input: string): IbanResult {
  const normalized = input.replace(/[\s-]/g, "").toUpperCase();
  const base: IbanResult = {
    valid: false,
    normalized,
    formatted: normalized.replace(/(.{4})/g, "$1 ").trim(),
    country: normalized.slice(0, 2),
    checkDigits: normalized.slice(2, 4),
    bban: normalized.slice(4),
    expectedLength: IBAN_LENGTHS[normalized.slice(0, 2)] ?? null,
    error: null,
  };
  if (!normalized) return { ...base, error: null };
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(normalized)) {
    return { ...base, error: "An IBAN starts with two letters, two check digits, then letters and digits only." };
  }
  if (base.expectedLength !== null && normalized.length !== base.expectedLength) {
    return {
      ...base,
      error: `${base.country} IBANs are ${base.expectedLength} characters; this one is ${normalized.length}.`,
    };
  }

  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (letter) => String(letter.charCodeAt(0) - 55));
  if (mod97(numeric) !== 1) {
    return { ...base, error: "The mod-97 checksum does not equal 1. Check for a transposed or mistyped character." };
  }
  return { ...base, valid: true };
}

export interface BicResult {
  valid: boolean;
  bank: string;
  country: string;
  location: string;
  branch: string;
  error: string | null;
}

export function validateBic(input: string): BicResult {
  const value = input.replace(/\s/g, "").toUpperCase();
  const base = {
    valid: false,
    bank: value.slice(0, 4),
    country: value.slice(4, 6),
    location: value.slice(6, 8),
    branch: value.slice(8),
    error: null as string | null,
  };
  if (!value) return base;
  if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value)) {
    return {
      ...base,
      error: "A BIC is 8 or 11 characters: four letters for the bank, two for the country, two for the location, then an optional branch.",
    };
  }
  return { ...base, valid: true };
}
