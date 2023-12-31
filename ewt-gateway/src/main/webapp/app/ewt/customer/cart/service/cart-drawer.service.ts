import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartDrawerService {
  private cartToggleSubject = new Subject<void>();
  cartToggleAction$ = this.cartToggleSubject.asObservable();

  toggleCart() {
    this.cartToggleSubject.next();
  }
}
