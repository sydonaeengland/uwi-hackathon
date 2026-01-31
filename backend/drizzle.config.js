import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema.js',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'test',
  },
});