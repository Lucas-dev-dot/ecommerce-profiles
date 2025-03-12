import { Decimal } from 'decimal.js';

export type product_type = 'PROFILE' | 'PROXY';

export interface CartItem {
  id: number;
  name: string;
  price: Decimal;
  quantity: number;
  description?: string | null;
  type: product_type;
}
