import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUpdatedAtFromUserActivitySchedule1744415400000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_activity_schedule" DROP COLUMN IF EXISTS "updatedAt"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_activity_schedule" ADD COLUMN "updatedAt" TIMESTAMP DEFAULT now()`,
    );
  }
}
