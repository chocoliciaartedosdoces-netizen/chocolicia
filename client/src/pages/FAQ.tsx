import { SITE, WA_ORCAMENTO } from "@/config/site";
import { BreadcrumbSchema, FAQSchema, PageMeta, WebPageSchema } from "@/seo/JsonLd";
import { getRouteMeta } from "@/seo/routeMeta";
import { trackEvent } from "@/lib/analytics";

const meta = getRouteMeta("/faq");
const faqs = [
  ["Como pedir um orçamento?", "Envie pelo WhatsApp a data, a cidade, o tipo de evento, a quantidade aproximada de convidados e o que você deseja encomendar. A Chocolícia responde com as próximas informações."],
  ["Quais serviços a Chocolícia oferece?", "A Chocolícia trabalha com doces artesanais, bolos personalizados, kits festa e buffet para festas e eventos."],
  ["Onde a Chocolícia atende?", "A base fica em Niterói e o atendimento alcança São Gonçalo, Maricá, Itaboraí e outras cidades do estado do Rio de Janeiro, conforme disponibilidade."],
  ["Com quanto tempo devo encomendar?", "O prazo depende do tipo de pedido, da complexidade e da agenda. Consulte a disponibilidade informando a data do evento antes de confirmar a encomenda."],
  ["A Chocolícia faz bolos personalizados?", "Sim. O tema, as cores, o tamanho e os detalhes do bolo são conversados conforme a ocasião e a referência do cliente."],
  ["Quais doces podem ser encomendados?", "A Chocolícia prepara brigadeiros, doces finos e outras opções artesanais. Sabores, formatos e quantidades são alinhados no atendimento."],
  ["A Chocolícia monta buffet para festas?", "Sim. O buffet pode ser planejado para a ocasião, com cardápio e montagem conversados conforme o evento, o local e a disponibilidade."],
  ["Vocês entregam em outras cidades?", "A possibilidade de entrega ou montagem depende da cidade, do serviço e da logística. Informe o endereço ou a região ao solicitar o orçamento."],
  ["Há opções para alergias ou restrições alimentares?", "Converse com a Chocolícia antes de confirmar o pedido para verificar ingredientes, riscos de contaminação e possibilidades reais para sua necessidade."],
  ["Como funciona o pagamento?", "As condições de pagamento são informadas no atendimento, de acordo com o pedido, a data e o serviço contratado."],
  ["A Chocolícia vende panetone ou chocotone?", "A disponibilidade de panetones artesanais e chocotones é sazonal. Consulte a produção e as opções disponíveis para o período desejado."],
  ["Como falar com a Chocolícia?", `Você pode falar pelo WhatsApp ${SITE.whatsappDisplay}, pelo e-mail ${SITE.email} ou pelo formulário de orçamento do site.`],
];

export default function FAQ() {
  return <div className="min-h-screen bg-[#FFF9F0] text-[#5A3428]"><PageMeta meta={meta} /><WebPageSchema name={meta.title} description={meta.description} url={meta.canonical} /><BreadcrumbSchema items={[{ name: "Início", url: SITE.url }, { name: "Perguntas frequentes", url: meta.canonical }]} /><FAQSchema items={faqs.map(([question, answer]) => ({ question, answer }))} />
    <header className="bg-[#3A241D] px-4 py-5 text-[#FFF9F0]"><div className="mx-auto flex max-w-5xl items-center justify-between"><a href="/" className="font-display text-2xl">Chocolícia</a><a href="/" className="text-sm text-[#FFF9F0]/75">Voltar ao site</a></div></header>
    <main><section className="bg-[#F3E5D0]/60 px-4 py-14 md:px-6 md:py-20"><div className="mx-auto max-w-4xl"><p className="eyebrow mb-3">Respostas diretas</p><h1 className="font-display text-5xl leading-tight md:text-7xl">Perguntas frequentes sobre encomendas e festas</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#8A5A44]">Veja as informações principais para planejar doces, bolos personalizados ou buffet com a Chocolícia.</p></div></section><section className="px-4 py-12 md:px-6 md:py-20"><div className="mx-auto max-w-4xl space-y-3">{faqs.map(([question, answer], i) => <details key={question} className="faq-item" open={i === 0}><summary>{question}<span aria-hidden="true">⌄</span></summary><p>{answer}</p></details>)}<div className="pt-8 text-center"><a href={WA_ORCAMENTO} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { placement: "faq_cta" })} className="button-gold button-primary">Pedir orçamento pelo WhatsApp</a></div></div></section></main>
    <footer className="bg-[#3A241D] px-4 py-10 text-center text-sm text-[#FFF9F0]/65"><a href="/sobre">Conheça a Chocolícia</a> · <a href={`mailto:${SITE.email}`}>{SITE.email}</a></footer>
  </div>;
}
