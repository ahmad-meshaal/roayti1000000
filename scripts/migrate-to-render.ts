import pg from "pg";
import fs from "fs";
import path from "path";

const DATABASE_URL = "postgresql://roayti_com_user:SJ3I8w2E0BZUOqYR4xlhpiCLEOb8AvL8@dpg-d9t5t0afngtc73cqctq0-a.oregon-postgres.render.com/roayti_com";

async function main() {
  console.log("Starting database migration to Render PostgreSQL...");
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Render PostgreSQL usually requires SSL, this ensures it works smoothly
  });

  try {
    await client.connect();
    console.log("Successfully connected to Render PostgreSQL!");

    // 1. Drop existing tables to ensure a clean slate
    console.log("Dropping existing tables if any...");
    const tablesToDrop = [
      "chapters",
      "characters",
      "comments",
      "follows",
      "library",
      "likes",
      "notifications",
      "novels",
      "reading_progress",
      "users",
      "world_notes"
    ];
    for (const table of tablesToDrop) {
      try {
        await client.query(`DROP TABLE IF EXISTS public.${table} CASCADE;`);
        console.log(`Dropped table public.${table} if it existed.`);
      } catch (err: any) {
        console.warn(`Could not drop table public.${table}:`, err.message);
      }
    }

    // 2. Read and parse schema from roayti-FULL-DATABASE.sql
    const schemaPath = path.join(process.cwd(), "roayti-FULL-DATABASE.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    console.log("Reading schema from roayti-FULL-DATABASE.sql...");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // Extract only DDL lines (ignore INSERT statements from the backup to keep it clean, as we have clean_inserts_perfect.sql)
    const schemaLines = schemaSql.split("\n");
    const ddlLines: string[] = [];
    for (const line of schemaLines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("--") ||
        trimmed.startsWith("INSERT INTO") ||
        trimmed.startsWith("\\") ||
        trimmed.includes("OWNER TO") ||
        trimmed === ""
      ) {
        continue;
      }
      ddlLines.push(line);
    }

    const ddlSql = ddlLines.join("\n");
    
    // Split the DDL by semicolon to execute clean individual queries
    const ddlStatements = ddlSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Executing ${ddlStatements.length} schema/DDL statements...`);
    let ddlSuccess = 0;
    let ddlError = 0;
    for (const statement of ddlStatements) {
      try {
        if (statement.toLowerCase().startsWith("set ")) {
          continue;
        }
        await client.query(statement + ";");
        ddlSuccess++;
      } catch (err: any) {
        ddlError++;
        console.error(`Error executing DDL statement:`, statement.substring(0, 100), "...", err.message);
      }
    }
    console.log(`DDL execution complete. Success: ${ddlSuccess}, Errors: ${ddlError}`);

    // 3. Import data from clean_inserts_perfect.sql
    const dataPath = path.join(process.cwd(), "clean_inserts_perfect.sql");
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Data file not found at ${dataPath}`);
    }
    console.log("Reading seed data from clean_inserts_perfect.sql...");
    const dataSql = fs.readFileSync(dataPath, "utf8");
    const statements = dataSql
      .split("-- STATEMENT_END --")
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`Found ${statements.length} data insert statements. Inserting into Render database...`);
    let insertSuccess = 0;
    let insertError = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
        insertSuccess++;
      } catch (err: any) {
        insertError++;
        // Print the first few errors completely to diagnose, and sample subsequent errors
        if (insertError <= 10 || i === statements.length - 1) {
          console.error(`Error inserting statement at index ${i}:`, err.message);
          console.error(`Statement:`, stmt.substring(0, 200), "...");
        }
      }
      if ((i + 1) % 50 === 0 || i === statements.length - 1) {
        console.log(`Progress: ${i + 1}/${statements.length} statements processed...`);
      }
    }

    console.log(`Migration completed!`);
    console.log(`- Created/verified database schema.`);
    console.log(`- Successfully inserted ${insertSuccess} data records (with ${insertError} errors).`);

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
    console.log("Disconnected from database.");
  }
}

main();
