import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';
import { join } from 'path';

const backendRoot = join(import.meta.dir, '..', '..');
const dbPath = join(backendRoot, 'data', 'scores.db');
const schemaPath = join(import.meta.dir, 'schema.sql');

const db = new Database(dbPath, { create: true });
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);

export default db;
