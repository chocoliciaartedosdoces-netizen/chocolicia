import { useState } from "react";
import { updateConsent } from "@/lib/analytics";

const CONSENT_KEY = "chocolicia-consent-v2";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(CONSENT_KEY) === null;
  });

  const choose = (granted: boolean) => {
    window.localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
    updateConsent(granted);
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <aside className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-2xl rounded-2xl border border-[#D9A83E]/30 bg-[#3A241D] p-5 text-[#FFF9F0] shadow-2xl" aria-label="Consentimento de cookies">
      <p className="text-sm leading-6">Usamos cookies e tecnologias semelhantes para medir o site e melhorar sua experiência. Você pode aceitar ou recusar cookies de análise e publicidade.</p>
      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => choose(false)} className="rounded-full border border-[#FFF9F0]/40 px-4 py-2 text-sm">Recusar</button>
        <button type="button" onClick={() => choose(true)} className="button-gold px-4 py-2 text-sm">Aceitar</button>
      </div>
    </aside>
  );
}
