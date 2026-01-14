import { Injectable } from '@nestjs/common';
import { CreateUnitTenureDto } from './dto/create-unit_tenure.dto';
import { UpdateUnitTenureDto } from './dto/update-unit_tenure.dto';

@Injectable()
export class UnitTenuresService {
  create(createUnitTenureDto: CreateUnitTenureDto) {
    return 'This action adds a new unitTenure';
  }

  findAll() {
    return `This action returns all unitTenures`;
  }

  findOne(id: number) {
    return `This action returns a #${id} unitTenure`;
  }

  update(id: number, updateUnitTenureDto: UpdateUnitTenureDto) {
    return `This action updates a #${id} unitTenure`;
  }

  remove(id: number) {
    return `This action removes a #${id} unitTenure`;
  }
}
