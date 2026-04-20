import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Activity } from '../../modules/activities/entities/activity.entity';
import { Registration } from '../../modules/registrations/entities/registration.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    @InjectRepository(Registration)
    private registrationsRepository: Repository<Registration>,
  ) {}

  async generateActivityParticipantsReport(activityId: number): Promise<Buffer> {
    try {
      // Fetch activity
      const activity = await this.activitiesRepository.findOne({
        where: { id: activityId },
      });
      if (!activity) {
        throw new NotFoundException(`Activity with ID ${activityId} not found`);
      }

      // Fetch all registrations for this activity with user data
      const registrations = await this.registrationsRepository.find({
        where: { activityId },
        relations: ['user'],
        order: { registeredAt: 'DESC' },
      });

      // Prepare data for Excel
      const data = registrations.map((reg) => ({
        'Họ và Tên': reg.user?.fullName || '',
        'Mã số': reg.user?.studentCode || '',
        Email: reg.user?.email || '',
        'Trạng thái minh chứng': (reg.proofStatus === 'VERIFIED' ? 'Đã minh chứng' : 'Chưa minh chứng'),
        'Ngày đăng ký': reg.registeredAt
          ? new Date(reg.registeredAt).toLocaleDateString('en-US')
          : '',
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data, {
        header: ['Họ và Tên', 'Mã số', 'Email', 'Trạng thái minh chứng', 'Ngày đăng ký'],
      });

      // Set column widths
      worksheet['!cols'] = [
        { wch: 25 }, // Full Name
        { wch: 15 }, // Student Code
        { wch: 30 }, // Email
        { wch: 15 }, // Proof Status
        { wch: 18 }, // Registered Date
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

      // Generate buffer with proper encoding
      const buffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
      }) as unknown as Buffer;
      
      return Buffer.from(buffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error generating report:', error);
      throw new InternalServerErrorException('Failed to generate report');
    }
  }

  getReportFilename(activityId: number, activityTitle: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedTitle = activityTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `activity_${activityId}_${sanitizedTitle}_${timestamp}.xlsx`;
  }
}
