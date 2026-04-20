import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CriteriaGroup } from '../modules/criteria_groups/entities/criteria_group.entity';
import { Criterion } from '../modules/criteria/entities/criterion.entity';

/**
 * SV5T (Student of 5 Merits) Seeding Service
 * Populates criteria_groups and criteria tables with Vietnamese standards
 */
@Injectable()
export class SV5TSeederService {
  private readonly logger = new Logger(SV5TSeederService.name);

  constructor(
    @InjectRepository(CriteriaGroup)
    private readonly criteriaGroupsRepository: Repository<CriteriaGroup>,
    @InjectRepository(Criterion)
    private readonly criteriaRepository: Repository<Criterion>,
  ) {}

  /**
   * Seed SV5T Criteria Data
   * Run this once during application initialization
   */
  async seedSV5TCriteria(): Promise<void> {
    try {
      // Check if data already exists
      const existingGroupsCount = await this.criteriaGroupsRepository.count();
      if (existingGroupsCount > 0) {
        this.logger.log('SV5T criteria data already exists. Skipping seeding.');
        return;
      }

      this.logger.log('Starting SV5T criteria seeding...');

      // Define all criteria groups and their criteria
      const criteriaData = this.getSV5TCriteriaData();

      // Insert groups and criteria
      for (const groupData of criteriaData) {
        const group = await this.criteriaGroupsRepository.save({
          name: groupData.groupName,
          description: groupData.groupDescription,
          requiredCount: groupData.requiredCount,
        });

        this.logger.log(`Created group: "${group.name}" (ID: ${group.id})`);

        // Create criteria for this group
        for (const criterion of groupData.criteria) {
          await this.criteriaRepository.save({
            groupId: group.id,
            code: criterion.code,
            name: criterion.name,
            description: criterion.description,
          });
          this.logger.log(`  - Created criterion: "${criterion.code}" - ${criterion.name}`);
        }
      }

      this.logger.log('✅ SV5T criteria seeding completed successfully!');
    } catch (error) {
      this.logger.error('Failed to seed SV5T criteria:', error.message);
      throw error;
    }
  }

  /**
   * Get SV5T Criteria Data Structure
   * Returns 5 groups with their respective criteria
   */
  private getSV5TCriteriaData() {
    return [
      {
        groupName: 'Đạo đức tốt',
        groupDescription: 'Tiêu chuẩn Đạo đức tốt - Đạt đủ 03 tiêu chuẩn',
        requiredCount: 3,
        criteria: [
          {
            code: '1.1',
            name: 'Điểm rèn luyện từ 80',
            description:
              'Điểm rèn luyện trung bình cộng của học kỳ 1 và 2 trong năm học đạt từ 80 điểm trở lên',
          },
          {
            code: '1.2',
            name: 'Không vi phạm pháp luật',
            description:
              'Không vi phạm pháp luật và các quy chế, nội quy của nhà trường, quy định của địa phương và cộng đồng',
          },
          {
            code: '1.3.1',
            name: 'Tham gia thi tìm hiểu KHXH',
            description:
              'Tham gia cuộc thi tìm hiểu về các môn khoa học chính trị, tư tưởng Hồ Chí Minh do đơn vị Đoàn - Hội cấp cơ sở và tương đương trở lên tổ chức',
          },
          {
            code: '1.3.2',
            name: 'Tham gia hoạt động giáo dục yêu nước',
            description:
              'Tham gia các hoạt động giáo dục lòng yêu nước, tinh thần tự hào dân tộc: tham quan di tích, bảo tàng, thăm mẹ Việt Nam Anh hùng, lễ thắp nến tri ân, v.v.',
          },
          {
            code: '1.3.3',
            name: 'Tham gia hoạt động giáo dục đạo đức',
            description:
              'Tham gia Đội Cờ đỏ, An ninh xung kích; tuyên truyền về pháp luật, phòng tránh các tệ nạn xã hội',
          },
        ],
      },
      {
        groupName: 'Học tập tốt',
        groupDescription: 'Tiêu chuẩn Học tập tốt - Điểm trung bình chung từ 3.0',
        requiredCount: 1,
        criteria: [
          {
            code: '2.0',
            name: 'Điểm trung bình chung từ 3.0',
            description:
              'Điểm trung bình chung của học kỳ 1 và 2 trong năm học đạt từ 3.0 trở lên. Số tín chỉ mỗi học kỳ >= 12 và không nợ học phần',
          },
        ],
      },
      {
        groupName: 'Thể lực tốt',
        groupDescription: 'Tiêu chuẩn Thể lực tốt - Đạt 01 trong 02 tiêu chuẩn',
        requiredCount: 1,
        criteria: [
          {
            code: '3.1',
            name: 'Học phần Giáo dục thể chất đạt B',
            description:
              'Trong năm học phải học ít nhất 01 học phần Giáo dục thể chất (có rèn luyện thể lực) và đạt điểm B trở lên',
          },
          {
            code: '3.2',
            name: 'Tham gia hoạt động rèn luyện thể lực',
            description:
              'Tham gia ít nhất 01 hoạt động rèn luyện thể lực (thể dục, thể thao, dân vũ) do đơn vị Đoàn - Hội cấp cơ sở trở lên tổ chức',
          },
        ],
      },
      {
        groupName: 'Tình nguyện tốt',
        groupDescription: 'Tiêu chuẩn Tình nguyện tốt - Đạt 01 trong 03 tiêu chuẩn',
        requiredCount: 1,
        criteria: [
          {
            code: '4.1',
            name: 'Được khen thưởng hoạt động tình nguyện',
            description:
              'Được các cấp Đảng, Đoàn, Hội, chính quyền khen thưởng trong hoạt động tình nguyện',
          },
          {
            code: '4.2',
            name: 'Tham gia 3 hoạt động tình nguyện',
            description:
              'Tham gia ít nhất 03 hoạt động tình nguyện được xác nhận từ đơn vị Đoàn - Hội cấp cơ sở',
          },
          {
            code: '4.3',
            name: 'Hiến máu tình nguyện',
            description: 'Tham gia ít nhất 02 lần hiến máu tình nguyện',
          },
        ],
      },
      {
        groupName: 'Hội nhập tốt',
        groupDescription:
          'Tiêu chuẩn Hội nhập tốt - Đạt 02 trong 03 tiêu chuẩn (Ngoại ngữ, Tin học, Kỹ năng)',
        requiredCount: 2,
        criteria: [
          {
            code: '5.1',
            name: 'Tiêu chuẩn Ngoại ngữ',
            description:
              'Khen thưởng thi ngoại ngữ, chứng chỉ ngoại ngữ, hoàn thành học phần ngoại ngữ, hoặc điểm TB ngoại ngữ >= 3.2',
          },
          {
            code: '5.2',
            name: 'Tiêu chuẩn Tin học',
            description:
              'Chứng chỉ tin học (IC3, MOS), học phần tin học đạt B trở lên, tham gia cuộc thi tin học, hoặc điểm TB tin học >= 3.0',
          },
          {
            code: '5.3',
            name: 'Tiêu chuẩn Kỹ năng hội nhập',
            description:
              'Tham gia 2 hoạt động hội nhập, được khen thưởng, tham gia khóa huấn luyện kỹ năng, hoặc đạt B trong học phần kỹ năng',
          },
        ],
      },
    ];
  }
}
