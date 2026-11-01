import { useEffect, useRef, useState } from "react";
import { readStoredConsent, saveConsent, type ConsentPreferences } from "@/lib/analytics";

const empty: ConsentPreferences = { analytics: false, advertising: false };

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [preferences, setPreferences] = useState(empty);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored) {
      const next = { analytics: stored.analytics, advertising: stored.advertising };
      setPreferences(next);
      saveConsent(next);
    } else setVisible(true);
    const open = () => {
      triggerRef.current = document.activeElement as HTMLElement | null;
      const current = readStoredConsent();
      if (current) setPreferences({ analytics: current.analytics, advertising: current.advertising });
      setCustomizing(true);
      setVisible(true);
    };
    window.addEventListener("chocolicia:open-cookie-preferences", open);
    return () => window.removeEventListener("chocolicia:open-cookie-preferences", open);
  }, []);

  useEffect(() => {
    if (!visible) return;
    dialogRef.current?.querySelector<HTMLElement>("button, input")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && customizing) closePreferences();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, customizing]);

  const closePreferences = () => { setCustomizing(false); setVisible(false); triggerRef.current?.focus(); };
  const choose = (next: ConsentPreferences) => { saveConsent(next); setPreferences(next); setCustomizing(false); setVisible(false); };
  const preferencesLink = <button type="button" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[60] min-h-11 rounded-full border border-[#D9A83E]/60 bg-[#3A241D] px-3 py-2 text-xs text-[#FFF9F0] shadow-lg" onClick={() => { triggerRef.current = document.activeElement as HTMLElement | null; setCustomizing(true); setVisible(true); }}>Preferências de cookies</button>;
  if (!visible) return preferencesLink;

  return <>
    {preferencesLink}
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="cookie-title" aria-describedby="cookie-description" className="fixed inset-x-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-[70] mx-auto max-w-2xl rounded-2xl border border-[#D9A83E]/30 bg-[#3A241D] p-5 text-[#FFF9F0] shadow-2xl lg:bottom-4">
      <div className="flex items-start justify-between gap-4"><div><h2 id="cookie-title" className="font-display text-2xl">Sua privacidade importa</h2><p id="cookie-description" className="mt-2 text-sm leading-6 text-[#FFF9F0]/80">Usamos cookies para analisar o site e melhorar campanhas. Cookies não essenciais só são ativados com sua escolha. Leia a <a className="underline" href="/politicas-e-termos#cookies">Política de Privacidade e Cookies</a>.</p></div><button type="button" aria-label="Fechar sem salvar preferências" onClick={closePreferences} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-[#FFF9F0]/30 text-xl">×</button></div>
      {!customizing ? <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => choose(empty)} className="min-h-11 rounded-full border border-[#FFF9F0]/50 px-4 py-2 text-sm">Recusar não essenciais</button><button type="button" onClick={() => setCustomizing(true)} className="min-h-11 rounded-full border border-[#FFF9F0]/50 px-4 py-2 text-sm">Personalizar</button><button type="button" onClick={() => choose({ analytics: true, advertising: true })} className="button-gold min-h-11 px-4 py-2 text-sm">Aceitar todos</button></div> : <div className="mt-5 space-y-3"><label className="flex items-start justify-between gap-4 rounded-xl border border-[#FFF9F0]/15 p-3 text-sm"><span><strong>Necessários</strong><br /><span className="text-[#FFF9F0]/70">Funcionamento básico e sua escolha de consentimento.</span></span><input type="checkbox" checked disabled aria-label="Cookies necessários sempre ativos" /></label><label className="flex items-start justify-between gap-4 rounded-xl border border-[#FFF9F0]/15 p-3 text-sm"><span><strong>Análise e desempenho</strong><br /><span className="text-[#FFF9F0]/70">Mede visitas e navegação com Google Analytics 4.</span></span><input type="checkbox" checked={preferences.analytics} onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))} aria-label="Permitir análise e desempenho" /></label><label className="flex items-start justify-between gap-4 rounded-xl border border-[#FFF9F0]/15 p-3 text-sm"><span><strong>Publicidade e remarketing</strong><br /><span className="text-[#FFF9F0]/70">Ajuda a medir campanhas e publicidade do Google.</span></span><input type="checkbox" checked={preferences.advertising} onChange={(event) => setPreferences((current) => ({ ...current, advertising: event.target.checked }))} aria-label="Permitir publicidade e remarketing" /></label><div className="flex flex-wrap gap-3 pt-2"><button type="button" onClick={() => choose(empty)} className="min-h-11 rounded-full border border-[#FFF9F0]/50 px-4 py-2 text-sm">Recusar não essenciais</button><button type="button" onClick={() => choose(preferences)} className="button-gold min-h-11 px-4 py-2 text-sm">Salvar minhas escolhas</button><button type="button" onClick={() => choose({ analytics: true, advertising: true })} className="min-h-11 rounded-full border border-[#FFF9F0]/50 px-4 py-2 text-sm">Aceitar todos</button></div></div>}
    </div>
  </>;
}
