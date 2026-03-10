import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class UserController {
  constructor(private svc: UserService) {}

  @Get('users')
  getUsers(@Query() query: any) { return this.svc.getUsers(query); }

  @Post('users')
  createUser(@Body() body: any) { return this.svc.createUser(body); }

  @Put('users/:id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateUser(id, body); }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteUser(id); }

  @Get('roles')
  getRoles() { return this.svc.getRoles(); }

  @Post('roles')
  createRole(@Body() body: any) { return this.svc.createRole(body); }

  @Put('roles/:id')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateRole(id, body); }

  @Get('report')
  getReport() { return this.svc.getReport(); }
}
