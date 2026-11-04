CREATE TABLE "receitas" (
	"id" serial PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"slug" text NOT NULL,
	"resumo" text,
	"ingredientes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"modo_preparo" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tempo_preparo" text,
	"rendimento" text,
	"imagem_url" text,
	"imagem_alt" text,
	"status" varchar(16) DEFAULT 'rascunho' NOT NULL,
	"publicado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "receitas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "receitas_status_publicado_em_idx" ON "receitas" USING btree ("status","publicado_em");
--> statement-breakpoint
CREATE TABLE "promocoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"slug" text NOT NULL,
	"subtitulo" text,
	"banner_url" text,
	"conteudo" text,
	"chamada_botao" text,
	"link_botao" text,
	"ativa" boolean DEFAULT false NOT NULL,
	"data_inicio" timestamp with time zone,
	"data_fim" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promocoes_slug_unique" UNIQUE("slug")
);
