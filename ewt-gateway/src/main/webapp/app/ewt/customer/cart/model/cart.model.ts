import {ICartItem} from "./cart-item.model";

export interface ICart {
  uuid: string;
  items: ICartItem[];
}
