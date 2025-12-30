export class CreateShippingAddressDto {
  userId: number;
  address: string;
  phoneNumber?: string;
}
export class UpdateShippingAddressDto {
  addressId: number;
  address: string;
  phoneNumber?: string;
}
