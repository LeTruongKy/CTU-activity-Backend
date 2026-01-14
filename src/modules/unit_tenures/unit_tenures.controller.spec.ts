import { Test, TestingModule } from '@nestjs/testing';
import { UnitTenuresController } from './unit_tenures.controller';
import { UnitTenuresService } from './unit_tenures.service';

describe('UnitTenuresController', () => {
  let controller: UnitTenuresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitTenuresController],
      providers: [UnitTenuresService],
    }).compile();

    controller = module.get<UnitTenuresController>(UnitTenuresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
