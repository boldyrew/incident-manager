import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DemoLoginDto } from './dto/demo-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('demo')
  loginAsDemo(@Body() dto: DemoLoginDto) {
    if (process.env.DEMO_MODE_ENABLED !== 'true') {
      throw new NotFoundException();
    }
    return this.authService.loginAsDemo(dto.role);
  }
}
