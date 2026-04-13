import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StudentProgressService } from './student_progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('students')
export class StudentProgressController {
  constructor(private readonly studentProgressService: StudentProgressService) {}

  /**
   * GET /students/progress
   * Get current student's SV5T criteria completion progress
   */
  @Get('progress')
  @UseGuards(JwtAuthGuard)
  async getProgress(@Req() req: any) {
    const progress = await this.studentProgressService.getStudentProgress(req.user.id);
    return {
      message: 'Student progress retrieved successfully',
      data: progress,
    };
  }
}
