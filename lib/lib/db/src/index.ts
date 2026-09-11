import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

let client: PGlite | null = null;
let pgPool: pg.Pool | null = null;
let activeDb: any = null;
let usePg = false;

const dbUrl = process.env.DATABASE_URL;

function initPGlite() {
  if (!client) {
    try {
      const dbPath = path.join(process.cwd(), "database.pglite");
      client = new PGlite(dbPath);
      console.log(`PGlite initialized successfully on-disk at ${dbPath}.`);
    } catch (err) {
      console.error("Failed to initialize PGlite on disk, falling back to memory:", err);
      client = new PGlite();
    }
  }
  return drizzlePglite(client, { schema });
}

if (dbUrl) {
  try {
    pgPool = new pg.Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    pgPool.on('connect', (client) => {
      client.query('SET search_path TO public, "$user"');
    });
    activeDb = drizzlePg(pgPool, { schema });
    usePg = true;
    console.log("Configured PostgreSQL connection pool with timeout.");
  } catch (err) {
    console.error("Failed to create PostgreSQL pool, falling back to PGlite:", err);
    activeDb = initPGlite();
    usePg = false;
  }
} else {
  activeDb = initPGlite();
  usePg = false;
}

export const db: any = new Proxy({} as any, {
  get(_target, prop) {
    const current = activeDb || initPGlite();
    const val = current[prop];
    return typeof val === "function" ? val.bind(current) : val;
  }
});

let initPromise: Promise<void> | null = null;

export async function ensureDbReady() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let isPg = usePg && !!pgPool;

    // Verify PostgreSQL connection if configured
    if (isPg && pgPool) {
      try {
        console.log("Testing PostgreSQL connection...");
        await pgPool.query("SELECT 1");
        console.log("PostgreSQL connection confirmed healthy.");
      } catch (connErr: any) {
        console.warn("PostgreSQL connection failed (" + (connErr?.message || connErr) + ").");
        console.warn("Gracefully falling back to embedded PGlite database to keep the site online.");
        isPg = false;
        usePg = false;
        activeDb = initPGlite();
      }
    }

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

    // Check if tables already exist
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
    } else if (client) {
      try {
        const res = await client.query(
          "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')"
        );
        if (res.rows[0]?.exists) {
          console.log("PGlite database tables already exist.");
          return;
        }
      } catch (_) {
        // Continue to create tables if check fails
      }
    }

    // 1. Create tables using DDL from roayti-FULL-DATABASE.sql
    const fullSqlPath = getSqlFilePath("roayti-FULL-DATABASE.sql");
    if (fullSqlPath) {
      console.log(`Creating database tables from ${fullSqlPath}...`);
      const fullSql = fs.readFileSync(fullSqlPath, "utf8");
      
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
        console.log("PGlite schema created successfully.");
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
