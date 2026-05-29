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
import { SetStatusDto } from './dto/set-status.dto';
import { SetSeverityDto } from './dto/set-severity.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { UpdateDescriptionDto } from './dto/update-description.dto';

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
  assign(
    @Param('id') id: string,
    @Body() dto: AssignIncidentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.assign(id, dto.userId, user);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  setStatus(
    @Param('id') id: string,
    @Body() dto: SetStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.setStatus(id, dto.status, user);
  }

  @Patch(':id/severity')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  setSeverity(
    @Param('id') id: string,
    @Body() dto: SetSeverityDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.setSeverity(id, dto.severity, user);
  }

  @Patch(':id/title')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  updateTitle(
    @Param('id') id: string,
    @Body() dto: UpdateTitleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.updateTitle(id, dto.title, user);
  }

  @Patch(':id/description')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  updateDescription(
    @Param('id') id: string,
    @Body() dto: UpdateDescriptionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.updateDescription(id, dto.description, user);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.addComment(id, dto.body, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
}
