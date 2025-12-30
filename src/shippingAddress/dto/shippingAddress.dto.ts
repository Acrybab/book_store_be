export class CreateShippingAddressDto {
  userId: number;
  address: string;
  phoneNumber?: string;
}
export class UpdateShippingAddressDto {
  address: string;
  phoneNumber?: string;
}
