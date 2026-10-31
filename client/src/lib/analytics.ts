/**
 * Helper de analytics para eventos de conversão.
 * Usa window.gtag (já definido pelo snippet GA4 no index.html).
 * Fallback para dataLayer caso gtag ainda não esteja definido.
 */

type EventParams = Record<string, string | number | boolean>;

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

export function updateConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  const values = granted
    ? { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" }
    : { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" };
  if (typeof window.gtag === "function") window.gtag("consent", "update", values);
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: granted ? "consent_granted" : "consent_denied", ...values });
}
