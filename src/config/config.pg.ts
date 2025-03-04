import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'admin',
  database: process.env.POSTGRES_DATABASE || 'owngame',

  entities: [join(__dirname, '/../**/*.entity{.ts,.js}')],

  // Отключаем миграции
  migrationsTableName: 'migration',

  // Синхронизация с базой данных, которая будет происходить автоматически при запуске приложения
  synchronize: true,

  // Логирование в режиме разработки
  logging: process.env.NODE_ENV === 'development',
});
