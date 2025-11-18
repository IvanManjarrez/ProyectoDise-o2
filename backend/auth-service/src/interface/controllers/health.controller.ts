import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Verifica que el servicio de autenticación esté funcionando correctamente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Servicio saludable',
    schema: {
      example: { status: 'ok' }
    }
  })
  health() {
    return { status: 'ok' }
  }
}
