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
import { SetPriorityDto } from './dto/set-priority.dto';
import { SetStatusDto } from './dto/set-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { UpdateDescriptionDto } from './dto/update-description.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
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
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
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
    return this.ticketService.assign(id, dto.userId, user);
  }

  @Patch(':id/link-incident')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  linkIncident(
    @Param('id') id: string,
    @Body() dto: LinkIncidentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketService.linkIncident(id, dto.incidentId, user);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  setStatus(
    @Param('id') id: string,
    @Body() dto: SetStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketService.setStatus(id, dto.status, user);
  }

  @Patch(':id/priority')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  setPriority(
    @Param('id') id: string,
    @Body() dto: SetPriorityDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketService.setPriority(id, dto.priority, user);
  }

  @Patch(':id/title')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  updateTitle(
    @Param('id') id: string,
    @Body() dto: UpdateTitleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketService.updateTitle(id, dto.title, user);
  }

  @Patch(':id/description')
  @Roles('ADMIN', 'ANALYST')
  @UseGuards(RolesGuard)
  updateDescription(
    @Param('id') id: string,
    @Body() dto: UpdateDescriptionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketService.updateDescription(id, dto.description, user);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketService.addComment(id, dto.body, user);
  }
}
