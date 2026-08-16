import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";
import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";

export let db: any;
let client: PGlite | null = null;
let pgPool: pg.Pool | null = null;

let dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  try {
    pgPool = new pg.Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    pgPool.on('connect', (client) => {
      client.query('SET search_path TO public, "$user"');
    });
    db = drizzlePg(pgPool, { schema });
    console.log("Connected to PostgreSQL database via node-postgres pool.");
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err);
    throw err;
  }
} else {
  try {
    const dbPath = path.join(process.cwd(), "database.pglite");
    client = new PGlite(dbPath);
    db = drizzlePglite(client, { schema });
    console.log(`PGlite initialized successfully on-disk at ${dbPath}.`);
  } catch (err) {
    console.error("Failed to initialize PGlite:", err);
    throw err;
  }
}

let initPromise: Promise<void> | null = null;

export async function ensureDbReady() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const isPg = !!dbUrl;

    // Find SQL files in root or dist directory
    const currentDir = typeof __dirname !== "undefined" 
      ? __dirname 
      : (import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd());

    const getSqlFilePath = (filename: string) => {
      const candidates = [
        path.join(process.cwd(), filename),
        path.join(process.cwd(), "dist", filename),
        path.join(currentDir, filename),
        path.join(currentDir, "..", filename),
        path.join(currentDir, "..", "..", "..", "..", filename),
      ];
      for (const p of candidates) {
        if (p && fs.existsSync(p)) return p;
      }
      return null;
    };

    // If using production PostgreSQL, check if tables already exist
    if (isPg && pgPool) {
      try {
        const res = await pgPool.query(
          "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')"
        );
        if (res.rows[0]?.exists) {
          console.log("PostgreSQL database tables already exist.");
          try {
            await pgPool.query("DELETE FROM comments WHERE author_uid LIKE '%_reader'");
          } catch (_) {}
          return;
        }
        console.log("PostgreSQL database is empty. Starting automatic schema and data initialization...");
      } catch (err) {
        console.error("Error checking tables in PostgreSQL database:", err);
      }
    }

    // 1. Create tables using DDL from roayti-FULL-DATABASE.sql
    const fullSqlPath = getSqlFilePath("roayti-FULL-DATABASE.sql");
    if (fullSqlPath) {
      console.log(`Creating database tables from ${fullSqlPath}...`);
      const fullSql = fs.readFileSync(fullSqlPath, "utf8");
      
      // Remove lines starting with backslash (psql meta-commands like \restrict)
      const cleanedSql = fullSql
        .split("\n")
        .filter(line => !line.trim().startsWith("\\"))
        .join("\n");
      
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

    // 2. Insert data from clean_inserts_perfect.sql
    const cleanSqlPath = getSqlFilePath("clean_inserts_perfect.sql");
    if (cleanSqlPath) {
      console.log(`Loading seed data from ${cleanSqlPath}...`);
      const cleanSql = fs.readFileSync(cleanSqlPath, "utf8");
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

export * from "./schema";

