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
          console.log("PostgreSQL database tables already exist. Checking comments...");
          await seedCommentsIfEmpty();
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

    // 3. Ensure comments table is rich with reader comments
    await seedCommentsIfEmpty();
  })();

  return initPromise;
}

const SEED_READERS = [
  { name: 'سارة القحطاني', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', uid: 'user_sara_reader' },
  { name: 'أحمد الشامي', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', uid: 'user_ahmad_reader' },
  { name: 'نور الهدى', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', uid: 'user_nour_reader' },
  { name: 'عمر الفاروق', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', uid: 'user_omar_reader' },
  { name: 'مريم العلي', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', uid: 'user_maryam_reader' },
  { name: 'فيصل الدوسري', photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', uid: 'user_faisal_reader' },
  { name: 'ياسمين حمدي', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', uid: 'user_yasmine_reader' },
  { name: 'طارق زكريا', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', uid: 'user_tariq_reader' },
  { name: 'هدى المنصور', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', uid: 'user_huda_reader' },
  { name: 'كريم المنصور', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', uid: 'user_karim_reader' }
];

const SEED_COMMENT_TEXTS = [
  'فصل رائع جداً ومؤثر، الأحداث أصبحت مشوقة للغاية وبانتظار التكملة!',
  'أسلوب السرد ممتع ومليء بالحماس، أعجبني الحوار جداً والتفاصيل الدقيقة.',
  'تطور الشخصيات في هذا الجزء غير متوقع، الكاتب أبدع في تصوير المشهد.',
  'الحوارات عميقة وتلامس المشاعر، استمتعت بكل تفصيلة في هذا الفصل.',
  'النهاية هنا تحبس الأنفاس! يا ترى ماذا سيحدث في الفصل القادم؟',
  'الغموض يزداد في كل فقرة، أعجبني الوصف الدقيق للأماكن والمشاعر.',
  'من أجمل الروايات التي أتابعها هنا، لغة قوية وأسلوب متمكن جداً.',
  'مفاجأة غير متوقعة في الأحداث! لم أكن أتوقع هذا التحول إطلاقاً.',
  'التفاصيل والحبكة متماسكة لدرجة تجعلك تعيش داخل القصة، سلمت يداك.',
  'أحببت شجاعة البطل وطريقة تعامله مع الموقف الصعب.',
  'رواية تأخذك إلى عالم آخر، شكراً جزيلاً على هذا الإبداع المتواصل!',
  'أتمنى ألا يتأخر الفصل القادم، القصة وصلت إلى ذروة الحماس.'
];

export async function seedCommentsIfEmpty() {
  try {
    const isPg = !!dbUrl;
    let commentCount = 0;
    if (isPg && pgPool) {
      const res = await pgPool.query('SELECT COUNT(*) as count FROM comments');
      commentCount = parseInt(res.rows[0]?.count || '0', 10);
    } else if (client) {
      const res = await client.query('SELECT COUNT(*) as count FROM comments');
      commentCount = parseInt((res as any).rows[0]?.count || '0', 10);
    }

    if (commentCount > 10) {
      console.log(`Comments table already has ${commentCount} comments. Skipping seed.`);
      return;
    }

    console.log("Seeding comments table with rich reader feedback...");
    let chapters: { id: string; novel_id: string }[] = [];
    if (isPg && pgPool) {
      const res = await pgPool.query('SELECT id, novel_id FROM chapters LIMIT 500');
      chapters = res.rows;
    } else if (client) {
      const res = await client.query('SELECT id, novel_id FROM chapters LIMIT 500');
      chapters = (res as any).rows;
    }

    if (chapters.length === 0) {
      console.log("No chapters found to attach comments to.");
      return;
    }

    let inserted = 0;
    for (let i = 0; i < chapters.length; i++) {
      const chap = chapters[i];
      const numComments = 2 + (i % 3);
      for (let j = 0; j < numComments; j++) {
        const reader = SEED_READERS[(i * 3 + j) % SEED_READERS.length];
        const text = SEED_COMMENT_TEXTS[(i * 5 + j * 2) % SEED_COMMENT_TEXTS.length];
        const commentId = crypto.randomUUID();
        const daysAgo = (i % 20) + 1;
        const createdAt = new Date(Date.now() - daysAgo * 86400000 - j * 3600000).toISOString();

        const queryText = `
          INSERT INTO comments (id, novel_id, chapter_id, author_uid, author_name, author_photo, text, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `;
        const values = [commentId, chap.novel_id, chap.id, reader.uid, reader.name, reader.photo, text, createdAt];

        if (isPg && pgPool) {
          await pgPool.query(queryText, values);
        } else if (client) {
          await client.query(queryText, values);
        }
        inserted++;
      }
    }
    console.log(`Successfully seeded ${inserted} comments across ${chapters.length} chapters!`);
  } catch (err) {
    console.error("Error seeding comments:", err);
  }
}

ensureDbReady().catch(console.error);

export * from "./schema";

