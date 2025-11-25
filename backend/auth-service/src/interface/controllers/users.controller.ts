import { Controller, Get, Param, Post, Body, Delete, Req, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger'
import { MongoUserRepository } from '../../core/infrastructure/repositories/mongo-user.repository'
import { JwtAuthGuard } from '../../core/application/ports/jwt-auth.guard'
import { FavoriteDto } from '../../core/application/dto/favorite.dto'
import { SearchHistoryDto } from '../../core/application/dto/search-history.dto'

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

  @UseGuards(JwtAuthGuard)
  @Get(':id/favorites')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar favoritos del usuario',
    description: 'Retorna la lista de IDs de obras favoritas del usuario. Solo el propio usuario puede ver su lista.'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de favoritos',
    schema: { example: { favorites: ['artwork-123', 'artwork-456'] } }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Intentas ver otro usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async listFavorites(@Param('id') id: string, @Request() req: any) {
    const requesterId = req.user?.id
    if (requesterId !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    const user = await this.repo.findById(id)
    if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    return { favorites: user.favorites || [] }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/search-history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Añadir entrada al historial de búsqueda', description: 'Añade una entrada de búsqueda al historial del usuario. El historial se deduplica y se limita al máximo configurado.' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa' })
  @ApiBody({ type: SearchHistoryDto })
  @ApiResponse({ status: 201, description: 'Entrada añadida', schema: { example: { history: [{ query: 'monet', museums: 'harvard', limit: 10, ts: 1690000000000 }] } } })
  async addSearchHistory(@Param('id') id: string, @Body() body: SearchHistoryDto, @Request() req: any) {
    const requesterId = req.user?.id
    if (requesterId !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    if (!body?.query || typeof body.query !== 'string' || body.query.trim() === '') throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
    const user = await this.repo.findById(id)
    if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND)

    const maxEntries = parseInt(process.env.SEARCH_HISTORY_MAX || '50', 10)
    const entry = { query: body.query.trim(), museums: body.museums || undefined, limit: body.limit, ts: body.ts || Date.now() }

    // Dedupe: remove existing equal entries (by query + museums + limit)
    const existing = (user.searchHistory || []).filter((h: any) => !(h.query === entry.query && (h.museums || '') === (entry.museums || '') && (h.limit || 0) === (entry.limit || 0)))
    const newHistory = [entry, ...existing].slice(0, maxEntries)
    const updated = await this.repo.update(id, { searchHistory: newHistory })
    if (!updated) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    return { history: updated.searchHistory || [] }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/search-history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener historial de búsquedas del usuario', description: 'Retorna las entradas de historial más recientes del usuario.' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa' })
  @ApiResponse({ status: 200, description: 'Historial', schema: { example: { history: [{ query: 'monet', museums: 'harvard', limit: 10, ts: 1690000000000 }] } } })
  async getSearchHistory(@Param('id') id: string, @Request() req: any) {
    const requesterId = req.user?.id
    if (requesterId !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    const user = await this.repo.findById(id)
    if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    return { history: user.searchHistory || [] }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/search-history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Borrar historial de búsquedas del usuario', description: 'Borra todo el historial de búsquedas o entradas específicas si se provee array de indices.' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa' })
  @ApiBody({ schema: { example: { ids: [0, 1, 2] } }, required: false })
  async clearSearchHistory(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const requesterId = req.user?.id
    if (requesterId !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    const user = await this.repo.findById(id)
    if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    let newHistory: any[] = []
    if (body && Array.isArray(body.ids)) {
      // remove entries by index
      newHistory = (user.searchHistory || []).filter((_: any, idx: number) => !body.ids.includes(idx))
    } else {
      newHistory = []
    }
    const updated = await this.repo.update(id, { searchHistory: newHistory })
    if (!updated) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    return { history: updated.searchHistory || [] }
  }
}
