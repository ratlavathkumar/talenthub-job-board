import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const companiesTable = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
  industry: text("industry"),
  description: text("description"),
  size: text("size"),
  location: text("location"),
  approved: boolean("approved").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companiesTable).omit({ id: true, createdAt: true, approved: true });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companiesTable.$inferSelect;
