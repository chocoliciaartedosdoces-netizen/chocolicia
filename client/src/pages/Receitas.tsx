import { useState } from "react";
import ContentLayout from "@/components/ContentLayout";
import { trpc } from "@/lib/trpc";
import { PageMeta } from "@/seo/JsonLd";
import { getRouteMeta } from "@/seo/routeMeta";

export default function Receitas() {
  const [pagina, setPagina] = useState(1);
  const query = trpc.receitas.listar.useQuery({ pagina, porPagina: 9 });
  const totalPages = Math.max(1, Math.ceil((query.data?.total ?? 0) / 9));
  return <ContentLayout title="Receitas"><PageMeta meta={getRouteMeta("/receitas")} /><section className="mx-auto max-w-6xl px-4 py-14"><p className="eyebrow">Cozinha Chocolícia</p><h1 className="section-title mt-3">Receitas para adoçar seu dia</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-[#8A5A44]">Ideias fáceis e deliciosas para preparar em casa e celebrar momentos especiais.</p>{query.isLoading && <p className="mt-10">Carregando receitas…</p>}{!query.isLoading && query.data?.items.length === 0 && <p className="mt-10 rounded-2xl bg-[#F3E5D0] p-6">Ainda estamos preparando novas receitas. Volte em breve!</p>}<div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{query.data?.items.map((recipe) => <article key={recipe.id} className="overflow-hidden rounded-3xl bg-white shadow-sm"><img src={recipe.imagemUrl || "/images/og-image.jpg"} alt={recipe.imagemAlt || recipe.titulo} className="h-56 w-full object-cover" /><div className="p-6"><h2 className="font-display text-3xl">{recipe.titulo}</h2><p className="mt-3 text-sm leading-6 text-[#8A5A44]">{recipe.resumo}</p><p className="mt-4 text-sm text-[#8A5A44]">{recipe.tempoPreparo || "Tempo não informado"}</p><a href={`/receitas/${recipe.slug}`} className="button-gold mt-5 inline-flex">Ver receita completa</a></div></article>)}</div>{totalPages > 1 && <div className="mt-10 flex items-center justify-center gap-4"><button className="button-outline" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>Anterior</button><span>Página {pagina} de {totalPages}</span><button className="button-outline" disabled={pagina === totalPages} onClick={() => setPagina((p) => p + 1)}>Próxima</button></div>}</section></ContentLayout>;
}
