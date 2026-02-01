import { db } from "./db";
import {
  users, documents, accessKeys,
  type User, type InsertUser,
  type Document, type InsertDocument,
  type AccessKey, type InsertAccessKey
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;

  // Access Keys
  getAccessKeys(): Promise<AccessKey[]>;
  getAccessKey(key: string): Promise<AccessKey | undefined>;
  createAccessKey(key: InsertAccessKey): Promise<AccessKey>;
  deleteAccessKey(id: number): Promise<void>;
}

import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(user.password);
    const [newUser] = await db.insert(users).values({ ...user, password: hashedPassword }).returning();
    return newUser;
  }

  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(doc).returning();
    return newDoc;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getAccessKeys(): Promise<AccessKey[]> {
    return await db.select().from(accessKeys).orderBy(desc(accessKeys.createdAt));
  }

  async getAccessKey(key: string): Promise<AccessKey | undefined> {
    const [accessKey] = await db.select().from(accessKeys).where(eq(accessKeys.key, key));
    return accessKey;
  }

  async createAccessKey(key: InsertAccessKey): Promise<AccessKey> {
    const [newKey] = await db.insert(accessKeys).values(key).returning();
    return newKey;
  }

  async deleteAccessKey(id: number): Promise<void> {
    await db.delete(accessKeys).where(eq(accessKeys.id, id));
  }
}

export const storage = new DatabaseStorage();
