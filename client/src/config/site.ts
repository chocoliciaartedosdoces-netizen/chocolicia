/**
 * Configuração central do site – Chocolícia
 * Todos os dados de negócio ficam aqui. Campos opcionais só entram no JSON-LD
 * quando existem dados confirmados.
 */

export const SITE = {
  name: "Chocolícia – Arte dos Doces e Buffet",
        fullName: "Chocolícia – Arte dos Doces e Buffet",
  tagline: "Arte dos Doces e Buffet",
  description:
    "Doces artesanais, bolos personalizados e buffet para festas e eventos em Niterói e Região Metropolitana do Rio de Janeiro.",
  url: "https://www.chocolicia.site",
  organizationId: "https://www.chocolicia.site/#organization",
  businessId: "https://www.chocolicia.site/#business",
  email: "chocoliciaartedosdoces@gmail.com",

  /** Telefone/WhatsApp */
  whatsappNumber: "5521977359379", // formato para wa.me
  whatsappDisplay: "(21) 97735-9379",
  phoneLandline: "",

  /** Redes sociais */
  instagram: "https://www.instagram.com/janinegoncalves22/",
  facebook: "https://www.facebook.com/janine.goncalves.2025",
  tiktok: "https://www.tiktok.com/@janinegoncalves22",
  googleBusiness: "https://share.google/goyPUsqdHSK9p1cVc",

  /** Endereço detalhado, horários e preço só devem ser preenchidos após confirmação. */
  city: "Niterói",
  state: "RJ",
  country: "BR",
  streetAddress: "",
  postalCode: "",

  openingHours: [] as Array<{ dayOfWeek: string[]; opens: string; closes: string }>,

  /** Faixa de preço (schema.org: "$" a "$$$$") */
  priceRange: "",

  /** Imagem principal do negócio (OG e JSON-LD) */
  ogImage: "https://www.chocolicia.site/images/og-image.jpg",

  /** Áreas de atendimento */
        areaServed: ["Niterói", "São Gonçalo", "Maricá", "Itaboraí", "Estado do Rio de Janeiro"],
} as const;

/** URL de WhatsApp com mensagem pré-preenchida */
export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const WA_ORCAMENTO = waLink(
  "Olá, Chocolícia! Gostaria de solicitar um orçamento."
);
export const WA_SAUDACAO = waLink(
  "Olá, Chocolícia! Tudo bem? Gostaria de conhecer melhor o trabalho de vocês."
);
export const waProduct = (product: string) =>
  waLink(`Olá! Tenho interesse em ${product}. Poderia me enviar mais informações?`);
