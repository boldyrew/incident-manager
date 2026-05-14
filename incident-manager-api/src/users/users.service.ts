import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAllAnalysts() {
    return this.usersRepository.findByUserRole('ANALYST');
  }
}
