import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from '../../domain/entities/user.entity'

@Injectable()
export class MongoUserRepository {
  constructor(@InjectModel('User') private userModel: Model<any>) {}

  async create(user: Partial<User>): Promise<User> {
    const created: any = await this.userModel.create(user)
    return { id: created._id.toString(), email: created.email, passwordHash: created.passwordHash, name: created.name, favorites: created.favorites || [] }
  }

  async findByEmail(email: string): Promise<User | null> {
    const u: any = await this.userModel.findOne({ email }).lean()
    if (!u) return null
    return { id: u._id.toString(), email: u.email, passwordHash: u.passwordHash, name: u.name, favorites: u.favorites || [] }
  }

  async findById(id: string): Promise<User | null> {
    const u: any = await this.userModel.findById(id).lean()
    if (!u) return null
    return { id: u._id.toString(), email: u.email, passwordHash: u.passwordHash, name: u.name, favorites: u.favorites || [] }
  }

  async update(id: string, update: Partial<User>): Promise<User> {
    const u: any = await this.userModel.findByIdAndUpdate(id, update, { new: true }).lean()
    if (!u) return null
    return { id: u._id.toString(), email: u.email, passwordHash: u.passwordHash, name: u.name, favorites: u.favorites || [] }
  }
}
