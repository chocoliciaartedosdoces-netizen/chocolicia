import { SITE, WA_ORCAMENTO } from "@/config/site";
import { BreadcrumbSchema, PageMeta, WebPageSchema } from "@/seo/JsonLd";
import { getRouteMeta } from "@/seo/routeMeta";
import { trackEvent } from "@/lib/analytics";

const meta = getRouteMeta("/sobre");

export default function Sobre() {
  return <div className="min-h-screen bg-[#FFF9F0] text-[#5A3428]">
    <PageMeta meta={meta} />
    <WebPageSchema name={meta.title} description={meta.description} url={meta.canonical} />
    <BreadcrumbSchema items={[{ name: "Início", url: SITE.url }, { name: "Sobre a Chocolícia", url: meta.canonical }]} />
    <header className="bg-[#3A241D] px-4 py-5 text-[#FFF9F0]"><div className="mx-auto flex max-w-5xl items-center justify-between"><a href="/" className="font-display text-2xl">Chocolícia</a><a href="/" className="text-sm text-[#FFF9F0]/75">Voltar ao site</a></div></header>
    <main>
      <section className="bg-[#F3E5D0]/60 px-4 py-14 md:px-6 md:py-20"><div className="mx-auto max-w-4xl">
        <p className="eyebrow mb-3">Sobre a Chocolícia</p><h1 className="font-display text-5xl leading-tight md:text-7xl">Feito à mão, com qualidade e atenção aos detalhes</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#8A5A44]">A Chocolícia é uma empresa de doces artesanais e buffet com base em Niterói, no Rio de Janeiro. O trabalho combina produção manual, cuidado nos acabamentos e atendimento próximo para transformar ideias de celebração em encomendas personalizadas.</p><p className="mt-4 text-xs uppercase tracking-[.16em] text-[#8A5A44]/75">Conteúdo atualizado em 31 de outubro de 2026</p>
      </div></section>
      <section className="px-4 py-12 md:px-6 md:py-20"><div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {["Qualidade no preparo", "Trabalho manual", "Detalhes que personalizam"].map((title, i) => <article key={title} className="rounded-2xl border border-[#D9A83E]/30 p-6"><h2 className="font-display text-3xl">{title}</h2><p className="mt-3 leading-7 text-[#8A5A44]">{["Cada encomenda é conversada conforme a ocasião, o perfil do evento e o resultado esperado.", "Bolos, doces e composições são preparados com atenção em cada etapa, do conceito à finalização.", "Temas, cores e formatos podem ser alinhados diretamente para criar uma experiência coerente com a comemoração."][i]}</p></article>)}
      </div></section>
      <section className="bg-[#3A241D] px-4 py-12 text-[#FFF9F0] md:px-6 md:py-16"><div className="mx-auto max-w-5xl"><h2 className="font-display text-4xl">Onde atendemos e como contratar</h2><p className="mt-4 max-w-3xl leading-8 text-[#FFF9F0]/75">A base fica em Niterói e o atendimento alcança São Gonçalo, Maricá, Itaboraí e outras cidades do estado do Rio de Janeiro, conforme o serviço e a disponibilidade. Para contratar, envie a data, a cidade, o tipo de evento e o que você deseja pelo WhatsApp.</p><a href={WA_ORCAMENTO} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { placement: "about_cta" })} className="button-gold mt-6 inline-flex">Conversar sobre meu evento</a></div></section>
    </main>
    <footer className="bg-[#3A241D] px-4 pb-10 text-center text-sm text-[#FFF9F0]/65"><p>{SITE.fullName} · {SITE.city}, {SITE.state}</p><a href={`mailto:${SITE.email}`} onClick={() => trackEvent("email_click", { placement: "about_footer" })}>{SITE.email}</a></footer>
  </div>;
}
