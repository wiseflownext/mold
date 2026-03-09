import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from './customer.service';

@ApiTags('客户产品')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('customers')
export class CustomerController {
  constructor(private svc: CustomerService) {}

  @Get()
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.update(id, body); }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.delete(id); }

  @Get('products/all')
  findAllProducts(@Query('customerId') cid?: string, @Query('name') name?: string) {
    return this.svc.findAllProducts({ customerId: cid ? +cid : undefined, name });
  }

  @Post('products')
  createProduct(@Body() body: any) { return this.svc.createProduct(body); }

  @Put('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateProduct(id, body); }

  @Delete('products/:id')
  removeProduct(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteProduct(id); }
}
