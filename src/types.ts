import { Decimal } from 'decimal.js';

export type ProductType = 'PROFILE' | 'PROXY';

export interface CartItem {
  id: number;
  name: string;
  price: Decimal;
  quantity: number;
  description?: string | null;
  type?: ProductType;
}
