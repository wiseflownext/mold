import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { MoldModule } from './modules/mold/mold.module';
import { CustomerModule } from './modules/customer/customer.module';
import { DictModule } from './modules/dict/dict.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UploadModule,
    MoldModule,
    CustomerModule,
    DictModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
