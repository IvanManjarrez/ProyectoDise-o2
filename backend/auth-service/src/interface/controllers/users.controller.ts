import { Controller, Get, Param, Post, Body, Delete, Req, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger'
import { MongoUserRepository } from '../../core/infrastructure/repositories/mongo-user.repository'
import { JwtAuthGuard } from '../../core/application/ports/jwt-auth.guard'
import { FavoriteDto } from '../../core/application/dto/favorite.dto'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(@Inject('UserRepository') private readonly repo: any) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Retorna la información del perfil del usuario actual incluyendo sus obras favoritas. Requiere token JWT.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario',
    schema: {
      example: {
        id: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa',
        email: 'user@example.com',
        name: 'John Doe',
        favorites: ['artwork-123', 'artwork-456']
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente' })
  async me(@Request() req: any) {
    const payload = req.user
    const u = await this.repo.findById(payload.id)
    return { id: u?.id, email: u?.email, name: u?.name, favorites: u?.favorites }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorites')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Añadir obra a favoritos',
    description: 'Añade una obra de arte a la lista de favoritos del usuario. Solo puedes modificar tus propios favoritos.'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa' })
  @ApiBody({ type: FavoriteDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Favorito añadido exitosamente',
    schema: {
      example: {
        favorites: ['artwork-123', 'artwork-456', 'artwork-789']
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Intentas modificar otro usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async addFavorite(@Param('id') id: string, @Body() body: FavoriteDto, @Request() req: any) {
    const requesterId = req.user?.id
  if (requesterId !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    const user = await this.repo.findById(id)
  if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    const favs = new Set(user.favorites)
    favs.add(body.artworkId)
    const updated = await this.repo.update(id, { favorites: Array.from(favs) })
  if (!updated) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    return { favorites: updated.favorites }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorites')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar obra de favoritos',
    description: 'Elimina una obra de arte de la lista de favoritos del usuario. Solo puedes modificar tus propios favoritos.'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa' })
  @ApiBody({ type: FavoriteDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Favorito eliminado exitosamente',
    schema: {
      example: {
        favorites: ['artwork-123']
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Intentas modificar otro usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async removeFavorite(@Param('id') id: string, @Body() body: FavoriteDto, @Request() req: any) {
    const requesterId = req.user?.id
  if (requesterId !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
  const user = await this.repo.findById(id)
  if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    const favs = user.favorites.filter((f) => f !== body.artworkId)
    const updated = await this.repo.update(id, { favorites: favs })
  if (!updated) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
  return { favorites: updated.favorites }
  }
}
