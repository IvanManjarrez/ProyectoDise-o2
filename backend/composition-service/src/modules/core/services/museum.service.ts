import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Museum } from '../schemas/museum.schema';

@Injectable()
export class MuseumService {
  constructor(@InjectModel(Museum.name) private museumModel: Model<Museum>) {}

  async findAll(): Promise<Museum[]> {
    return this.museumModel.find({ isActive: true }).exec();
  }

  async findBySource(source: string): Promise<Museum | null> {
    return this.museumModel.findOne({ source, isActive: true }).exec();
  }

  async create(museumData: Partial<Museum>): Promise<Museum> {
    const museum = new this.museumModel(museumData);
    return museum.save();
  }
}