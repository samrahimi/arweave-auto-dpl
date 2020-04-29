
import { Pool } from 'pg';

/*
if (typeof process.env.DATABASE_URL !== 'string') {
  throw new Error(`Please set DATABASE_URL environment var`);
} */

const parsed = new URL('postgresql://postgres:aVARYsacrat9331@localhost:5432/scraper');

const client = new Pool({
  user: parsed.username,
  host: parsed.hostname,
  database: parsed.pathname.substr(1),
  password: parsed.password,
  port: parseInt(parsed.port),
})

export { client as db }