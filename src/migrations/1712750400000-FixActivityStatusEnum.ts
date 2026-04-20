import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * ðŸ”§ MIGRATION: Fix Activity Status Enum
 * 
 * This migration fixes the activities_status_enum to support the correct status values:
 * PENDING -> Created, awaiting approval
 * PUBLISHED -> Approved and active
 * CANCELLED -> Cancelled/Rejected
 * COMPLETED -> Finished
 */
export class FixActivityStatusEnum1712750400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Convert status column to string type temporarily
    await queryRunner.query(`
      ALTER TABLE "activities" 
      ALTER COLUMN "status" TYPE varchar;
    `);

    // Step 2: Normalize existing data to valid enum values
    const dataUpdates = [
      `UPDATE "activities" SET "status" = 'PENDING' WHERE "status" IN ('DRAFT', 'PENDING')`,
      `UPDATE "activities" SET "status" = 'PUBLISHED' WHERE "status" IN ('PUBLIC', 'PUBLISHED', 'APPROVED')`,
      `UPDATE "activities" SET "status" = 'CANCELLED' WHERE "status" IN ('CANCEL', 'CANCELLED', 'REJECTED')`,
      `UPDATE "activities" SET "status" = 'COMPLETED' WHERE "status" IN ('COMPLETE', 'COMPLETED')`,
      `UPDATE "activities" SET "status" = 'PENDING' WHERE "status" NOT IN ('PENDING', 'PUBLISHED', 'CANCELLED', 'COMPLETED')`,
    ];

    for (const update of dataUpdates) {
      try {
        await queryRunner.query(update);
      } catch (error) {
        console.error(`Failed to execute: ${update}`);
      }
    }

    // Step 3: Drop old enum type if exists
    await queryRunner.query(`
      DROP TYPE IF EXISTS "activities_status_enum_new" CASCADE;
    `);

    // Only drop if exists (to avoid errors)
    try {
      await queryRunner.query(`
        DROP TYPE IF EXISTS "activities_status_enum" CASCADE;
      `);
    } catch (error) {
      console.warn('Could not drop existing enum type (may not exist)');
    }

    // Step 4: Create new enum type with correct values
    await queryRunner.query(`
      CREATE TYPE "activities_status_enum" AS ENUM('PENDING', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
    `);

    // Step 5: Cast column to new enum type
    await queryRunner.query(`
      ALTER TABLE "activities" 
      ALTER COLUMN "status" TYPE "activities_status_enum" USING "status"::"activities_status_enum",
      ALTER COLUMN "status" SET DEFAULT 'PENDING';
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    // Revert: Convert to varchar
    await queryRunner.query(`
      ALTER TABLE "activities" 
      ALTER COLUMN "status" TYPE varchar;
    `);

    // Revert: Map back to old values
    await queryRunner.query(`
      UPDATE "activities" SET "status" = 'DRAFT' WHERE "status" = 'PENDING'
    `);
    await queryRunner.query(`
      UPDATE "activities" SET "status" = 'PUBLISHED' WHERE "status" = 'PUBLISHED'
    `);
    await queryRunner.query(`
      UPDATE "activities" SET "status" = 'CANCELLED' WHERE "status" = 'CANCELLED'
    `);
    await queryRunner.query(`
      UPDATE "activities" SET "status" = 'COMPLETED' WHERE "status" = 'COMPLETED'
    `);

    // Drop new enum
    await queryRunner.query(`DROP TYPE IF EXISTS "activities_status_enum" CASCADE;`);

  }
}
