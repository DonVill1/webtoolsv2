import type { IpAddress } from "./ip";

export interface IpWhoResponse {
  success?: boolean;
  message?: string;
  ip?: string;
  type?: string;
  continent?: string;
  country?: string;
  country_code?: string;
  region?: string;
  postal?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  connection?: { asn?: number; org?: string; isp?: string; domain?: string };
  timezone?: { id?: string };
}

export interface IpDetails {
  ip: string;
  version: 4 | 6;
  continent: string | null;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  postal: string | null;
  latitude: number | null;
  longitude: number | null;
  isp: string | null;
  org: string | null;
  asn: number | null;
  asnDomain: string | null;
  timezone: string | null;
  source: string;
  sourceUrl: string;
  checkedAt: string;
}

/** ipwho.is is the single provider for both the route and the direct browser call. */
export function mapIpWho(data: IpWhoResponse, address: IpAddress): IpDetails {
  return {
    ip: data.ip ?? address.canonical,
    version: address.version,
    continent: data.continent ?? null,
    country: data.country ?? null,
    countryCode: data.country_code ?? null,
    region: data.region ?? null,
    city: data.city ?? null,
    postal: data.postal ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    isp: data.connection?.isp ?? null,
    org: data.connection?.org ?? null,
    asn: data.connection?.asn ?? null,
    asnDomain: data.connection?.domain ?? null,
    timezone: data.timezone?.id ?? null,
    source: "ipwho.is",
    sourceUrl: "https://ipwho.is",
    checkedAt: new Date().toISOString(),
  };
}
