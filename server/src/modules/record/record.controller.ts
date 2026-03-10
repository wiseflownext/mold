import { Controller, Get, Post, Put, Param, Query, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecordService } from './record.service';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class RecordController {
  constructor(private svc: RecordService) {}

  @Get('usage-records')
  getUsageRecords(@Query() query: any) { return this.svc.getUsageRecords(query); }

  @Get('borrow-records')
  getBorrowRecords(@Query() query: any) { return this.svc.getBorrowRecords(query); }

  @Get('borrow-records/distribution')
  getBorrowDistribution() { return this.svc.getBorrowDistribution(); }

  @Get('maintenance-records')
  getMaintenanceRecords(@Query() query: any) { return this.svc.getMaintenanceRecords(query); }

  @Post('maintenance-records')
  createMaintenance(@Req() req: any, @Body() body: any) { return this.svc.createMaintenance(req.user.sub, body); }

  @Get('maintenance-records/plan')
  getMaintenancePlan() { return this.svc.getMaintenancePlan(); }

  @Get('repair-orders')
  getRepairOrders(@Query() query: any) { return this.svc.getRepairOrders(query); }

  @Put('repair-orders/:id')
  updateRepairOrder(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateRepairOrder(id, body); }

  @Get('repair-orders/stats')
  getRepairStats() { return this.svc.getRepairStats(); }

  @Get('inspections')
  getInspections(@Query() query: any) { return this.svc.getInspections(query); }

  @Post('inspections')
  createInspection(@Req() req: any, @Body() body: any) { return this.svc.createInspection(req.user.sub, body); }
}
