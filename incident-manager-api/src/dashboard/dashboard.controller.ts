import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query('tenantId') tenantId?: string,
  ) {
    const scopedTenantId = user.role === 'CLIENT_USER' ? user.tenantId ?? undefined : tenantId;
    return this.dashboardService.getStats(scopedTenantId);
  }

  @Get('recent-incidents')
  getRecentIncidents(
    @CurrentUser() user: AuthenticatedUser,
    @Query('tenantId') tenantId?: string,
  ) {
    const scopedTenantId = user.role === 'CLIENT_USER' ? user.tenantId ?? undefined : tenantId;
    return this.dashboardService.getRecentIncidents(scopedTenantId);
  }
}
