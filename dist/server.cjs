"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc4) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc4 = __getOwnPropDesc(from, key)) || desc4.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// lib/lib/db/src/schema/index.ts
var schema_exports = {};
__export(schema_exports, {
  chaptersTable: () => chaptersTable,
  charactersTable: () => charactersTable,
  commentsTable: () => commentsTable,
  followsTable: () => followsTable,
  insertChapterSchema: () => insertChapterSchema,
  insertCharacterSchema: () => insertCharacterSchema,
  insertCommentSchema: () => insertCommentSchema,
  insertFollowSchema: () => insertFollowSchema,
  insertLibrarySchema: () => insertLibrarySchema,
  insertNovelSchema: () => insertNovelSchema,
  insertUserSchema: () => insertUserSchema,
  libraryTable: () => libraryTable,
  likesTable: () => likesTable,
  notificationsTable: () => notificationsTable,
  novelsTable: () => novelsTable,
  readingProgressTable: () => readingProgressTable,
  usersTable: () => usersTable,
  worldNotesTable: () => worldNotesTable
});
var import_pg_core, import_drizzle_zod, usersTable, novelsTable, chaptersTable, charactersTable, worldNotesTable, followsTable, libraryTable, readingProgressTable, commentsTable, likesTable, notificationsTable, insertUserSchema, insertNovelSchema, insertChapterSchema, insertCharacterSchema, insertFollowSchema, insertLibrarySchema, insertCommentSchema;
var init_schema = __esm({
  "lib/lib/db/src/schema/index.ts"() {
    import_pg_core = require("drizzle-orm/pg-core");
    import_drizzle_zod = require("drizzle-zod");
    usersTable = (0, import_pg_core.pgTable)("users", {
      uid: (0, import_pg_core.text)("uid").primaryKey(),
      displayName: (0, import_pg_core.text)("display_name").notNull().default("\u0643\u0627\u062A\u0628 \u0645\u062C\u0647\u0648\u0644"),
      username: (0, import_pg_core.text)("username").unique(),
      email: (0, import_pg_core.text)("email").notNull().default(""),
      photoURL: (0, import_pg_core.text)("photo_url").default(""),
      bannerURL: (0, import_pg_core.text)("banner_url").default(""),
      bio: (0, import_pg_core.text)("bio").default(""),
      role: (0, import_pg_core.text)("role").default("user"),
      fontFamily: (0, import_pg_core.text)("font_family").default(""),
      teraboxLink: (0, import_pg_core.text)("terabox_link").default(""),
      showCloudAssetsPublicly: (0, import_pg_core.boolean)("show_cloud_assets_publicly").default(false),
      onboardingCompleted: (0, import_pg_core.boolean)("onboarding_completed").default(false),
      links: (0, import_pg_core.jsonb)("links").default("[]"),
      manualBadge: (0, import_pg_core.text)("manual_badge"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    novelsTable = (0, import_pg_core.pgTable)("novels", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      authorUid: (0, import_pg_core.text)("author_uid").notNull(),
      authorName: (0, import_pg_core.text)("author_name").default(""),
      authorPhoto: (0, import_pg_core.text)("author_photo").default(""),
      title: (0, import_pg_core.text)("title").notNull(),
      genre: (0, import_pg_core.text)("genre").default("drama"),
      summary: (0, import_pg_core.text)("summary").default(""),
      coverImage: (0, import_pg_core.text)("cover_image").default(""),
      status: (0, import_pg_core.text)("status").default("draft"),
      likesCount: (0, import_pg_core.integer)("likes_count").default(0),
      viewsCount: (0, import_pg_core.integer)("views_count").default(0),
      sharesCount: (0, import_pg_core.integer)("shares_count").default(0),
      language: (0, import_pg_core.text)("language").default("ar"),
      violenceLevel: (0, import_pg_core.text)("violence_level").default("none"),
      moralTone: (0, import_pg_core.text)("moral_tone").default("neutral"),
      fontFamily: (0, import_pg_core.text)("font_family").default("var(--font-serif)"),
      fontSize: (0, import_pg_core.text)("font_size").default("1.125rem"),
      textAlign: (0, import_pg_core.text)("text_align").default("right"),
      lineHeight: (0, import_pg_core.text)("line_height").default("1.75"),
      previousPartId: (0, import_pg_core.text)("previous_part_id"),
      teraboxLink: (0, import_pg_core.text)("terabox_link").default(""),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    chaptersTable = (0, import_pg_core.pgTable)("chapters", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      novelId: (0, import_pg_core.text)("novel_id").notNull(),
      title: (0, import_pg_core.text)("title").notNull(),
      content: (0, import_pg_core.text)("content").default(""),
      description: (0, import_pg_core.text)("description").default(""),
      order: (0, import_pg_core.integer)("order").default(0),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    charactersTable = (0, import_pg_core.pgTable)("characters", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      novelId: (0, import_pg_core.text)("novel_id").notNull(),
      name: (0, import_pg_core.text)("name").notNull(),
      role: (0, import_pg_core.text)("role").default("supporting"),
      traits: (0, import_pg_core.text)("traits").default(""),
      description: (0, import_pg_core.text)("description").default(""),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    worldNotesTable = (0, import_pg_core.pgTable)("world_notes", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      novelId: (0, import_pg_core.text)("novel_id").notNull(),
      title: (0, import_pg_core.text)("title").notNull(),
      category: (0, import_pg_core.text)("category").default("other"),
      content: (0, import_pg_core.text)("content").default(""),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    followsTable = (0, import_pg_core.pgTable)("follows", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      followerUid: (0, import_pg_core.text)("follower_uid").notNull(),
      followedUid: (0, import_pg_core.text)("followed_uid").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    }, (t) => [(0, import_pg_core.unique)().on(t.followerUid, t.followedUid)]);
    libraryTable = (0, import_pg_core.pgTable)("library", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      uid: (0, import_pg_core.text)("uid").notNull(),
      novelId: (0, import_pg_core.text)("novel_id").notNull(),
      addedAt: (0, import_pg_core.timestamp)("added_at").defaultNow()
    }, (t) => [(0, import_pg_core.unique)().on(t.uid, t.novelId)]);
    readingProgressTable = (0, import_pg_core.pgTable)("reading_progress", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      uid: (0, import_pg_core.text)("uid").notNull(),
      novelId: (0, import_pg_core.text)("novel_id").notNull(),
      lastChapterId: (0, import_pg_core.text)("last_chapter_id").notNull(),
      lastChapterOrder: (0, import_pg_core.integer)("last_chapter_order").default(0),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    }, (t) => [(0, import_pg_core.unique)().on(t.uid, t.novelId)]);
    commentsTable = (0, import_pg_core.pgTable)("comments", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      novelId: (0, import_pg_core.text)("novel_id").notNull(),
      chapterId: (0, import_pg_core.text)("chapter_id").notNull(),
      authorUid: (0, import_pg_core.text)("author_uid").notNull(),
      authorName: (0, import_pg_core.text)("author_name").notNull().default(""),
      authorPhoto: (0, import_pg_core.text)("author_photo").default(""),
      text: (0, import_pg_core.text)("text").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    likesTable = (0, import_pg_core.pgTable)("likes", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      novelId: (0, import_pg_core.text)("novel_id").notNull(),
      uid: (0, import_pg_core.text)("uid").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    }, (t) => [(0, import_pg_core.unique)().on(t.novelId, t.uid)]);
    notificationsTable = (0, import_pg_core.pgTable)("notifications", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      uid: (0, import_pg_core.text)("uid").notNull(),
      type: (0, import_pg_core.text)("type").default("general"),
      title: (0, import_pg_core.text)("title").notNull(),
      body: (0, import_pg_core.text)("body").notNull(),
      read: (0, import_pg_core.boolean)("read").default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    insertUserSchema = (0, import_drizzle_zod.createInsertSchema)(usersTable);
    insertNovelSchema = (0, import_drizzle_zod.createInsertSchema)(novelsTable).omit({ id: true });
    insertChapterSchema = (0, import_drizzle_zod.createInsertSchema)(chaptersTable).omit({ id: true });
    insertCharacterSchema = (0, import_drizzle_zod.createInsertSchema)(charactersTable).omit({ id: true });
    insertFollowSchema = (0, import_drizzle_zod.createInsertSchema)(followsTable).omit({ id: true });
    insertLibrarySchema = (0, import_drizzle_zod.createInsertSchema)(libraryTable).omit({ id: true });
    insertCommentSchema = (0, import_drizzle_zod.createInsertSchema)(commentsTable).omit({ id: true });
  }
});

// server.ts
var import_express15 = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");

// api-server/src/app.ts
var import_express14 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_pino_http = __toESM(require("pino-http"), 1);

// api-server/src/routes/index.ts
var import_express13 = require("express");

// api-server/src/routes/health.ts
var import_express = require("express");
var router = (0, import_express.Router)();
router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});
var health_default = router;

// api-server/src/routes/gemini.ts
var import_express2 = require("express");
var import_genai = require("@google/genai");
var router2 = (0, import_express2.Router)();
function getAI() {
  const directKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (directKey) {
    return new import_genai.GoogleGenAI({ apiKey: directKey });
  }
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  const replitApiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  if (baseUrl && replitApiKey) {
    return new import_genai.GoogleGenAI({
      apiKey: replitApiKey,
      httpOptions: { apiVersion: "", baseUrl }
    });
  }
  throw new Error("No Gemini API key configured. Please set GEMINI_API_KEY in your .env file.");
}
router2.post("/gemini/generate", async (req, res) => {
  try {
    const { model = "gemini-2.5-flash", contents, config } = req.body;
    if (!contents || !Array.isArray(contents)) {
      res.status(400).json({ error: "contents is required" });
      return;
    }
    const safetySettings = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" }
    ];
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents,
      config: { safetySettings, ...config }
    });
    res.json({ text: response.text, candidates: response.candidates });
  } catch (err) {
    req.log.error({ err }, "Gemini generate error");
    res.status(500).json({ error: err?.message || "Gemini error" });
  }
});
var gemini_default = router2;

