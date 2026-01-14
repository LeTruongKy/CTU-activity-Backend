import { Test, TestingModule } from '@nestjs/testing';
import { ActivityCriteriaService } from './activity_criteria.service';

describe('ActivityCriteriaService', () => {
  let service: ActivityCriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityCriteriaService],
    }).compile();

    service = module.get<ActivityCriteriaService>(ActivityCriteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
