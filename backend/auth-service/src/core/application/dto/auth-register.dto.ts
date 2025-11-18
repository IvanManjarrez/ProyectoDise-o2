import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class AuthRegisterDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsNotEmpty()
  name: string
}
