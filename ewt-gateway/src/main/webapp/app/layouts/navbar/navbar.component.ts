import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {StateStorageService} from 'app/core/auth/state-storage.service';
import {VERSION} from 'app/app.constants';
import {LANGUAGES} from 'app/config/language.constants';
import {Account} from 'app/core/auth/account.model';
import {AccountService} from 'app/core/auth/account.service';
import {LoginService} from 'app/login/login.service';
import {ProfileService} from 'app/layouts/profiles/profile.service';
import {EntityNavbarItems} from 'app/entities/entity-navbar-items';
import NavbarItem from './navbar-item.model';
import {CartService} from "../../ewt/customer/cart/service/cart.service";
import {CartCookieService} from "../../shared/cookie/cart-cookie.service";

@Component({
  selector: 'jhi-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  inProduction?: boolean;
  isNavbarCollapsed = true;
  languages = LANGUAGES;
  openAPIEnabled?: boolean;
  version = '';
  account: Account | null = null;
  entitiesNavbarItems: NavbarItem[] = [];

  constructor(
    private loginService: LoginService,
    private translateService: TranslateService,
    private stateStorageService: StateStorageService,
    private accountService: AccountService,
    private profileService: ProfileService,
    private cartService: CartService,
    private cartCookieService: CartCookieService,
    private router: Router
  ) {
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    }
  }

  ngOnInit(): void {
    this.entitiesNavbarItems = EntityNavbarItems;
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction = profileInfo.inProduction;
      this.openAPIEnabled = profileInfo.openAPIEnabled;
    });

    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });
  }

  changeLanguage(languageKey: string): void {
    this.stateStorageService.storeLocale(languageKey);
    this.translateService.use(languageKey);
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed = true;
  }

  login(): void {
    this.router.navigate(['/login']).then();
  }

  logout(): void {
    this.collapseNavbar();
    this.loginService.logout();
    this.router.navigate(['']).then();
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  openCart() {
    this.cartService.toggleCart();
    this.toggleNavbar();
  }

  getCartQuantity() {
    return this.cartCookieService.getTotalQuantity();
  }
}
