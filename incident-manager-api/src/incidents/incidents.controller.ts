import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AssignIncidentDto } from './dto/assign-incident.dto';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() dto: CreateIncidentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.incidentsService.create(dto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('severity') severity?: IncidentSeverity,
    @Query('status') status?: IncidentStatus,
    @Query('search') search?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    if (user.role === 'CLIENT_USER' && tenantId) {
      throw new BadRequestException('Tenant ID is not allowed');
    }
    return this.incidentsService.findAll({ severity, status, search, tenantId }, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.incidentsService.update(id, dto);
  }

  @Patch(':id/assign')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  assign(@Param('id') id: string, @Body() dto: AssignIncidentDto) {
    return this.incidentsService.assign(id, dto.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
}
