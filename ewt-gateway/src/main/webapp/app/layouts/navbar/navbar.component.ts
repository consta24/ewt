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
import {CartDrawerService} from "../../ewt/customer/cart/service/cart-drawer.service";
import {CartService} from "../../ewt/customer/cart/service/cart.service";

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
  cartQuantity = 0;


  constructor(
    private router: Router,
    private loginService: LoginService,
    private translateService: TranslateService,
    private stateStorageService: StateStorageService,
    private accountService: AccountService,
    private profileService: ProfileService,
    private cartDrawerService: CartDrawerService,
    private cartService: CartService
  ) {
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    }
  }

  ngOnInit(): void {
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction = profileInfo.inProduction;
      this.openAPIEnabled = profileInfo.openAPIEnabled;
    });

    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });

    this.cartService.cartQuantity.subscribe(
      cartQuantity => this.cartQuantity = cartQuantity
    );
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
    this.cartDrawerService.toggleCart();
    this.toggleNavbar();
  }
}
