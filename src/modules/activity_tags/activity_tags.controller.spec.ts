import { Test, TestingModule } from '@nestjs/testing';
import { ActivityTagsController } from './activity_tags.controller';
import { ActivityTagsService } from './activity_tags.service';

describe('ActivityTagsController', () => {
  let controller: ActivityTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityTagsController],
      providers: [ActivityTagsService],
    }).compile();

    controller = module.get<ActivityTagsController>(ActivityTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
