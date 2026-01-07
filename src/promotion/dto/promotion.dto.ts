export class CreatePromotionDto {
  code: string;
  type: string;
  value: number;
  target: string;
  usedCount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  minCartValue: number;
  userLimit: number;
  isActive: boolean;
}

export class AssignPromotionDto {
  discountId: number;
  bookId: number;
}
