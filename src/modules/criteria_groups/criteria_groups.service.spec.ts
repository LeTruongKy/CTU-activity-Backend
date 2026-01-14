import { Test, TestingModule } from '@nestjs/testing';
import { CriteriaGroupsService } from './criteria_groups.service';

describe('CriteriaGroupsService', () => {
  let service: CriteriaGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CriteriaGroupsService],
    }).compile();

    service = module.get<CriteriaGroupsService>(CriteriaGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
