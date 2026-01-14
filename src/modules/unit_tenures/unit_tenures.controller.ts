import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnitTenuresService } from './unit_tenures.service';
import { CreateUnitTenureDto } from './dto/create-unit_tenure.dto';
import { UpdateUnitTenureDto } from './dto/update-unit_tenure.dto';

@Controller('unit-tenures')
export class UnitTenuresController {
  constructor(private readonly unitTenuresService: UnitTenuresService) {}

  @Post()
  create(@Body() createUnitTenureDto: CreateUnitTenureDto) {
    return this.unitTenuresService.create(createUnitTenureDto);
  }

  @Get()
  findAll() {
    return this.unitTenuresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitTenuresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnitTenureDto: UpdateUnitTenureDto) {
    return this.unitTenuresService.update(+id, updateUnitTenureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitTenuresService.remove(+id);
  }
}
