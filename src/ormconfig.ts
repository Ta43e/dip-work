/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DataSource } from 'typeorm';
import config from './config/config.pg.migration.js';

const dataSourceOptions: any = config;

export default new DataSource({
  ...dataSourceOptions,
  migrations: ['src/migration/*.ts'],
  entities: ['src/**/*.entity{.ts,.js}'],
});
