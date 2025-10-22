import { Controller, Get, Param, Post, Body, Delete, Req, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { MongoUserRepository } from '../../core/infrastructure/repositories/mongo-user.repository'
import { JwtAuthGuard } from '../../core/application/ports/jwt-auth.guard'
import { FavoriteDto } from '../../core/application/dto/favorite.dto'

@Controller('users')
export class UsersController {
  constructor(@Inject('UserRepository') private readonly repo: any) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    const payload = req.user
    const u = await this.repo.findById(payload.id)
    return { id: u?.id, email: u?.email, name: u?.name, favorites: u?.favorites }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorites')
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
