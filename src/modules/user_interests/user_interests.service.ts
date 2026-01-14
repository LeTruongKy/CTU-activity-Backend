import { Injectable } from '@nestjs/common';
import { CreateUserInterestDto } from './dto/create-user_interest.dto';
import { UpdateUserInterestDto } from './dto/update-user_interest.dto';

@Injectable()
export class UserInterestsService {
  create(createUserInterestDto: CreateUserInterestDto) {
    return 'This action adds a new userInterest';
  }

  findAll() {
    return `This action returns all userInterests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userInterest`;
  }

  update(id: number, updateUserInterestDto: UpdateUserInterestDto) {
    return `This action updates a #${id} userInterest`;
  }

  remove(id: number) {
    return `This action removes a #${id} userInterest`;
  }
}
