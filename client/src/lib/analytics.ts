/**
 * Helper de analytics para eventos de conversão.
 * Usa window.gtag (já definido pelo snippet GA4 no index.html).
 * Fallback para dataLayer caso gtag ainda não esteja definido.
 */

type EventParams = Record<string, string | number | boolean>;

export const CONSENT_KEY = "chocolicia-consent-v3";
export const CONSENT_VERSION = 1;

export type ConsentPreferences = {
  analytics: boolean;
  advertising: boolean;
};

export type StoredConsent = ConsentPreferences & {
  version: number;
  updatedAt: string;
};

declare global {
  interface Window {
    gtag?: (command: "event" | "config" | "consent" | "js", name: string | Date, params?: EventParams) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", name, { ...params, page_location: window.location.href });
  } else {
    // Fallback: empurra direto para o dataLayer do GTM/GA4
    window.dataLayer = window.dataLayer ?? [];
    (window.dataLayer as unknown[]).push({ event: name, ...params });
  }
}

export function updateConsentPreferences(preferences: ConsentPreferences): void {
  if (typeof window === "undefined") return;
  const values = {
    ad_storage: preferences.advertising ? "granted" : "denied",
    ad_user_data: preferences.advertising ? "granted" : "denied",
    ad_personalization: preferences.advertising ? "granted" : "denied",
    analytics_storage: preferences.analytics ? "granted" : "denied",
  } as const;
  if (typeof window.gtag === "function") window.gtag("consent", "update", values);
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: "consent_preferences_updated", ...values });
}

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.version !== CONSENT_VERSION || typeof parsed.analytics !== "boolean" || typeof parsed.advertising !== "boolean") return null;
    return parsed as StoredConsent;
  } catch {
    return null;
  }
}

export function saveConsent(preferences: ConsentPreferences): StoredConsent {
  const stored: StoredConsent = { ...preferences, version: CONSENT_VERSION, updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));
  } catch {
    // Private browsing or disabled storage: the in-memory choice still applies.
  }
  updateConsentPreferences(preferences);
  return stored;
}
