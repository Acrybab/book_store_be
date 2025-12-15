import { Module } from '@nestjs/common';
import { ReplyController } from './controller/reply.controller';
import { ReplyService } from './services/reply.services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reply } from './entities/reply.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Reply])],
  controllers: [ReplyController],
  providers: [ReplyService],
  exports: [],
})
export class ReplyModule {}
