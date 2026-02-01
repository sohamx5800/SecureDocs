import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(), // 'pdf' | 'image'
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accessKeys = pgTable("access_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label"), // Optional description for the key (e.g. "Shipment #123")
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertAccessKeySchema = createInsertSchema(accessKeys).omit({ id: true, createdAt: true, isActive: true });

// Types
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type AccessKey = typeof accessKeys.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertAccessKey = z.infer<typeof insertAccessKeySchema>;
