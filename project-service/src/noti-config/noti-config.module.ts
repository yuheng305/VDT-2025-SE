import { Module } from '@nestjs/common';
import { NotiConfigController } from './noti-config.controller';
import { NotiConfigService } from './noti-config.service';

@Module({
  controllers: [NotiConfigController],
  providers: [NotiConfigService]
})
export class NotiConfigModule {}
