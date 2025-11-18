import { Injectable } from '@nestjs/common'
import { User } from '../../domain/entities/user.entity'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class InMemoryUserRepository {
  private users: Map<string, User> = new Map()

  async create(user: Partial<User>): Promise<User> {
    const id = uuidv4()
    const created: User = {
      id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name || '',
      favorites: user.favorites || []
    }
    this.users.set(id, created)
    return created
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.email === email) return u
    }
    return null
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async update(id: string, update: Partial<User>): Promise<User | null> {
    const existing = this.users.get(id)
    if (!existing) return null
    const merged: User = {
      ...existing,
      ...update,
      id: existing.id
    }
    this.users.set(id, merged)
    return merged
  }
}
