import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { JwtServicePort } from '../ports/jwt.port'

@Injectable()
export class LoginUseCase {
  constructor(@Inject('UserRepository') private readonly repo: any, private readonly jwt: JwtServicePort) {}

  async execute(email: string, password: string) {
    const user = await this.repo.findByEmail(email)
  if (!user) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
    const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
    const token = this.jwt.sign({ sub: user.id, email: user.email })
    return { token, user: { id: user.id, email: user.email, name: user.name } }
  }
}
