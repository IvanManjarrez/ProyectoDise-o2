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
    description: 'Añade una obra de arte a la lista de favoritos del usuario con todos sus datos. Solo puedes modificar tus propios favoritos.'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa' })
  @ApiBody({ type: FavoriteDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Favorito añadido exitosamente',
    schema: {
      example: {
        favorites: [
          {
            artworkId: 'met_438003',
            title: 'The Starry Night',
            artist: 'Vincent van Gogh',
            imageUrl: 'https://example.com/image.jpg',
            museum: 'met',
            addedAt: 1234567890
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Intentas modificar otro usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async addFavorite(@Param('id') id: string, @Body() favoriteDto: FavoriteDto, @Request() req: any) {
    const requesterId = req.user?.id
    if (requesterId !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
    const user = await this.repo.findById(id)
    if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    
    let favoriteArtwork: any
    
    // Si no se proporciona título, intentar obtener datos del composition service
    if (!favoriteDto.title || favoriteDto.title === '') {
      try {
        // Extraer museo del artworkId (formato: "museo_id")
        const parts = favoriteDto.artworkId.split('_')
        const museum = parts[0]
        const artId = parts.slice(1).join('_') // Por si el ID tiene guiones bajos
        
        if (museum && artId) {
          // Llamar al composition service para obtener datos completos
          const compositionUrl = process.env.COMPOSITION_SERVICE_URL || 'http://composition-service:3002'
          const url = `${compositionUrl}/api/v1/composition/artworks/${artId}?museum=${museum}`
          
          console.log(`🔍 Buscando artwork en: ${url}`)
          const response = await fetch(url)
          
          if (response.ok) {
            const result = await response.json()
            // El composition service devuelve { success: true, data: {...} }
            const artworkData = result.data || result
            
            // Verificar que realmente tenga datos de la obra
            if (artworkData.title || artworkData.objectName) {
              favoriteArtwork = {
                artworkId: favoriteDto.artworkId,
                title: artworkData.title || artworkData.objectName || 'Sin título',
                artist: artworkData.artist || artworkData.artistDisplayName || undefined,
                imageUrl: artworkData.imageUrl || artworkData.primaryImage || undefined,
                museum: museum,
                description: artworkData.description || artworkData.medium || artworkData.objectName || undefined,
                year: artworkData.year || (artworkData.objectDate ? parseInt(artworkData.objectDate) : undefined),
                addedAt: Date.now()
              }
              
              console.log(`✅ Favorito enriquecido automáticamente: "${favoriteArtwork.title}" por ${favoriteArtwork.artist || 'artista desconocido'}`)
            } else {
              console.warn(`⚠️ Obra ${favoriteDto.artworkId} encontrada pero sin datos (posiblemente eliminada del museo)`)
              throw new Error('Artwork has no data')
            }
          } else {
            console.warn(`⚠️ Composition service respondió ${response.status} para ${url}`)
            throw new Error(`Artwork not found: ${response.status}`)
          }
        } else {
          console.warn(`⚠️ Formato de artworkId inválido: ${favoriteDto.artworkId}`)
          throw new Error('Invalid artworkId format')
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo enriquecer el favorito automáticamente:`, error.message)
        console.warn(`💡 Sugerencia: El frontend debería enviar los datos completos de la obra al añadir a favoritos`)
        
        // Fallback: guardar con datos mínimos pero indicar que faltan datos
        favoriteArtwork = {
          artworkId: favoriteDto.artworkId,
          title: favoriteDto.title || 'Obra no disponible',
          artist: favoriteDto.artist || undefined,
          imageUrl: favoriteDto.imageUrl || undefined,
          museum: favoriteDto.museum || favoriteDto.artworkId.split('_')[0] || 'unknown',
          description: 'Esta obra no está disponible actualmente. Intenta añadirla de nuevo desde la búsqueda.',
          year: favoriteDto.year || undefined,
          addedAt: Date.now()
        }
      }
    } else {
      // Si viene con título, usar los datos proporcionados
      favoriteArtwork = {
        artworkId: favoriteDto.artworkId,
        title: favoriteDto.title,
        artist: favoriteDto.artist,
        imageUrl: favoriteDto.imageUrl,
        museum: favoriteDto.museum || favoriteDto.artworkId.split('_')[0] || 'unknown',
        description: favoriteDto.description,
        year: favoriteDto.year,
        addedAt: Date.now()
      }
      
      console.log(`✅ Favorito guardado con datos del frontend: "${favoriteArtwork.title}"`)
    }
    
    // Evitar duplicados basados en artworkId
    const existingIds = new Set((user.favorites || []).map(f => f.artworkId))
    if (!existingIds.has(favoriteDto.artworkId)) {
      const newFavs = [...(user.favorites || []), favoriteArtwork]
      const updated = await this.repo.update(id, { favorites: newFavs })
      if (!updated) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
      return { favorites: updated.favorites }
    }
    
    return { favorites: user.favorites }
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
        favorites: []
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
    const favs = (user.favorites || []).filter((f) => f.artworkId !== body.artworkId)
    const updated = await this.repo.update(id, { favorites: favs })
    if (!updated) throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    return { favorites: updated.favorites }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/favorites')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar favoritos del usuario',
    description: 'Retorna la lista completa de obras favoritas del usuario con todos sus datos. Solo el propio usuario puede ver su lista.'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de favoritos con datos completos',
    schema: { 
      example: { 
        favorites: [
          {
            artworkId: 'met_438003',
            title: 'The Starry Night',
            artist: 'Vincent van Gogh',
            imageUrl: 'https://example.com/image.jpg',
            museum: 'met',
            description: 'Oil on canvas',
            year: 1889,
            addedAt: 1234567890
          }
        ] 
      } 
    }
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
