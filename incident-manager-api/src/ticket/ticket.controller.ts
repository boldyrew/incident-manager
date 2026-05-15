import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { LinkIncidentDto } from './dto/link-incident.dto';
import { SetStatusDto } from './dto/set-status.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: AuthenticatedUser) {
    return this.ticketService.create(createTicketDto, user);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return await this.ticketService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketService.update(id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }

  @Patch(':id/assign')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  assign(
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketService.assign(id, dto.userId);
  }

  @Patch(':id/link-incident')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  linkIncident(
    @Param('id') id: string,
    @Body() dto: LinkIncidentDto,
  ) {
    return this.ticketService.linkIncident(id, dto.incidentId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  setStatus(@Param('id') id: string, @Body() dto: SetStatusDto) {
    return this.ticketService.setStatus(id, dto.status);
  }
}
