import { Database } from 'bun:sqlite';

const backendRoot = `${import.meta.dir}/../..`;
const dbPath = `${backendRoot}/data/scores.db`;
const schemaPath = `${import.meta.dir}/schema.sql`;

const db = new Database(dbPath, { create: true });
const schema = await Bun.file(schemaPath).text();
db.exec(schema);

export default db;
