import { mysqlTable, serial, varchar, int, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }),
});

export const reports = mysqlTable('reports', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }), // text, url, image
  content: varchar('content', { length: 1000 }),
  riskScore: int('risk_score'),
  createdAt: timestamp('created_at').defaultNow(),
});