export interface Pedido {
  id: string;
  customerId: string;
  number: string;
  purchaseDate: string;
  totalAmount: number;
  currency: string;
  products: Producto[];
}

import { Producto } from './producto.model';
