import { Test, TestingModule } from '@nestjs/testing';
import { InteractionLogsController } from './interaction_logs.controller';
import { InteractionLogsService } from './interaction_logs.service';

describe('InteractionLogsController', () => {
  let controller: InteractionLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteractionLogsController],
      providers: [InteractionLogsService],
    }).compile();

    controller = module.get<InteractionLogsController>(InteractionLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
