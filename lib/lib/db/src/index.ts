import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Prevent unhandled errors from terminating the Node process
process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled rejection absorbed:', reason);
});
process.on('uncaughtException', (err) => {
  console.warn('Uncaught exception absorbed:', err);
});

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
      connectionTimeoutMillis: 4000,
    });
    // Critical: handle pool errors so Node.js never crashes on unhandled 'error' event
    pgPool.on('error', (err) => {
      console.warn("PostgreSQL pool background error handled:", err?.message || err);
    });
    pgPool.on('connect', (client) => {
      client.query('SET search_path TO public, "$user"');
    });
    activeDb = drizzlePg(pgPool, { schema });
    usePg = true;
    console.log("Configured PostgreSQL connection pool with error handler.");
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
        console.warn("Gracefully shutting down dead PostgreSQL pool and switching to PGlite.");
        try {
          pgPool.end().catch(() => {});
        } catch (_) {}
        pgPool = null;
        isPg = false;
        usePg = false;
        activeDb = initPGlite();
      }
    }

    // Fast check: if novels table already exists and has records, skip initialization entirely!
    try {
      const q = isPg && pgPool 
        ? await pgPool.query("SELECT COUNT(*)::int as count FROM novels")
        : (client ? await client.query("SELECT COUNT(*)::int as count FROM novels") : null);
      if (q && q.rows && q.rows[0] && (q.rows[0].count > 0 || q.rows[0].count === 0)) {
        if (q.rows[0].count > 0) {
          console.log(`Database is already populated with ${q.rows[0].count} novels. Skipping seed.`);
          return;
        }
      }
    } catch (_) {
      // Table doesn't exist yet, proceed with DDL and seeding
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
    }

    // 2. Insert data from clean_inserts_perfect.sql with memory-efficient batching
    const cleanSqlPath = getSqlFilePath("clean_inserts_perfect.sql");
    if (cleanSqlPath) {
      console.log(`Loading seed data from ${cleanSqlPath}...`);
      const cleanSql = fs.readFileSync(cleanSqlPath, "utf8");
      const statements = cleanSql.split("-- STATEMENT_END --");
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim();
        if (!stmt) continue;

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

        if (i % 20 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      }
      console.log(`Database populated successfully! Success: ${successCount}, Errors: ${errorCount}`);
    }
  })();

  return initPromise;
}

ensureDbReady().catch(console.error);

export * from "./schema";
