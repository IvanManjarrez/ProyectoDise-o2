import { Module } from '@nestjs/common';
import { CompositionController } from './composition.controller';
import { CompositionService } from './composition.service';
import { CoreModule } from '../core/core.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    CoreModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [CompositionController],
  providers: [CompositionService],
  exports: [CompositionService],
})
export class CompositionModule {}