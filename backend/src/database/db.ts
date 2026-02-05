import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'scores.db');
const schemaPath = join(process.cwd(), 'src', 'database', 'schema.sql');

const db = new Database(dbPath);
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);

export default db;
