import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MoldService } from './mold.service';

@ApiTags('模具')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('molds')
export class MoldController {
  constructor(private moldService: MoldService) {}

  @Get('stats')
  getStats() {
    return this.moldService.getStats();
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('moldNo') moldNo?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('location') location?: string,
    @Query('customerId') customerId?: string,
    @Query('productName') productName?: string,
    @Query('partNo') partNo?: string,
    @Query('lifeRateMin') lifeRateMin?: string,
    @Query('lifeRateMax') lifeRateMax?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.moldService.findAll({
      page: page ? +page : undefined,
      pageSize: pageSize ? +pageSize : undefined,
      moldNo, type, status, location,
      customerId: customerId ? +customerId : undefined,
      productName, partNo,
      lifeRateMin: lifeRateMin ? +lifeRateMin : undefined,
      lifeRateMax: lifeRateMax ? +lifeRateMax : undefined,
      sortBy, sortOrder,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moldService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.moldService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.moldService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moldService.softDelete(id);
  }
}
