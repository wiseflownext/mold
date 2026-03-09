import { Module } from '@nestjs/common';
import { MoldController } from './mold.controller';
import { MoldService } from './mold.service';

@Module({
  controllers: [MoldController],
  providers: [MoldService],
  exports: [MoldService],
})
export class MoldModule {}
