import {Injectable} from '@angular/core';
import {CookieService} from './cookie.service';
import {v4 as uuidv4} from 'uuid';

export interface ICartItem {
  sku: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartCookieService {

  constructor(private cookieService: CookieService) {
  }

  private getGuestUUID(): string {
    let guestUUID = this.cookieService.get('guestUUID');
    if (!guestUUID) {
      guestUUID = uuidv4();
      this.cookieService.set('guestUUID', guestUUID, 365);
    }
    return guestUUID;
  }

  public addToCart(sku: string, quantity: number): void {
    this.getGuestUUID();
    const cart = this.getCart();
    const existingItem = cart.find(item => item.sku === sku);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({sku, quantity});
    }
    this.setCart(cart);
  }

  public removeFromCart(sku: string): void {
    const cart = this.getCart();
    const updatedCart = cart.filter(item => item.sku !== sku);
    this.setCart(updatedCart);
  }

  public getCart(): ICartItem[] {
    const existingCart = this.cookieService.get('cart');
    return existingCart ? JSON.parse(existingCart) : [];
  }

  public setCart(cart: ICartItem[]): void {
    this.cookieService.set('cart', JSON.stringify(cart), 7);  // Store for 7 days
  }

  public getTotalQuantity(): number {
    const cart = this.getCart();
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }

  public updateQuantityInCart(sku: string, newQuantity: number): boolean {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.sku === sku);

    if (existingItem) {
      existingItem.quantity = newQuantity;
      this.setCart(cart);
      return true;
    }
    return false;
  }
}
