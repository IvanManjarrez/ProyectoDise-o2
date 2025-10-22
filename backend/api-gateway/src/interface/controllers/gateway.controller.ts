import { Controller, All, Req, Res, HttpStatus } from '@nestjs/common'
import axios, { AxiosRequestConfig } from 'axios'
import { Request, Response } from 'express'

@Controller()
export class GatewayController {
  private async proxy(req: Request, res: Response) {
    try {
      const url = `http://localhost:3001${req.url}`
      const headers = { ...req.headers }
      // remove host header to avoid mismatch
      delete (headers as any).host
      const method = req.method.toLowerCase()
      const data = req.body

      const cfg: AxiosRequestConfig = {
        url,
        method: method as any,
        headers,
        data,
        responseType: 'stream',
        validateStatus: () => true,
      }

      const response = await axios.request(cfg)
      res.status(response.status)
      if (response.data && typeof (response.data as any).pipe === 'function') {
        ;(response.data as any).pipe(res)
      } else {
        res.send(response.data)
      }
    } catch (err: any) {
      const status = err?.response?.status || HttpStatus.BAD_GATEWAY
      const message = err?.message || 'Gateway error'
      res.status(status).json({ message })
    }
  }

  @All('auth/*')
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res)
  }

  @All('users/*')
  async proxyUsers(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res)
  }
}