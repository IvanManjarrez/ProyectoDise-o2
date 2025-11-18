import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class AuthLoginDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string
}
