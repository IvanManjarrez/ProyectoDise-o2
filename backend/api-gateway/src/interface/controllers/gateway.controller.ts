import { Controller, All, Req, Res, HttpStatus } from '@nestjs/common'
import axios, { AxiosRequestConfig } from 'axios'
import { Request, Response } from 'express'

@Controller()
export class GatewayController {
  private async proxy(req: Request, res: Response) {
    try {
  const base = process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
  const url = `${base}${req.url}`
  const headers = { ...req.headers }
  // remove host header to avoid mismatch
  delete (headers as any).host
  // let axios compute content-length; remove incoming content-length if present
  delete (headers as any)['content-length']
  const method = req.method.toLowerCase()
  // ensure JSON bodies are forwarded as raw JSON strings
  const contentType = (headers as any)['content-type'] || ''
  const data = contentType.toString().includes('application/json') ? JSON.stringify(req.body) : req.body

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