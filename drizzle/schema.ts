import { boolean, index, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in", { withTimezone: true }).defaultNow().notNull(),
});

export const s3Files = pgTable("s3_files", {
  id: serial("id").primaryKey(),
  objectKey: text("object_key").notNull().unique(),
  fileUrl: text("file_url").notNull(),
  alt: varchar("alt", { length: 180 }).notNull(),
  contentType: varchar("content_type", { length: 255 }),
  userId: varchar("user_id", { length: 128 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  eventType: varchar("event_type", { length: 120 }).notNull(),
  guests: varchar("guests", { length: 80 }).notNull(),
  desiredDate: varchar("desired_date", { length: 32 }),
  category: varchar("category", { length: 120 }).notNull(),
  details: text("details"),
  status: varchar("status", { length: 32 }).default("new").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const receitas = pgTable("receitas", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  slug: text("slug").notNull().unique(),
  resumo: text("resumo"),
  ingredientes: jsonb("ingredientes").$type<string[]>().notNull().default([]),
  modoPreparo: jsonb("modo_preparo").$type<string[]>().notNull().default([]),
  tempoPreparo: text("tempo_preparo"),
  rendimento: text("rendimento"),
  imagemUrl: text("imagem_url"),
  imagemAlt: text("imagem_alt"),
  status: varchar("status", { length: 16 }).default("rascunho").notNull(),
  publicadoEm: timestamp("publicado_em", { withTimezone: true }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("receitas_status_publicado_em_idx").on(table.status, table.publicadoEm)]);

export const promocoes = pgTable("promocoes", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  slug: text("slug").notNull().unique(),
  subtitulo: text("subtitulo"),
  bannerUrl: text("banner_url"),
  conteudo: text("conteudo"),
  chamadaBotao: text("chamada_botao"),
  linkBotao: text("link_botao"),
  ativa: boolean("ativa").default(false).notNull(),
  dataInicio: timestamp("data_inicio", { withTimezone: true }),
  dataFim: timestamp("data_fim", { withTimezone: true }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type S3File = typeof s3Files.$inferSelect;
export type InsertS3File = typeof s3Files.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type Receita = typeof receitas.$inferSelect;
export type Promocao = typeof promocoes.$inferSelect;
