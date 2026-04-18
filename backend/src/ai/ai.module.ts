import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module.js';
import { WebsocketModule } from '../websocket/websocket.module.js';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

@Module({
  imports: [FilesModule, WebsocketModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
