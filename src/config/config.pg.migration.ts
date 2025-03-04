import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DATABASE || 'mydb',
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/*.ts'],
  migrationsTableName: 'migration',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;
module.exports = AppDataSource;
