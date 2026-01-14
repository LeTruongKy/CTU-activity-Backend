import { Test, TestingModule } from '@nestjs/testing';
import { CriteriaGroupsController } from './criteria_groups.controller';
import { CriteriaGroupsService } from './criteria_groups.service';

describe('CriteriaGroupsController', () => {
  let controller: CriteriaGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CriteriaGroupsController],
      providers: [CriteriaGroupsService],
    }).compile();

    controller = module.get<CriteriaGroupsController>(CriteriaGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