// api-server/src/routes/upload.ts
var import_express3 = require("express");
var router3 = (0, import_express3.Router)();
var STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || "gen-lang-client-0313303198.firebasestorage.app";
var FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyDPHpkz-G0wKRSePRSYz2FMc_HR8iuTgFw";
router3.post("/upload", async (req, res) => {
  try {
    const { base64Data, path: storagePath } = req.body;
    if (!base64Data || !storagePath) {
      res.status(400).json({ error: "base64Data and path are required" });
      return;
    }
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer;
    let mimeType = "image/jpeg";
    if (matches) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }
    const encodedPath = encodeURIComponent(storagePath);
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodedPath}&key=${FIREBASE_API_KEY}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": mimeType },
      body: buffer
    });
    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      req.log.error({ errText }, "Firebase Storage upload failed");
      throw new Error(`Firebase Storage upload failed: ${errText}`);
    }
    const uploadData = await uploadResponse.json();
    const downloadToken = uploadData.downloadTokens;
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media&token=${downloadToken}`;
    res.json({ url: downloadUrl });
  } catch (err) {
    req.log.error({ err }, "Upload route error");
    res.status(500).json({ error: err?.message || "Upload failed" });
  }
});
var upload_default = router3;

// api-server/src/routes/users.ts
var import_express4 = require("express");

// lib/lib/db/src/index.ts
var import_pglite = require("@electric-sql/pglite");
var import_pglite2 = require("drizzle-orm/pglite");
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"), 1);
init_schema();
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_url = require("url");
init_schema();
var import_meta = {};
var db;
var client = null;
var pgPool = null;
var dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    pgPool = new import_pg.default.Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
    pgPool.on("connect", (client2) => {
      client2.query('SET search_path TO public, "$user"');
    });
    db = (0, import_node_postgres.drizzle)(pgPool, { schema: schema_exports });
    console.log("Connected to PostgreSQL database via node-postgres pool.");
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err);
    throw err;
  }
} else {
  try {
    const dbPath = import_path.default.join(process.cwd(), "database.pglite");
    client = new import_pglite.PGlite(dbPath);
    db = (0, import_pglite2.drizzle)(client, { schema: schema_exports });
    console.log(`PGlite initialized successfully on-disk at ${dbPath}.`);
  } catch (err) {
    console.error("Failed to initialize PGlite:", err);
    throw err;
  }
}
var initPromise = null;
async function ensureDbReady() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const isPg = !!dbUrl;
    const currentDir = typeof __dirname !== "undefined" ? __dirname : import_meta.url ? import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url)) : process.cwd();
    const getSqlFilePath = (filename) => {
      const candidates = [
        import_path.default.join(process.cwd(), filename),
        import_path.default.join(process.cwd(), "dist", filename),
        import_path.default.join(currentDir, filename),
        import_path.default.join(currentDir, "..", filename),
        import_path.default.join(currentDir, "..", "..", "..", "..", filename)
      ];
      for (const p of candidates) {
        if (p && import_fs.default.existsSync(p)) return p;
      }
      return null;
    };
    if (isPg && pgPool) {
      try {
        const res = await pgPool.query(
          "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')"
        );
        if (res.rows[0]?.exists) {
          console.log("PostgreSQL database tables already exist. Skipping automatic initialization.");
          return;
        }
        console.log("PostgreSQL database is empty. Starting automatic schema and data initialization...");
      } catch (err) {
        console.error("Error checking tables in PostgreSQL database:", err);
      }
    }
    const fullSqlPath = getSqlFilePath("roayti-FULL-DATABASE.sql");
    if (fullSqlPath) {
      console.log(`Creating database tables from ${fullSqlPath}...`);
      const fullSql = import_fs.default.readFileSync(fullSqlPath, "utf8");
      const cleanedSql = fullSql.split("\n").filter((line) => !line.trim().startsWith("\\")).join("\n");
      if (isPg && pgPool) {
        try {
          await pgPool.query(cleanedSql);
          console.log("PostgreSQL schema created successfully.");
        } catch (err) {
          console.error("Error running DDL on PostgreSQL:", err);
        }
      } else if (client) {
        const createTableRegex = /CREATE TABLE public\.[^;]+;/gs;
        const createTables = cleanedSql.match(createTableRegex) || [];
        for (const ddl of createTables) {
          try {
            await client.exec(ddl);
          } catch (err) {
            console.error("Error creating table in PGlite:", err);
          }
        }
      }
    } else {
      console.warn("roayti-FULL-DATABASE.sql not found!");
    }
    const cleanSqlPath = getSqlFilePath("clean_inserts_perfect.sql");
    if (cleanSqlPath) {
      console.log(`Loading seed data from ${cleanSqlPath}...`);
      const cleanSql = import_fs.default.readFileSync(cleanSqlPath, "utf8");
      const statements = cleanSql.split("-- STATEMENT_END --").map((s) => s.trim()).filter(Boolean);
      let successCount = 0;
      let errorCount = 0;
      for (const stmt of statements) {
        try {
          if (isPg && pgPool) {
            await pgPool.query(stmt);
          } else if (client) {
            await client.exec(stmt);
          }
          successCount++;
        } catch (err) {
          errorCount++;
          console.error("Error executing statement:", err);
        }
      }
      console.log(`Database populated successfully! Success: ${successCount}, Errors: ${errorCount}`);
    } else {
      console.warn("clean_inserts_perfect.sql not found!");
    }
  })();
  return initPromise;
}
ensureDbReady().catch(console.error);

// api-server/src/routes/users.ts
init_schema();
var import_drizzle_orm = require("drizzle-orm");
var router4 = (0, import_express4.Router)();
router4.get("/users", async (req, res) => {
  try {
    const { q } = req.query;
    if (q) {
      const results2 = await db.select().from(usersTable).where(
        (0, import_drizzle_orm.or)((0, import_drizzle_orm.ilike)(usersTable.displayName, `%${q}%`), (0, import_drizzle_orm.ilike)(usersTable.username, `%${q}%`))
      ).limit(50);
      return res.json(results2);
    }
    const results = await db.select().from(usersTable).limit(200);
    res.json(results);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router4.get("/users/by-username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const rows = await db.select().from(usersTable).where((0, import_drizzle_orm.ilike)(usersTable.username, username.trim().toLowerCase())).limit(1);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router4.get("/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    let rows = await db.select().from(usersTable).where((0, import_drizzle_orm.eq)(usersTable.uid, uid)).limit(1);
    if (!rows.length) {
      rows = await db.select().from(usersTable).where((0, import_drizzle_orm.ilike)(usersTable.username, uid.toLowerCase())).limit(1);
    }
    if (!rows.length && uid.includes("@")) {
      rows = await db.select().from(usersTable).where((0, import_drizzle_orm.ilike)(usersTable.email, uid.toLowerCase())).limit(1);
    }
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router4.post("/users", async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.uid) return res.status(400).json({ error: "uid required" });
    const existingByUid = await db.select().from(usersTable).where((0, import_drizzle_orm.eq)(usersTable.uid, data.uid)).limit(1);
    if (existingByUid.length) {
      const safeUpdate = { updatedAt: /* @__PURE__ */ new Date() };
      if (data.email && data.email !== existingByUid[0].email) safeUpdate.email = data.email;
      if (data.displayName && (!existingByUid[0].displayName || existingByUid[0].displayName === "\u0643\u0627\u062A\u0628 \u0645\u062C\u0647\u0648\u0644")) {
        safeUpdate.displayName = data.displayName;
      }
      if (data.photoURL && !existingByUid[0].photoURL) safeUpdate.photoURL = data.photoURL;
      const updated = await db.update(usersTable).set(safeUpdate).where((0, import_drizzle_orm.eq)(usersTable.uid, data.uid)).returning();
      return res.json(updated[0]);
    }
    if (data.email) {
      const existingByEmail = await db.select().from(usersTable).where((0, import_drizzle_orm.ilike)(usersTable.email, data.email.trim().toLowerCase())).limit(1);
      if (existingByEmail.length) {
        const oldUid = existingByEmail[0].uid;
        const newUid = data.uid;
        if (oldUid !== newUid) {
          try {
            await db.update(novelsTable).set({ authorUid: newUid }).where((0, import_drizzle_orm.eq)(novelsTable.authorUid, oldUid));
            await db.update(followsTable).set({ followerUid: newUid }).where((0, import_drizzle_orm.eq)(followsTable.followerUid, oldUid));
            await db.update(followsTable).set({ followedUid: newUid }).where((0, import_drizzle_orm.eq)(followsTable.followedUid, oldUid));
            await db.update(libraryTable).set({ uid: newUid }).where((0, import_drizzle_orm.eq)(libraryTable.uid, oldUid));
            await db.update(readingProgressTable).set({ uid: newUid }).where((0, import_drizzle_orm.eq)(readingProgressTable.uid, oldUid));
            await db.update(commentsTable).set({ authorUid: newUid }).where((0, import_drizzle_orm.eq)(commentsTable.authorUid, oldUid));
            await db.update(likesTable).set({ uid: newUid }).where((0, import_drizzle_orm.eq)(likesTable.uid, oldUid));
            await db.update(notificationsTable).set({ uid: newUid }).where((0, import_drizzle_orm.eq)(notificationsTable.uid, oldUid));
          } catch (relErr) {
            req.log.warn(relErr, "Error re-linking user child table references");
          }
        }
        const safeUpdate = {
          uid: newUid,
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (data.displayName) safeUpdate.displayName = data.displayName;
        if (data.photoURL) safeUpdate.photoURL = data.photoURL;
        const updated = await db.update(usersTable).set(safeUpdate).where((0, import_drizzle_orm.eq)(usersTable.uid, oldUid)).returning();
        return res.json(updated[0]);
      }
    }
    let targetUsername = data.username ? data.username.toLowerCase().replace(/[^a-z0-9_]/g, "_") : "";
    if (!targetUsername) {
      targetUsername = `user_${Math.floor(1e5 + Math.random() * 9e5)}`;
    }
    const existingByUsername = await db.select().from(usersTable).where((0, import_drizzle_orm.ilike)(usersTable.username, targetUsername)).limit(1);
    if (existingByUsername.length) {
      targetUsername = `${targetUsername}_${Math.floor(1e3 + Math.random() * 9e3)}`;
    }
    data.username = targetUsername;
    const inserted = await db.insert(usersTable).values({
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    res.status(201).json(inserted[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router4.put("/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const data = { ...req.body };
    delete data.uid;
    delete data.createdAt;
    const rows = await db.update(usersTable).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(usersTable.uid, uid)).returning();
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router4.get("/users/:uid/stats", async (req, res) => {
  try {
    const { uid } = req.params;
    const { followsTable: followsTable2, libraryTable: libraryTable2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const [followersCount, followingCount, novelsCount, libraryCount] = await Promise.all([
      db.select({ count: import_drizzle_orm.sql`count(*)` }).from(followsTable2).where((0, import_drizzle_orm.eq)(followsTable2.followedUid, uid)),
      db.select({ count: import_drizzle_orm.sql`count(*)` }).from(followsTable2).where((0, import_drizzle_orm.eq)(followsTable2.followerUid, uid)),
      db.select({ count: import_drizzle_orm.sql`count(*)` }).from(novelsTable).where((0, import_drizzle_orm.eq)(novelsTable.authorUid, uid)),
      db.select({ count: import_drizzle_orm.sql`count(*)` }).from(libraryTable2).where((0, import_drizzle_orm.eq)(libraryTable2.uid, uid))
    ]);
    res.json({
      followersCount: Number(followersCount[0].count),
      followingCount: Number(followingCount[0].count),
      novelsCount: Number(novelsCount[0].count),
      libraryCount: Number(libraryCount[0].count)
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
var users_default = router4;

// api-server/src/routes/novels.ts
var import_express5 = require("express");
init_schema();
var import_drizzle_orm2 = require("drizzle-orm");
var router5 = (0, import_express5.Router)();
router5.get("/novels", async (req, res) => {
  try {
    const { authorUid, status, language } = req.query;
    let q = db.select().from(novelsTable).orderBy((0, import_drizzle_orm2.desc)(novelsTable.updatedAt));
    const conditions = [];
    if (authorUid) conditions.push((0, import_drizzle_orm2.eq)(novelsTable.authorUid, authorUid));
    if (status) conditions.push((0, import_drizzle_orm2.eq)(novelsTable.status, status));
    if (language && language !== "all") conditions.push((0, import_drizzle_orm2.eq)(novelsTable.language, language));
    const results = conditions.length ? await db.select().from(novelsTable).where((0, import_drizzle_orm2.and)(...conditions)).orderBy((0, import_drizzle_orm2.desc)(novelsTable.updatedAt)) : await db.select().from(novelsTable).orderBy((0, import_drizzle_orm2.desc)(novelsTable.updatedAt));
    res.json(results);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router5.get("/novels/:id", async (req, res) => {
  try {
    const rows = await db.select().from(novelsTable).where((0, import_drizzle_orm2.eq)(novelsTable.id, req.params.id)).limit(1);
    if (!rows.length) return res.status(404).json({ error: "Novel not found" });
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router5.post("/novels", async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(novelsTable).values({
      id: data.id || crypto.randomUUID(),
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    res.status(201).json(inserted[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router5.put("/novels/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.createdAt;
    const rows = await db.update(novelsTable).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(novelsTable.id, req.params.id)).returning();
    if (!rows.length) return res.status(404).json({ error: "Novel not found" });
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router5.delete("/novels/:id", async (req, res) => {
  try {
    const { chaptersTable: chaptersTable2, charactersTable: charactersTable2, worldNotesTable: worldNotesTable2, commentsTable: commentsTable2, likesTable: lt } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.delete(chaptersTable2).where((0, import_drizzle_orm2.eq)(chaptersTable2.novelId, req.params.id));
    await db.delete(charactersTable2).where((0, import_drizzle_orm2.eq)(charactersTable2.novelId, req.params.id));
    await db.delete(worldNotesTable2).where((0, import_drizzle_orm2.eq)(worldNotesTable2.novelId, req.params.id));
    await db.delete(commentsTable2).where((0, import_drizzle_orm2.eq)(commentsTable2.novelId, req.params.id));
    await db.delete(lt).where((0, import_drizzle_orm2.eq)(lt.novelId, req.params.id));
    await db.delete(novelsTable).where((0, import_drizzle_orm2.eq)(novelsTable.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router5.post("/novels/:id/like", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "uid required" });
    const existing = await db.select().from(likesTable).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(likesTable.novelId, req.params.id), (0, import_drizzle_orm2.eq)(likesTable.uid, uid))).limit(1);
    if (existing.length) {
      await db.delete(likesTable).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(likesTable.novelId, req.params.id), (0, import_drizzle_orm2.eq)(likesTable.uid, uid)));
      await db.update(novelsTable).set({ likesCount: import_drizzle_orm2.sql`${novelsTable.likesCount} - 1` }).where((0, import_drizzle_orm2.eq)(novelsTable.id, req.params.id));
      return res.json({ liked: false });
    }
    await db.insert(likesTable).values({ novelId: req.params.id, uid });
    await db.update(novelsTable).set({ likesCount: import_drizzle_orm2.sql`${novelsTable.likesCount} + 1` }).where((0, import_drizzle_orm2.eq)(novelsTable.id, req.params.id));
    res.json({ liked: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router5.get("/novels/:id/liked", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.json({ liked: false });
    const rows = await db.select().from(likesTable).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(likesTable.novelId, req.params.id), (0, import_drizzle_orm2.eq)(likesTable.uid, uid))).limit(1);
    res.json({ liked: rows.length > 0 });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router5.post("/novels/:id/view", async (req, res) => {
  try {
    await db.update(novelsTable).set({ viewsCount: import_drizzle_orm2.sql`${novelsTable.viewsCount} + 1` }).where((0, import_drizzle_orm2.eq)(novelsTable.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router5.post("/novels/:id/share", async (req, res) => {
  try {
    await db.update(novelsTable).set({ sharesCount: import_drizzle_orm2.sql`${novelsTable.sharesCount} + 1` }).where((0, import_drizzle_orm2.eq)(novelsTable.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
var novels_default = router5;

// api-server/src/routes/chapters.ts
var import_express6 = require("express");
init_schema();
var import_drizzle_orm3 = require("drizzle-orm");
var router6 = (0, import_express6.Router)();
router6.get("/novels/:novelId/chapters", async (req, res) => {
  try {
    const rows = await db.select().from(chaptersTable).where((0, import_drizzle_orm3.eq)(chaptersTable.novelId, req.params.novelId)).orderBy((0, import_drizzle_orm3.asc)(chaptersTable.order));
    res.json(rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router6.get("/novels/:novelId/chapters/:id", async (req, res) => {
  try {
    const rows = await db.select().from(chaptersTable).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(chaptersTable.id, req.params.id), (0, import_drizzle_orm3.eq)(chaptersTable.novelId, req.params.novelId))).limit(1);
    if (!rows.length) return res.status(404).json({ error: "Chapter not found" });
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router6.post("/novels/:novelId/chapters", async (req, res) => {
  try {
    const data = { ...req.body, novelId: req.params.novelId };
    const inserted = await db.insert(chaptersTable).values({
      id: data.id || crypto.randomUUID(),
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    res.status(201).json(inserted[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router6.put("/novels/:novelId/chapters/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.novelId;
    delete data.createdAt;
    const rows = await db.update(chaptersTable).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(chaptersTable.id, req.params.id), (0, import_drizzle_orm3.eq)(chaptersTable.novelId, req.params.novelId))).returning();
    if (!rows.length) return res.status(404).json({ error: "Chapter not found" });
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router6.delete("/novels/:novelId/chapters/:id", async (req, res) => {
  try {
    await db.delete(chaptersTable).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(chaptersTable.id, req.params.id), (0, import_drizzle_orm3.eq)(chaptersTable.novelId, req.params.novelId)));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
var chapters_default = router6;

// api-server/src/routes/follows.ts
var import_express7 = require("express");
init_schema();
var import_drizzle_orm4 = require("drizzle-orm");
var router7 = (0, import_express7.Router)();
router7.get("/follows", async (req, res) => {
  try {
    const { followerUid, followedUid } = req.query;
    if (followerUid) {
      const rows = await db.select().from(followsTable).where((0, import_drizzle_orm4.eq)(followsTable.followerUid, followerUid));
      return res.json(rows);
    }
    if (followedUid) {
      const rows = await db.select().from(followsTable).where((0, import_drizzle_orm4.eq)(followsTable.followedUid, followedUid));
      return res.json(rows);
    }
    res.json([]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router7.post("/follows", async (req, res) => {
  try {
    const { followerUid, followedUid } = req.body;
    if (!followerUid || !followedUid) return res.status(400).json({ error: "followerUid and followedUid required" });
    const existing = await db.select().from(followsTable).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(followsTable.followerUid, followerUid), (0, import_drizzle_orm4.eq)(followsTable.followedUid, followedUid))).limit(1);
    if (existing.length) return res.json(existing[0]);
    const inserted = await db.insert(followsTable).values({ followerUid, followedUid, id: req.body.id || crypto.randomUUID() }).returning();
    res.status(201).json(inserted[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router7.delete("/follows", async (req, res) => {
  try {
    const { followerUid, followedUid } = req.body;
    if (!followerUid || !followedUid) return res.status(400).json({ error: "followerUid and followedUid required" });
    await db.delete(followsTable).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(followsTable.followerUid, followerUid), (0, import_drizzle_orm4.eq)(followsTable.followedUid, followedUid)));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router7.get("/follows/profiles", async (req, res) => {
  try {
    const { followerUid } = req.query;
    if (!followerUid) return res.json([]);
    const followRows = await db.select().from(followsTable).where((0, import_drizzle_orm4.eq)(followsTable.followerUid, followerUid));
    if (!followRows.length) return res.json([]);
    const profiles = await Promise.all(
      followRows.map((f) => db.select().from(usersTable).where((0, import_drizzle_orm4.eq)(usersTable.uid, f.followedUid)).limit(1))
    );
    res.json(profiles.map((p) => p[0]).filter(Boolean));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
var follows_default = router7;

// api-server/src/routes/library.ts
var import_express8 = require("express");
init_schema();
var import_drizzle_orm5 = require("drizzle-orm");
var router8 = (0, import_express8.Router)();
router8.get("/library", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "uid required" });
    const rows = await db.select().from(libraryTable).where((0, import_drizzle_orm5.eq)(libraryTable.uid, uid));
    res.json(rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router8.post("/library", async (req, res) => {
  try {
    const { uid, novelId } = req.body;
    if (!uid || !novelId) return res.status(400).json({ error: "uid and novelId required" });
    const existing = await db.select().from(libraryTable).where((0, import_drizzle_orm5.and)((0, import_drizzle_orm5.eq)(libraryTable.uid, uid), (0, import_drizzle_orm5.eq)(libraryTable.novelId, novelId))).limit(1);
    if (existing.length) return res.json(existing[0]);
    const inserted = await db.insert(libraryTable).values({ uid, novelId, id: req.body.id || crypto.randomUUID() }).returning();
    res.status(201).json(inserted[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router8.delete("/library", async (req, res) => {
  try {
    const { uid, novelId } = req.body;
    if (!uid || !novelId) return res.status(400).json({ error: "uid and novelId required" });
    await db.delete(libraryTable).where((0, import_drizzle_orm5.and)((0, import_drizzle_orm5.eq)(libraryTable.uid, uid), (0, import_drizzle_orm5.eq)(libraryTable.novelId, novelId)));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
var library_default = router8;

// api-server/src/routes/progress.ts
var import_express9 = require("express");
init_schema();
var import_drizzle_orm6 = require("drizzle-orm");
var router9 = (0, import_express9.Router)();
router9.get("/progress", async (req, res) => {
  try {
    const { uid, novelId } = req.query;
    if (!uid) return res.status(400).json({ error: "uid required" });
    if (novelId) {
      const rows2 = await db.select().from(readingProgressTable).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(readingProgressTable.uid, uid), (0, import_drizzle_orm6.eq)(readingProgressTable.novelId, novelId))).limit(1);
      return res.json(rows2[0] || null);
    }
    const rows = await db.select().from(readingProgressTable).where((0, import_drizzle_orm6.eq)(readingProgressTable.uid, uid));
    res.json(rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router9.put("/progress", async (req, res) => {
  try {
    const { uid, novelId, lastChapterId, lastChapterOrder } = req.body;
    if (!uid || !novelId) return res.status(400).json({ error: "uid and novelId required" });
    const existing = await db.select().from(readingProgressTable).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(readingProgressTable.uid, uid), (0, import_drizzle_orm6.eq)(readingProgressTable.novelId, novelId))).limit(1);
    if (existing.length) {
      if (existing[0].lastChapterOrder >= lastChapterOrder) return res.json(existing[0]);
      const updated = await db.update(readingProgressTable).set({ lastChapterId, lastChapterOrder, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(readingProgressTable.uid, uid), (0, import_drizzle_orm6.eq)(readingProgressTable.novelId, novelId))).returning();
      return res.json(updated[0]);
    }
    const inserted = await db.insert(readingProgressTable).values({ uid, novelId, lastChapterId, lastChapterOrder, id: req.body.id || crypto.randomUUID() }).returning();
    res.status(201).json(inserted[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
var progress_default = router9;

// api-server/src/routes/comments.ts
var import_express10 = require("express");
init_schema();
var import_drizzle_orm7 = require("drizzle-orm");
var router10 = (0, import_express10.Router)();
router10.get("/novels/:novelId/chapters/:chapterId/comments", async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;
    const rows = await db.select().from(commentsTable).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(commentsTable.novelId, novelId), (0, import_drizzle_orm7.eq)(commentsTable.chapterId, chapterId))).orderBy((0, import_drizzle_orm7.asc)(commentsTable.createdAt));
    res.json(rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router10.post("/novels/:novelId/chapters/:chapterId/comments", async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;
    const data = { ...req.body, novelId, chapterId, id: req.body.id || crypto.randomUUID() };
    const inserted = await db.insert(commentsTable).values(data).returning();
    res.status(201).json(inserted[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router10.delete("/novels/:novelId/chapters/:chapterId/comments/:id", async (req, res) => {
  try {
    const { novelId, chapterId, id } = req.params;
    await db.delete(commentsTable).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(commentsTable.id, id), (0, import_drizzle_orm7.eq)(commentsTable.novelId, novelId)));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
var comments_default = router10;

// api-server/src/routes/characters.ts
var import_express11 = require("express");
init_schema();
var import_drizzle_orm8 = require("drizzle-orm");
var router11 = (0, import_express11.Router)();
router11.get("/novels/:novelId/characters", async (req, res) => {
  try {
    const rows = await db.select().from(charactersTable).where((0, import_drizzle_orm8.eq)(charactersTable.novelId, req.params.novelId)).orderBy((0, import_drizzle_orm8.asc)(charactersTable.createdAt));
    res.json(rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router11.post("/novels/:novelId/characters", async (req, res) => {
  try {
    const data = { ...req.body, novelId: req.params.novelId, id: req.body.id || crypto.randomUUID() };
    const inserted = await db.insert(charactersTable).values(data).returning();
    res.status(201).json(inserted[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router11.put("/novels/:novelId/characters/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.novelId;
    const rows = await db.update(charactersTable).set(data).where((0, import_drizzle_orm8.and)((0, import_drizzle_orm8.eq)(charactersTable.id, req.params.id), (0, import_drizzle_orm8.eq)(charactersTable.novelId, req.params.novelId))).returning();
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router11.delete("/novels/:novelId/characters/:id", async (req, res) => {
  try {
    await db.delete(charactersTable).where((0, import_drizzle_orm8.and)((0, import_drizzle_orm8.eq)(charactersTable.id, req.params.id), (0, import_drizzle_orm8.eq)(charactersTable.novelId, req.params.novelId)));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router11.get("/novels/:novelId/world-notes", async (req, res) => {
  try {
    const rows = await db.select().from(worldNotesTable).where((0, import_drizzle_orm8.eq)(worldNotesTable.novelId, req.params.novelId)).orderBy((0, import_drizzle_orm8.asc)(worldNotesTable.createdAt));
    res.json(rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router11.post("/novels/:novelId/world-notes", async (req, res) => {
  try {
    const data = { ...req.body, novelId: req.params.novelId, id: req.body.id || crypto.randomUUID() };
    const inserted = await db.insert(worldNotesTable).values(data).returning();
    res.status(201).json(inserted[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router11.put("/novels/:novelId/world-notes/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.novelId;
    const rows = await db.update(worldNotesTable).set(data).where((0, import_drizzle_orm8.and)((0, import_drizzle_orm8.eq)(worldNotesTable.id, req.params.id), (0, import_drizzle_orm8.eq)(worldNotesTable.novelId, req.params.novelId))).returning();
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
router11.delete("/novels/:novelId/world-notes/:id", async (req, res) => {
  try {
    await db.delete(worldNotesTable).where((0, import_drizzle_orm8.and)((0, import_drizzle_orm8.eq)(worldNotesTable.id, req.params.id), (0, import_drizzle_orm8.eq)(worldNotesTable.novelId, req.params.novelId)));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});
var characters_default = router11;

// api-server/src/routes/sitemap.ts
var import_express12 = require("express");
init_schema();
var import_drizzle_orm9 = require("drizzle-orm");
var router12 = (0, import_express12.Router)();
async function generateSitemapXml(hostUrl) {
  const baseUrl = hostUrl.replace(/\/$/, "");
  const staticPages = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/?view=explore", priority: "0.9", changefreq: "hourly" },
    { path: "/?view=most-read", priority: "0.9", changefreq: "daily" },
    { path: "/?view=library", priority: "0.8", changefreq: "daily" },
    { path: "/?view=dashboard", priority: "0.7", changefreq: "weekly" },
    { path: "/?view=ai-writer", priority: "0.8", changefreq: "weekly" },
    { path: "/?view=ai-books", priority: "0.8", changefreq: "weekly" },
    { path: "/?view=sitemap", priority: "0.8", changefreq: "daily" },
    { path: "/#about", priority: "0.5", changefreq: "monthly" },
    { path: "/#privacy", priority: "0.4", changefreq: "monthly" },
    { path: "/#terms", priority: "0.4", changefreq: "monthly" },
    { path: "/#contact", priority: "0.5", changefreq: "monthly" }
  ];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  for (const page of staticPages) {
    xml += `  <url>
