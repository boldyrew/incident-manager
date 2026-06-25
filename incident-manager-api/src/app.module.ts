import { Module } from '@nestjs/common';
import { IncidentsModule } from './incidents/incidents.module';
import { TicketModule } from './ticket/ticket.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TenantsModule } from './tenants/tenants.module';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    AuthModule,
    IncidentsModule,
    TicketModule,
    UsersModule,
    DashboardModule,
    TenantsModule,
    HealthModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
