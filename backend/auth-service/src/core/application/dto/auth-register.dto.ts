import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AuthRegisterDto {
  @ApiProperty({
    description: 'Email del usuario (debe ser único)',
    example: 'user@artgallery.com',
    format: 'email'
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'SecurePassword123',
    minLength: 6
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'John Doe'
  })
  @IsNotEmpty()
  name: string
}
