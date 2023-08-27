import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ApplicationConfigService} from "../../../../core/config/application-config.service";
import {MSVC_CART} from "../../../../config/msvc.constants";
import {CookieService} from "../../../../shared/cookie/cookie.service";
import {v4} from "uuid";
import {ICartItem} from "../model/cart-item.model";
import {BehaviorSubject} from "rxjs";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartUrl = this.applicationConfigService.getEndpointFor('api/cart', MSVC_CART)

  private cartQuantitySubject = new BehaviorSubject<number>(0);
  cartQuantity = this.cartQuantitySubject.asObservable();

  constructor(private applicationConfigService: ApplicationConfigService, private httpClient: HttpClient, private cookieService: CookieService) {
  }

  public getCart() {
    const headers = new HttpHeaders().set('guestUuid', this.getGuestUUID());
    return this.httpClient.get<ICartItem[]>(`${this.cartUrl}`, {headers});
  }

  public getCartQuantity() {
    const headers = new HttpHeaders().set('guestUuid', this.getGuestUUID());
    this.httpClient.get<number>(`${this.cartUrl}/total-quantity`, {headers}).subscribe(
      {
        next: (cartQuantity) => {
          this.cartQuantitySubject.next(cartQuantity);
        }
      }
    )
  }

  public addToCart(sku: string, quantity: number) {
    const headers = new HttpHeaders().set('guestUuid', this.getGuestUUID());
    return this.httpClient.post<void>(`${this.cartUrl}`, {sku, quantity}, {headers}).pipe(
      tap(() => this.getCartQuantity())
    );
  }

  public removeFromCart(sku: string) {
    const headers = new HttpHeaders().set('guestUuid', this.getGuestUUID());
    return this.httpClient.delete<void>(`${this.cartUrl}/${sku}`, {headers}).pipe(
      tap(() => this.getCartQuantity())
    );
  }

  public updateQuantityInCart(sku: string, quantity: number) {
    const headers = new HttpHeaders().set('guestUuid', this.getGuestUUID());
    return this.httpClient.put<void>(`${this.cartUrl}`, {sku, quantity}, {headers}).pipe(
      tap(() => this.getCartQuantity())
    );
  }

  private getGuestUUID(): string {
    let guestUUID = this.cookieService.get('guestUUID');
    if (!guestUUID) {
      guestUUID = v4();
      this.cookieService.set('guestUUID', guestUUID, 365);
    }
    return guestUUID;
  }
}
