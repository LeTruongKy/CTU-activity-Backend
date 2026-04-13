import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserCriteriaService } from './user-criteria.service';
import { UserCriteria } from './entities/user_criteria.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { CriteriaGroup } from '../criteria_groups/entities/criteria_group.entity';
import { UserCriteriaRepository } from './user-criteria.repository';

describe('UserCriteriaService', () => {
  let service: UserCriteriaService;
  let userCriteriaRepo: any;
  let registrationRepo: any;
  let criteriaGroupRepo: any;
  let dataSource: any;

  const mockUserId = 'user-123';
  const mockGroupId = 1;

  beforeEach(async () => {
    // Mock repositories
    userCriteriaRepo = {
      findOrCreateUserCriteria: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
      getCompletionStats: jest.fn(),
    };

    registrationRepo = {
      count: jest.fn(),
      find: jest.fn(),
    };

    criteriaGroupRepo = {
      findOne: jest.fn(),
    };

    dataSource = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCriteriaService,
        {
          provide: getRepositoryToken(UserCriteria),
          useValue: userCriteriaRepo,
        },
        {
          provide: getRepositoryToken(Registration),
          useValue: registrationRepo,
        },
        {
          provide: getRepositoryToken(CriteriaGroup),
          useValue: criteriaGroupRepo,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<UserCriteriaService>(UserCriteriaService);
  });

  describe('recalculateUserCriteria', () => {
    it('should calculate progress correctly when verified count >= required count', async () => {
      // Arrange
      const userCriteria: any = {
        id: 'uc-123',
        userId: mockUserId,
        criteriaGroupId: mockGroupId,
        progressCount: 0,
        completionCount: 0,
        autoCompleted: false,
        userOverride: null,
        finalCompleted: false,
        lastCalculatedAt: new Date(),
      };

      const criteriaGroup: any = {
        id: mockGroupId,
        requiredCount: 3,
      };

      userCriteriaRepo.findOrCreateUserCriteria.mockResolvedValue(userCriteria);
      registrationRepo.count.mockResolvedValue(3); // 3 verified registrations
      criteriaGroupRepo.findOne.mockResolvedValue(criteriaGroup);
      userCriteriaRepo.save.mockResolvedValue({
        ...userCriteria,
        progressCount: 3,
        completionCount: 1,
        autoCompleted: true,
        finalCompleted: true,
      });

      // Act
      const result = await service.recalculateUserCriteria(mockUserId, mockGroupId);

      // Assert
      expect(result.progressCount).toBe(3);
      expect(result.completionCount).toBe(1);
      expect(result.autoCompleted).toBe(true);
      expect(result.finalCompleted).toBe(true);
    });

    it('should handle multiple completions (e.g., 6 registrations with requiredCount=3)', async () => {
      // Arrange
      const userCriteria: any = {
        id: 'uc-123',
        userId: mockUserId,
        criteriaGroupId: mockGroupId,
        progressCount: 0,
        completionCount: 0,
        autoCompleted: false,
        userOverride: null,
        finalCompleted: false,
        lastCalculatedAt: new Date(),
      };

      const criteriaGroup: any = {
        id: mockGroupId,
        requiredCount: 3,
      };

      userCriteriaRepo.findOrCreateUserCriteria.mockResolvedValue(userCriteria);
      registrationRepo.count.mockResolvedValue(6); // 6 verified = 2 completions
      criteriaGroupRepo.findOne.mockResolvedValue(criteriaGroup);
      userCriteriaRepo.save.mockResolvedValue({
        ...userCriteria,
        progressCount: 6,
        completionCount: 2,
        autoCompleted: true,
        finalCompleted: true,
      });

      // Act
      const result = await service.recalculateUserCriteria(mockUserId, mockGroupId);

      // Assert
      expect(result.completionCount).toBe(2); // Math.floor(6/3) = 2
      expect(result.progressCount).toBe(6);
    });

    it('should apply user override when set to true', async () => {
      // Arrange
      const userCriteria: any = {
        id: 'uc-123',
        userId: mockUserId,
        criteriaGroupId: mockGroupId,
        progressCount: 0,
        completionCount: 0,
        autoCompleted: false,
        userOverride: true, // User forced completion
        finalCompleted: false,
        lastCalculatedAt: new Date(),
      };

      const criteriaGroup: any = {
        id: mockGroupId,
        requiredCount: 3,
      };

      userCriteriaRepo.findOrCreateUserCriteria.mockResolvedValue(userCriteria);
      registrationRepo.count.mockResolvedValue(0); // 0 verified, normally not completed
      criteriaGroupRepo.findOne.mockResolvedValue(criteriaGroup);
      userCriteriaRepo.save.mockResolvedValue({
        ...userCriteria,
        progressCount: 0,
        completionCount: 0,
        autoCompleted: false,
        finalCompleted: true, // But override makes it completed
      });

      // Act
      const result = await service.recalculateUserCriteria(mockUserId, mockGroupId);

      // Assert
      expect(result.progressCount).toBe(0);
      expect(result.autoCompleted).toBe(false);
      expect(result.finalCompleted).toBe(true); // Override applied
    });

    it('should apply user override when set to false', async () => {
      // Arrange
      const userCriteria: any = {
        id: 'uc-123',
        userId: mockUserId,
        criteriaGroupId: mockGroupId,
        progressCount: 5,
        completionCount: 1,
        autoCompleted: true,
        userOverride: false, // User forced NOT completed
        finalCompleted: false,
        lastCalculatedAt: new Date(),
      };

      const criteriaGroup: any = {
        id: mockGroupId,
        requiredCount: 3,
      };

      userCriteriaRepo.findOrCreateUserCriteria.mockResolvedValue(userCriteria);
      registrationRepo.count.mockResolvedValue(5); // 5 verified, normally completed
      criteriaGroupRepo.findOne.mockResolvedValue(criteriaGroup);
      userCriteriaRepo.save.mockResolvedValue({
        ...userCriteria,
        progressCount: 5,
        completionCount: 1,
        autoCompleted: true,
        finalCompleted: false, // But override makes it not completed
      });

      // Act
      const result = await service.recalculateUserCriteria(mockUserId, mockGroupId);

      // Assert
      expect(result.progressCount).toBe(5);
      expect(result.autoCompleted).toBe(true);
      expect(result.finalCompleted).toBe(false); // Override applied
    });

    it('should throw error if criteria group not found', async () => {
      // Arrange
      const userCriteria: any = {
        id: 'uc-123',
        userId: mockUserId,
        criteriaGroupId: mockGroupId,
      };

      userCriteriaRepo.findOrCreateUserCriteria.mockResolvedValue(userCriteria);
      registrationRepo.count.mockResolvedValue(3);
      criteriaGroupRepo.findOne.mockResolvedValue(null); // Not found

      // Act & Assert
      await expect(service.recalculateUserCriteria(mockUserId, mockGroupId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('setUserOverride', () => {
    it('should set user override and recalculate', async () => {
      // Arrange
      const userCriteria: any = {
        id: 'uc-123',
        userId: mockUserId,
        criteriaGroupId: mockGroupId,
        userOverride: null,
        userOverriddenAt: null,
        overrideReason: null,
      };

      const updateDto = {
        userOverride: true,
        overrideReason: 'User requested completion',
      };

      userCriteriaRepo.findOrCreateUserCriteria.mockResolvedValue(userCriteria);
      registrationRepo.count.mockResolvedValue(0);
      criteriaGroupRepo.findOne.mockResolvedValue({ id: mockGroupId, requiredCount: 3 });
      userCriteriaRepo.save.mockResolvedValue({
        ...userCriteria,
        userOverride: true,
        userOverriddenAt: expect.any(Date),
        overrideReason: 'User requested completion',
        finalCompleted: true,
      });

      // Act
      const result = await service.setUserOverride(mockUserId, mockGroupId, updateDto);

      // Assert
      expect(result.userOverride).toBe(true);
      expect(result.userOverriddenAt).toBeDefined();
      expect(result.overrideReason).toBe('User requested completion');
    });
  });

  describe('setAdminOverride', () => {
    it('should set admin override with audit trail', async () => {
      // Arrange
      const adminId = 'admin-123';
      const userCriteria: any = {
        id: 'uc-123',
        userId: mockUserId,
        criteriaGroupId: mockGroupId,
        userOverride: null,
        userOverriddenAt: null,
        overriddenBy: null,
        overrideReason: null,
      };

      userCriteriaRepo.findOrCreateUserCriteria.mockResolvedValue(userCriteria);
      registrationRepo.count.mockResolvedValue(0);
      criteriaGroupRepo.findOne.mockResolvedValue({ id: mockGroupId, requiredCount: 3 });
      userCriteriaRepo.save.mockResolvedValue({
        ...userCriteria,
        userOverride: true,
        userOverriddenAt: expect.any(Date),
        overriddenBy: adminId,
        overrideReason: 'Admin force completed due to exceptional circumstances',
        finalCompleted: true,
      });

      // Act
      const result = await service.setAdminOverride(
        mockUserId,
        mockGroupId,
        true,
        adminId,
        'Admin force completed due to exceptional circumstances',
      );

      // Assert
      expect(result.userOverride).toBe(true);
      expect(result.overriddenBy).toBe(adminId);
      expect(result.overrideReason).toBe('Admin force completed due to exceptional circumstances');
    });
  });

  describe('batchRecalculateByGroup', () => {
    it('should batch recalculate all users in a group', async () => {
      // Arrange
      const userCriteria1: any = { userId: 'user-1', criteriaGroupId: mockGroupId };
      const userCriteria2: any = { userId: 'user-2', criteriaGroupId: mockGroupId };

      userCriteriaRepo.find.mockResolvedValue([userCriteria1, userCriteria2]);
      registrationRepo.count.mockResolvedValue(3);
      criteriaGroupRepo.findOne.mockResolvedValue({ id: mockGroupId, requiredCount: 3 });
      userCriteriaRepo.findOrCreateUserCriteria.mockResolvedValue({} as any);
      userCriteriaRepo.save.mockResolvedValue({} as any);

      // Act
      const result = await service.batchRecalculateByGroup(mockGroupId);

      // Assert
      expect(result).toBe(2); // 2 records updated
      expect(userCriteriaRepo.find).toHaveBeenCalled();
    });
  });

  describe('getTotalPointsEarned', () => {
    it('should calculate total points from completed criteria', async () => {
      // Arrange
      const completedCriteria: any = [
        {
          criteriaGroup: { pointsReward: 10 },
          completionCount: 1,
        },
        {
          criteriaGroup: { pointsReward: 20 },
          completionCount: 2,
        },
      ];

      const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(completedCriteria),
      };

      userCriteriaRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getTotalPointsEarned(mockUserId);

      // Assert
      expect(result).toBe(50); // (10*1) + (20*2) = 50
    });
  });
});
