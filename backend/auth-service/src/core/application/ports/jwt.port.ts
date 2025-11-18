import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtServicePort {
  constructor(private readonly jwt: JwtService) {}

  sign(payload: any) {
    return this.jwt.sign(payload)
  }

  verify(token: string) {
    try {
      return this.jwt.verify(token)
    } catch {
      return null
    }
  }
}
