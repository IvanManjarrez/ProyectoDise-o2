import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AuthLoginDto {
  @ApiProperty({
    description: 'Email del usuario registrado',
    example: 'user@artgallery.com',
    format: 'email'
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'SecurePassword123',
    minLength: 6
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string
}
