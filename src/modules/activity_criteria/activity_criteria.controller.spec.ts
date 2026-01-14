import { Test, TestingModule } from '@nestjs/testing';
import { ActivityCriteriaController } from './activity_criteria.controller';
import { ActivityCriteriaService } from './activity_criteria.service';

describe('ActivityCriteriaController', () => {
  let controller: ActivityCriteriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityCriteriaController],
      providers: [ActivityCriteriaService],
    }).compile();

    controller = module.get<ActivityCriteriaController>(ActivityCriteriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
