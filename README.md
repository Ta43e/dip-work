Создание миграции 
yarn typeorm migration:create src/migration/InitialMigration

Запуск миграции 
yarn typeorm migration:create src/migration/InitialMigration

Откат миграции 
yarn typeorm migration:revert

npx typeorm migration:revert -d .\dist\config\config.pg.migration.js





npm run migration:generate
npx typeorm migration:run -d ./dist/config/config.pg.migration.js