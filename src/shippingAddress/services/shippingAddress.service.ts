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

  async createShippingAddress(userId: number, address: string, phoneNumber?: string) {
    const shippingAddress = this.shippingAddressRepository.create({
      shippingAddress: address,
      userId: userId,
      phoneNumber: phoneNumber,
      isDefault: true,
    });
    return await this.shippingAddressRepository.save(shippingAddress);
  }
  async getShippingAddressesByUserId(userId: number) {
    return await this.shippingAddressRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async updateShippingAddress(addressId: number, address: string, phoneNumber?: string, userId?: number) {
    const shippingAddress = await this.shippingAddressRepository.findOne({ where: { id: addressId, userId: userId } });
    if (!shippingAddress) {
      throw new Error('Shipping address not found');
    }
    shippingAddress.shippingAddress = address;
    if (phoneNumber !== undefined) {
      shippingAddress.phoneNumber = phoneNumber;
    }
    return await this.shippingAddressRepository.save(shippingAddress);
  }

  async deleteShippingAddress(id: number) {
    const result = await this.shippingAddressRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Shipping address not found');
    }
    return { message: 'Shipping address deleted successfully' };
  }

  async setDefaultShippingAddress(userId: number, addressId: number) {
    // Đặt tất cả các địa chỉ giao hàng của người dùng thành không mặc định
    await this.shippingAddressRepository.update({ userId }, { isDefault: false });

    // Đặt địa chỉ giao hàng cụ thể thành mặc định
    const result = await this.shippingAddressRepository.update({ id: addressId, userId }, { isDefault: true });

    if (result.affected === 0) {
      throw new Error('Shipping address not found or does not belong to the user');
    }

    return { message: 'Default shipping address updated successfully' };
  }
}
