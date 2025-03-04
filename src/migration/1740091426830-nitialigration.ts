import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1740092081251 implements MigrationInterface {
  name = 'Migration1740092081251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_statusprofile_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN', 'MODERATOR', 'ORGANIZER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "nickname" character varying(100) NOT NULL, "hashPassword" text NOT NULL, "mainPhoto" text, "statusProfile" "public"."users_statusprofile_enum" NOT NULL DEFAULT 'active', "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "sessionId" uuid, CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "place" character varying NOT NULL, "date" date NOT NULL, "time" TIME NOT NULL, "description" text NOT NULL, "maxPlayers" integer NOT NULL, "skillsLvl" integer NOT NULL, "organizerId" uuid, "boardGameId" uuid, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "history_game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "result" character varying, "scope" character varying, "sessionId" uuid, CONSTRAINT "PK_f67297ffdcf2aa83edcbc53e29c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "board_game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameBoardGame" character varying(255) NOT NULL, "equipment" text NOT NULL, "minPlayers" integer NOT NULL, "maxPlayers" integer NOT NULL, "description" text NOT NULL, "age" integer NOT NULL, "boardGameImage" text NOT NULL, "rules" text NOT NULL, "categoryId" uuid NOT NULL, CONSTRAINT "PK_db53e00791f46f05e277bbe37b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tags_for_board_game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameTag" character varying(255) NOT NULL, CONSTRAINT "PK_77e950bad6f077a804c353fb6bf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameCategory" character varying(255) NOT NULL, "categoryImage" text NOT NULL, "description" text NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tags_for_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameTag" character varying(255) NOT NULL, CONSTRAINT "PK_7868fe53e78281fcf6a9d03d290" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "boardGameName" character varying(255) NOT NULL, "skillLvl" integer NOT NULL, "skillPercent" character varying(255) NOT NULL, "userId" uuid, CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameTag" character varying(255) NOT NULL, "sessionId" uuid, CONSTRAINT "PK_db7d2119999196915794d1a52ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "board_game_tags_tags_for_board_game" ("boardGameId" uuid NOT NULL, "tagsForBoardGameId" uuid NOT NULL, CONSTRAINT "PK_3416fa334163cc0b46f91d97e74" PRIMARY KEY ("boardGameId", "tagsForBoardGameId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0644116a6b08d4d0b9e94b5d1f" ON "board_game_tags_tags_for_board_game" ("boardGameId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_766c9f8f5746d159b678902845" ON "board_game_tags_tags_for_board_game" ("tagsForBoardGameId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "category_tags_tags_for_category" ("categoryId" uuid NOT NULL, "tagsForCategoryId" uuid NOT NULL, CONSTRAINT "PK_b131f210e634b4febae46f8bc86" PRIMARY KEY ("categoryId", "tagsForCategoryId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_131390046c13009c0da22eb58f" ON "category_tags_tags_for_category" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_89e61208b27b33a69a5d3e393e" ON "category_tags_tags_for_category" ("tagsForCategoryId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "players" ADD CONSTRAINT "FK_7c11c744c0601ab432cfa6ff7ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "players" ADD CONSTRAINT "FK_6ba252fc05dc5b71cdec04c18b6" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_ee4628e61e8d8c1b44395de7291" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_0360ed3c00db1717c8da94416ef" FOREIGN KEY ("boardGameId") REFERENCES "board_game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "history_game" ADD CONSTRAINT "FK_2eb0fc44ecffcc9e2cacbe4998a" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_game" ADD CONSTRAINT "FK_76bc8db1391786b071a1c6dc1c8" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "FK_ee1265e76ea0b8c5f7daa85e817" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_tags" ADD CONSTRAINT "FK_13d370a948d8a9187d683314d85" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_game_tags_tags_for_board_game" ADD CONSTRAINT "FK_0644116a6b08d4d0b9e94b5d1ff" FOREIGN KEY ("boardGameId") REFERENCES "board_game"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_game_tags_tags_for_board_game" ADD CONSTRAINT "FK_766c9f8f5746d159b6789028450" FOREIGN KEY ("tagsForBoardGameId") REFERENCES "tags_for_board_game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_tags_tags_for_category" ADD CONSTRAINT "FK_131390046c13009c0da22eb58fe" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_tags_tags_for_category" ADD CONSTRAINT "FK_89e61208b27b33a69a5d3e393e8" FOREIGN KEY ("tagsForCategoryId") REFERENCES "tags_for_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category_tags_tags_for_category" DROP CONSTRAINT "FK_89e61208b27b33a69a5d3e393e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_tags_tags_for_category" DROP CONSTRAINT "FK_131390046c13009c0da22eb58fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_game_tags_tags_for_board_game" DROP CONSTRAINT "FK_766c9f8f5746d159b6789028450"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_game_tags_tags_for_board_game" DROP CONSTRAINT "FK_0644116a6b08d4d0b9e94b5d1ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_tags" DROP CONSTRAINT "FK_13d370a948d8a9187d683314d85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP CONSTRAINT "FK_ee1265e76ea0b8c5f7daa85e817"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_game" DROP CONSTRAINT "FK_76bc8db1391786b071a1c6dc1c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "history_game" DROP CONSTRAINT "FK_2eb0fc44ecffcc9e2cacbe4998a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_0360ed3c00db1717c8da94416ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_ee4628e61e8d8c1b44395de7291"`,
    );
    await queryRunner.query(
      `ALTER TABLE "players" DROP CONSTRAINT "FK_6ba252fc05dc5b71cdec04c18b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "players" DROP CONSTRAINT "FK_7c11c744c0601ab432cfa6ff7ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_89e61208b27b33a69a5d3e393e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_131390046c13009c0da22eb58f"`,
    );
    await queryRunner.query(`DROP TABLE "category_tags_tags_for_category"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_766c9f8f5746d159b678902845"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0644116a6b08d4d0b9e94b5d1f"`,
    );
    await queryRunner.query(`DROP TABLE "board_game_tags_tags_for_board_game"`);
    await queryRunner.query(`DROP TABLE "custom_tags"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP TABLE "tags_for_category"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "tags_for_board_game"`);
    await queryRunner.query(`DROP TABLE "board_game"`);
    await queryRunner.query(`DROP TABLE "history_game"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "players"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_statusprofile_enum"`);
  }
}
