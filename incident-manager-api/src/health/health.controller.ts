import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  check() {
    return this.getHealthPayload();
  }

  @Get('health')
  checkHealth() {
    return this.getHealthPayload();
  }

  private getHealthPayload() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
