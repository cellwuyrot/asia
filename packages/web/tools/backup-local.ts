import { createClient } from "@libsql/client";
import { mkdir, chmod } from "node:fs/promises";
import { resolve } from "node:path";
const url = process.env.DATABASE_URL || "";
if (!url.startsWith("file:")) throw new Error("This helper is only for local SQLite. Use your provider's backup/snapshot tools for remote libSQL/Turso.");
const dir = resolve(process.env.BACKUP_DIR || "../../backups");
await mkdir(dir, { recursive: true, mode: 0o700 });
const path = resolve(dir, `asia-basa-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
const client = createClient({ url });
try { await client.execute(`VACUUM INTO '${path.replace(/'/g, "''")}'`); await chmod(path, 0o600); console.log("Local snapshot created in BACKUP_DIR. Contains personal data; restrict access and retention."); }
finally { client.close(); }
