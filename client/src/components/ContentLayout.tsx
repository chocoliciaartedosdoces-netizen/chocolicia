import type { ReactNode } from "react";
import { BookOpen, House, MessageCircle, Tag } from "lucide-react";
import { SITE, WA_ORCAMENTO } from "@/config/site";
import Dock from "@/components/Dock";
import { trackEvent } from "@/lib/analytics";

export default function ContentLayout({ children, title }: { children: ReactNode; title: string }) {
  const dockItems = [
    { icon: <House size={18} />, label: "Início", onClick: () => { window.location.href = "/"; } },
    { icon: <BookOpen size={18} />, label: "Receitas", onClick: () => { window.location.href = "/receitas"; } },
    { icon: <Tag size={18} />, label: "Promoções", onClick: () => { window.location.href = "/promocoes"; } },
    { icon: <MessageCircle size={18} />, label: "WhatsApp", onClick: () => { trackEvent("whatsapp_click", { placement: "content_dock" }); window.open(WA_ORCAMENTO, "_blank", "noopener,noreferrer"); } },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-24 text-[#5A3428] md:pb-0">
      <header className="border-b border-[#5A3428]/10 bg-[#FFF9F0] px-4 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="font-display text-3xl" aria-label="Chocolícia — início">Chocolícia</a>
          <nav className="hidden gap-6 text-sm md:flex" aria-label="Navegação principal">
            <a href="/">Início</a>
            <a href="/receitas" className={title === "Receitas" ? "font-semibold text-[#B4772A]" : ""}>Receitas</a>
            <a href="/promocoes" className={title === "Promoções" ? "font-semibold text-[#B4772A]" : ""}>Promoções</a>
            <a href="/#orcamento">Orçamento</a>
            <a href="/#contato">Contato</a>
          </nav>
          <a href={WA_ORCAMENTO} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { placement: "content_header" })} className="button-gold hidden sm:inline-flex">Fale conosco</a>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-16 bg-[#3A241D] px-4 py-10 text-center text-sm text-[#FFF9F0]/70">
        <p>{SITE.fullName} · {SITE.city}, {SITE.state}</p>
        <nav className="mt-4 flex justify-center gap-5" aria-label="Links do rodapé">
          <a href="/">Início</a>
          <a href="/receitas">Receitas</a>
          <a href="/promocoes">Promoções</a>
          <a href="/politicas-e-termos">Privacidade</a>
        </nav>
      </footer>

      <Dock items={dockItems} panelHeight={68} baseItemSize={48} magnification={64} />
      <a href={WA_ORCAMENTO} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { placement: "content_floating_button" })} aria-label="Falar no WhatsApp" className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl md:bottom-8 md:right-8"><MessageCircle aria-hidden="true" /></a>
    </div>
  );
}
