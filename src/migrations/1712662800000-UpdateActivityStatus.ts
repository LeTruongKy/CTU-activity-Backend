import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateActivityStatus1712662800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop the old enum constraint
    await queryRunner.query(`
      ALTER TABLE "activities" 
      ALTER COLUMN "status" TYPE varchar;
    `);

    // Step 2: Update existing data to new enum values
    const updates = [
      `UPDATE "activities" SET "status" = 'PENDING' WHERE "status" IN ('DRAFT', 'PENDING')`,
      `UPDATE "activities" SET "status" = 'PUBLIC' WHERE "status" IN ('APPROVED', 'PUBLISHED')`,
      `UPDATE "activities" SET "status" = 'COMPLETE' WHERE "status" IN ('COMPLETED')`,
      `UPDATE "activities" SET "status" = 'CANCEL' WHERE "status" IN ('CANCELLED', 'REJECTED')`,
    ];

    for (const update of updates) {
      await queryRunner.query(update);
    }

    // Step 3: Create new enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS "activities_status_enum_new";
    `);

    await queryRunner.query(`
      CREATE TYPE "activities_status_enum_new" AS ENUM('PENDING', 'PUBLIC', 'CANCEL', 'COMPLETE');
    `);

    // Step 4: Cast column to new enum type
    await queryRunner.query(`
      ALTER TABLE "activities" 
      ALTER COLUMN "status" TYPE "activities_status_enum_new" USING "status"::"activities_status_enum_new",
      ALTER COLUMN "status" SET DEFAULT 'PENDING';
    `);

    // Step 5: Drop old enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS "activities_status_enum";
    `);

    // Step 6: Rename new enum to standard name
    await queryRunner.query(`
      ALTER TYPE "activities_status_enum_new" RENAME TO "activities_status_enum";
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Recreate old enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS "activities_status_enum";
    `);

    await queryRunner.query(`
      CREATE TYPE "activities_status_enum" AS ENUM('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'COMPLETED', 'CANCELLED');
    `);

    await queryRunner.query(`
      ALTER TABLE "activities" 
      ALTER COLUMN "status" TYPE "activities_status_enum" USING 'DRAFT'::"activities_status_enum",
      ALTER COLUMN "status" SET DEFAULT 'DRAFT';
    `);

  }
}
