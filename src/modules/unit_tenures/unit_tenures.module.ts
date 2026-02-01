import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitTenuresService } from './unit_tenures.service';
import { UnitTenuresController } from './unit_tenures.controller';
import { UnitTenure } from './entities/unit_tenure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnitTenure])],
  controllers: [UnitTenuresController],
  providers: [UnitTenuresService],
  exports: [UnitTenuresService],
})
export class UnitTenuresModule {}
