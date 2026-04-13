/**
 * DTO for SV5T Criteria Progress Response
 * Shows status of individual criteria (MET/NOT_MET/IN_PROGRESS)
 */
export class CriteriaProgressDto {
  criteriaId: number;
  code: string;
  name: string;
  status: 'MET' | 'NOT_MET' | 'IN_PROGRESS';
  description: string;
  verifiedActivityCount?: number;
  requiredActivityCount?: number;
}

/**
 * DTO for SV5T Group Progress Response
 * Shows progress for each of the 5 standards
 */
export class CriteriaGroupProgressDto {
  groupId: number;
  groupName: string;
  progress: number; // 0-100 percentage
  completed: boolean;
  criteria: CriteriaProgressDto[];
}

/**
 * DTO for overall SV5T Progress Response
 * Comprehensive summary of user's SV5T eligibility and progress
 */
export class SV5tProgressResponseDto {
  userId: string;
  studentCode: string;
  fullName: string;
  overallProgress: number; // 0-100 percentage
  sv5tEligible: boolean;
  criteriaGroups: CriteriaGroupProgressDto[];
  lastActivityVerification?: Date;
  generatedAt: Date;
}

/**
 * DTO for User Activity Response
 * Shows activities the user has participated in
 */
export class UserActivityResponseDto {
  registrationId: string;
  activityId: number;
  activityTitle: string;
  activityDescription: string;
  category: string;
  unit: string;
  startTime?: Date;
  endTime?: Date;
  registrationStatus: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';
  proofStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rating?: number;
  verifiedAt?: Date;
}
