import { Controller, Get, Put, Param, Query, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AlertService } from './alert.service';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class AlertController {
  constructor(private svc: AlertService) {}

  @Get('alerts')
  getAlerts(@Query() query: any) { return this.svc.getAlerts(query); }

  @Put('alerts/:id/handle')
  handleAlert(@Param('id', ParseIntPipe) id: number, @Req() req: any) { return this.svc.handleAlert(id, req.user.sub); }

  @Get('alert-rules')
  getRules() { return this.svc.getRules(); }

  @Put('alert-rules/:id')
  updateRule(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateRule(id, body); }
}
