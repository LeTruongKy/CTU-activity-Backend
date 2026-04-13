import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserCriteriaService } from './user-criteria.service';

@Controller('user-criteria')
@UseGuards(JwtAuthGuard)
export class UserCriteriaController {
  constructor(private readonly userCriteriaService: UserCriteriaService) {}

  /**
   * GET /user-criteria
   * Get user's criteria
   */
  @Get()
  async getUserCriteria(@Request() req: any) {
    return this.userCriteriaService.getUserCriteria(req.user.id);
  }

  /**
   * POST /user-criteria
   * Add criteria to user
   */
  @Post()
  async addUserCriteria(
    @Request() req: any,
    @Body() body: { criteriaGroupId: number },
  ) {
    return this.userCriteriaService.addUserCriteria(req.user.id, body.criteriaGroupId);
  }

  /**
   * DELETE /user-criteria/:criteriaGroupId
   * Remove criteria from user
   */
  @Delete(':criteriaGroupId')
  async removeUserCriteria(
    @Request() req: any,
    @Param('criteriaGroupId') criteriaGroupId: number,
  ) {
    return this.userCriteriaService.removeUserCriteria(req.user.id, criteriaGroupId);
  }
}