`;
    xml += `    <loc>${baseUrl}${page.path}</loc>
`;
    xml += `    <lastmod>${today}</lastmod>
`;
    xml += `    <changefreq>${page.changefreq}</changefreq>
`;
    xml += `    <priority>${page.priority}</priority>
`;
    xml += `  </url>
`;
  }
  const publishedNovelIds = /* @__PURE__ */ new Set();
  try {
    const novels = await db.select().from(novelsTable).where((0, import_drizzle_orm9.eq)(novelsTable.status, "published")).orderBy((0, import_drizzle_orm9.desc)(novelsTable.updatedAt));
    for (const novel of novels) {
      publishedNovelIds.add(novel.id);
      const lastmod = novel.updatedAt ? new Date(novel.updatedAt).toISOString().split("T")[0] : today;
      xml += `  <url>
`;
      xml += `    <loc>${baseUrl}/?novelId=${novel.id}</loc>
`;
      xml += `    <lastmod>${lastmod}</lastmod>
`;
      xml += `    <changefreq>daily</changefreq>
`;
      xml += `    <priority>0.9</priority>
`;
      xml += `  </url>
`;
    }
  } catch (err) {
    console.error("Error fetching novels for sitemap:", err);
  }
  try {
    const chapters = await db.select().from(chaptersTable).orderBy((0, import_drizzle_orm9.desc)(chaptersTable.updatedAt));
    const filteredChapters = chapters.filter((ch) => publishedNovelIds.has(ch.novelId));
    for (const ch of filteredChapters) {
      const lastmod = ch.updatedAt ? new Date(ch.updatedAt).toISOString().split("T")[0] : today;
      xml += `  <url>
