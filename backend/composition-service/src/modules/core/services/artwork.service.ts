import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artwork } from '../schemas/artwork.schema';

@Injectable()
export class ArtworkService {
  constructor(@InjectModel(Artwork.name) private artworkModel: Model<Artwork>) {}

  async findById(id: string): Promise<Artwork | null> {
    return this.artworkModel.findById(id).exec();
  }

  async search(query: string): Promise<Artwork[]> {
    return this.artworkModel.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).exec();
  }

  async create(artworkData: Partial<Artwork>): Promise<Artwork> {
    const artwork = new this.artworkModel(artworkData);
    return artwork.save();
  }

  async findBySource(source: string): Promise<Artwork[]> {
    return this.artworkModel.find({ source }).exec();
  }
}