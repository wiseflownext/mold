import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DictService } from './dict.service';

@ApiTags('数据字典')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dict')
export class DictController {
  constructor(private svc: DictService) {}

  @Get()
  findAll() { return this.svc.findAll(); }

  @Get(':code')
  findByCode(@Param('code') code: string) { return this.svc.findByCode(code); }
}
