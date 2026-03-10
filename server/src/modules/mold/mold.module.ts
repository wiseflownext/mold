import { Module } from '@nestjs/common';
import { MoldController } from './mold.controller';
import { MoldService } from './mold.service';
import { ActionController } from './action.controller';
import { ActionService } from './action.service';

@Module({
  controllers: [MoldController, ActionController],
  providers: [MoldService, ActionService],
  exports: [MoldService],
})
export class MoldModule {}
