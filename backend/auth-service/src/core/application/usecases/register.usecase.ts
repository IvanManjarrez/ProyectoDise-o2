import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { User } from '../../domain/entities/user.entity'

@Injectable()
export class RegisterUseCase {
  constructor(@Inject('UserRepository') private readonly repo: any) {}

  async execute(email: string, password: string, name?: string) {
  const exists = await this.repo.findByEmail(email)
  if (exists) throw new HttpException('Email already in use', HttpStatus.CONFLICT)
    const hash = await bcrypt.hash(password, 10)
    const user = await this.repo.create({ email, passwordHash: hash, name })
    return { id: user.id, email: user.email, name: user.name }
  }
}
