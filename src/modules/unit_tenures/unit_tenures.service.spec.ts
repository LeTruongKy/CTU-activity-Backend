import { Test, TestingModule } from '@nestjs/testing';
import { UnitTenuresService } from './unit_tenures.service';

describe('UnitTenuresService', () => {
  let service: UnitTenuresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitTenuresService],
    }).compile();

    service = module.get<UnitTenuresService>(UnitTenuresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
