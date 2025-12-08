import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ShippingAddress } from '../entities/shippingAddress.entity';
import { InjectRepository } from '@nestjs/typeorm';
// import { User } from 'src/core/users/user.entities';

@Injectable()
export class ShippingAddressService {
  constructor(
    @InjectRepository(ShippingAddress)
    private readonly shippingAddressRepository: Repository<ShippingAddress>,
  ) {}

  async createShippingAddress(userId: number, address: string) {
    const shippingAddress = this.shippingAddressRepository.create({
      shippingAddress: address,
      userId: userId,
    });
    return await this.shippingAddressRepository.save(shippingAddress);
  }
  async getShippingAddressesByUserId(userId: number) {
    return await this.shippingAddressRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }
}
