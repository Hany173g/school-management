import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { join } from 'node:path';
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;

dotenv.config({ path: envFile });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
});