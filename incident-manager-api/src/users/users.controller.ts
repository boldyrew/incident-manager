import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('analysts')
  async findAllAnalysts(): Promise<User[]> {
    return this.usersService.findAllAnalysts();
  }
}
