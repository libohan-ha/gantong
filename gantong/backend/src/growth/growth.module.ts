import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentGrowthController } from './parent-growth.controller';
import { GrowthService } from './growth.service';
import { Child } from './entities/child.entity';
import { GrowthProfile } from './entities/growth-profile.entity';
import { HealthRecord } from './entities/health-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Child, GrowthProfile, HealthRecord])],
  controllers: [ParentGrowthController],
  providers: [GrowthService],
})
export class GrowthModule {}
