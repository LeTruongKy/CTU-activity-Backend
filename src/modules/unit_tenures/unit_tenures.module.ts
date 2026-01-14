import { Module } from '@nestjs/common';
import { UnitTenuresService } from './unit_tenures.service';
import { UnitTenuresController } from './unit_tenures.controller';

@Module({
  controllers: [UnitTenuresController],
  providers: [UnitTenuresService],
})
export class UnitTenuresModule {}