`;
      xml += `    <loc>${baseUrl}/?novelId=${ch.novelId}&amp;chapterId=${ch.id}</loc>
`;
      xml += `    <lastmod>${lastmod}</lastmod>
`;
      xml += `    <changefreq>weekly</changefreq>
`;
      xml += `    <priority>0.7</priority>
`;
      xml += `  </url>
`;
    }
  } catch (err) {
    console.error("Error fetching chapters for sitemap:", err);
  }
  try {
    const users = await db.select().from(usersTable).orderBy((0, import_drizzle_orm9.desc)(usersTable.updatedAt));
    for (const user of users) {
      const lastmod = user.updatedAt ? new Date(user.updatedAt).toISOString().split("T")[0] : today;
      const userParam = user.username ? `username=${encodeURIComponent(user.username)}` : `profileUid=${user.uid}`;
      xml += `  <url>
`;
      xml += `    <loc>${baseUrl}/?${userParam}</loc>
`;
      xml += `    <lastmod>${lastmod}</lastmod>
`;
      xml += `    <changefreq>weekly</changefreq>
`;
      xml += `    <priority>0.6</priority>
`;
      xml += `  </url>
`;
    }
  } catch (err) {
    console.error("Error fetching users for sitemap:", err);
  }
  xml += `</urlset>`;
  return xml;
}
router12.get("/sitemap.xml", async (req, res) => {
  try {
    const host = req.protocol + "://" + req.get("host");
    const xml = await generateSitemapXml(host);
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).send("Error generating sitemap");
  }
});
router12.get("/sitemap-data", async (req, res) => {
  try {
    const host = req.protocol + "://" + req.get("host");
    const novels = await db.select().from(novelsTable).where((0, import_drizzle_orm9.eq)(novelsTable.status, "published")).orderBy((0, import_drizzle_orm9.desc)(novelsTable.updatedAt));
    const publishedNovelIds = new Set(novels.map((n) => n.id));
    const allChapters = await db.select().from(chaptersTable).orderBy((0, import_drizzle_orm9.desc)(chaptersTable.updatedAt));
    const chapters = allChapters.filter((ch) => publishedNovelIds.has(ch.novelId));
    const users = await db.select().from(usersTable).orderBy((0, import_drizzle_orm9.desc)(usersTable.updatedAt));
    res.json({
      host,
      totalNovels: novels.length,
      totalChapters: chapters.length,
      totalAuthors: users.length,
      novels,
      chapters,
      users,
      staticPages: [
        { title: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", path: "/" },
        { title: "\u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u0631\u0648\u0627\u064A\u0627\u062A", path: "/?view=explore" },
        { title: "\u0627\u0644\u0623\u0643\u062B\u0631 \u0642\u0631\u0627\u0621\u0629", path: "/?view=most-read" },
        { title: "\u0627\u0644\u0645\u0643\u062A\u0628\u0629", path: "/?view=library" },
        { title: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645", path: "/?view=dashboard" },
        { title: "\u0627\u0644\u0643\u0627\u062A\u0628 \u0627\u0644\u0630\u0643\u064A AI", path: "/?view=ai-writer" },
        { title: "\u0643\u062A\u0628 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A", path: "/?view=ai-books" },
        { title: "\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0645\u0648\u0642\u0639", path: "/?view=sitemap" },
        { title: "\u0645\u0646 \u0646\u062D\u0646", path: "/#about" },
        { title: "\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629", path: "/#privacy" },
        { title: "\u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645", path: "/#terms" },
        { title: "\u0627\u062A\u0635\u0644 \u0628\u0646\u0627", path: "/#contact" }
      ]
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
var sitemap_default = router12;

// api-server/src/routes/index.ts
var router13 = (0, import_express13.Router)();
router13.use(health_default);
router13.use(gemini_default);
router13.use(upload_default);
router13.use(users_default);
router13.use(novels_default);
router13.use(chapters_default);
router13.use(follows_default);
router13.use(library_default);
router13.use(progress_default);
router13.use(comments_default);
router13.use(characters_default);
router13.use(sitemap_default);
var routes_default = router13;

// api-server/src/lib/logger.ts
var import_pino = __toESM(require("pino"), 1);
var logger = (0, import_pino.default)({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']"
  ]
});

// api-server/src/app.ts
var app = (0, import_express14.default)();
app.use(
  (0, import_pino_http.default)({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0]
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode
        };
      }
    }
  })
);
app.use((0, import_cors.default)());
app.use(import_express14.default.json({ limit: "15mb" }));
app.use(import_express14.default.urlencoded({ extended: true, limit: "15mb" }));
app.use("/api", async (req, res, next) => {
  try {
    await ensureDbReady();
    next();
  } catch (err) {
    next(err);
  }
}, routes_default);
var app_default = app;

// server.ts
async function startServer() {
  const app2 = (0, import_express15.default)();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3e3;
  app2.get("/dist_complete.zip", (req, res) => {
    const filePath = import_path2.default.join(process.cwd(), "dist_complete.zip");
    res.download(filePath, "dist_complete.zip");
  });
  app2.get("/download-dist-zip", (req, res) => {
    const filePath = import_path2.default.join(process.cwd(), "dist_complete.zip");
    res.download(filePath, "dist_complete.zip");
  });
  app2.get("/roayti-full-project.zip", (req, res) => {
    const filePath = import_path2.default.join(process.cwd(), "roayti-full-project.zip");
    res.download(filePath, "roayti-full-project.zip");
  });
  app2.get("/download-project-zip", (req, res) => {
    const filePath = import_path2.default.join(process.cwd(), "roayti-full-project.zip");
    res.download(filePath, "roayti-full-project.zip");
  });
  app2.get("/sitemap.xml", (req, res) => {
    res.redirect("/api/sitemap.xml");
  });
  app2.use(app_default);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app2.use(import_express15.default.static(distPath));
    app2.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
