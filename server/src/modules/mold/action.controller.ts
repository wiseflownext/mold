import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ActionService } from './action.service';

@ApiTags('模具操作')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('molds')
export class ActionController {
  constructor(private svc: ActionService) {}

  @Post('record-usage')
  recordUsage(@Req() req: any, @Body() body: any) {
    return this.svc.recordUsage(req.user.sub, body);
  }

  @Post('borrow')
  borrow(@Req() req: any, @Body() body: any) {
    return this.svc.borrow(req.user.sub, body);
  }

  @Post('return')
  returnMold(@Req() req: any, @Body() body: any) {
    return this.svc.returnMold(req.user.sub, body);
  }

  @Post('report-repair')
  reportRepair(@Req() req: any, @Body() body: any) {
    return this.svc.reportRepair(req.user.sub, body);
  }
}
