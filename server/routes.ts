import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth"; // We will create this or use passport setup in index
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import express from "express";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Ensure uploads directory exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // Serve uploaded files statically
  app.use("/uploads", express.static("uploads"));

  // === Documents ===
  app.get(api.documents.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const docs = await storage.getDocuments();
    res.json(docs);
  });

  app.post(api.documents.create.path, upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const doc = await storage.createDocument({
      title: req.body.title || req.file.originalname,
      filename: req.file.originalname,
      fileType: req.file.mimetype.startsWith('image/') ? 'image' : 'pdf',
      url: `/uploads/${req.file.filename}`
    });

    res.status(201).json(doc);
  });

  app.delete(api.documents.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteDocument(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Access Keys ===
  app.get(api.accessKeys.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const keys = await storage.getAccessKeys();
    res.json(keys);
  });

  app.post(api.accessKeys.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Generate a random key if not provided (though schema requires it, typically we generate on backend)
    // But since schema allows input, we check.
    let keyData = req.body;
    if (!keyData.key) {
       keyData.key = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    try {
      const input = api.accessKeys.create.input.parse(keyData);
      const newKey = await storage.createAccessKey(input);
      res.status(201).json(newKey);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(err.errors);
      }
      throw err;
    }
  });

  app.delete(api.accessKeys.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteAccessKey(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Public Access ===
  app.get(api.documents.publicList.path, async (req, res) => {
    const key = req.query.key as string;
    if (!key) return res.status(401).json({ message: "Access key required" });

    const accessKey = await storage.getAccessKey(key);
    if (!accessKey || !accessKey.isActive) {
      return res.status(401).json({ message: "Invalid or expired access key" });
    }

    const docs = await storage.getDocuments();
    res.json(docs);
  });

  // === Seed Data ===
  // Only create user if none exists
  const existingUser = await storage.getUserByUsername("admin");
  if (!existingUser) {
    await storage.createUser({
      username: "admin",
      password: "password123" 
    });
  }

  return httpServer;
}
