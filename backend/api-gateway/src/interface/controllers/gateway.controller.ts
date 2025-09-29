import { Controller, Get, Post, All, Param, Headers, Body, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class GatewayController {
    
    @Get('health')
    healthCheck() {
        return { status: 'OK', service: 'API Gateway' };
    }

    // TODO: Implement gateway routing logic
    @All('*')
    async routeRequest(
        @Req() req: Request,
        @Res() res: Response,
        @Headers() headers: any,
        @Body() body: any,
    ) {
        // TODO: Implement request routing to appropriate services
        return res.status(501).json({ 
            message: 'Gateway routing not implemented yet',
            path: req.path,
            method: req.method 
        });
    }
}