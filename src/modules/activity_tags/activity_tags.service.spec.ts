import { Test, TestingModule } from '@nestjs/testing';
import { ActivityTagsService } from './activity_tags.service';

describe('ActivityTagsService', () => {
  let service: ActivityTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityTagsService],
    }).compile();

    service = module.get<ActivityTagsService>(ActivityTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
