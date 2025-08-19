import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CasesController } from './cases.controller'
import { CasesService } from './cases.service'
import { CaseRecord } from './entities/case-record.entity'
import { CaseFile } from './entities/case-file.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CaseRecord, CaseFile])],
  controllers: [CasesController],
  providers: [CasesService],
})
export class CasesModule {}

