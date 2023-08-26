import {Component, OnDestroy, OnInit} from "@angular/core";
import {CartService} from "../service/cart.service";
import {forkJoin, Subscription, switchMap} from "rxjs";
import {CartCookieService} from "../../../../shared/cookie/cart-cookie.service";
import {ICartItem} from "../model/cart-item.model";
import {ProductService} from "../../../store-admin/product/service/product.service";
import {ProductImageService} from "../../../../shared/product/product-image.service";
import {IProduct} from "../../../store-admin/product/model/product.model";
import {IProductVariant} from "../../../store-admin/product/model/product-variant.model";
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";


@Component({
  selector: 'ewt-customer-cart-drawer',
  templateUrl: 'cart-drawer.component.html',
  styleUrls: ['cart-drawer.component.scss']
})
export class CartDrawerComponent implements OnDestroy {
  isLoading = true;
  isOpen = false;
  private subscription: Subscription;

  toggleCart() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isLoading = true;
      this.fetchCartItems();
    }
  }

  cartItems: ICartItem[] = [];
  variantsQuantityMap: Map<IProductVariant, number> = new Map();
  skuImagesMap: Map<string, string> = new Map();
  skuProductsMap: Map<string, IProduct> = new Map();
  subTotal: number = 0;

  constructor(private router: Router,
              private cartDrawerService: CartService,
              private cartCookieService: CartCookieService,
              private productService: ProductService,
              private productImageService: ProductImageService) {
    this.subscription = this.cartDrawerService.cartToggleAction$.subscribe(() => {
      this.toggleCart();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  fetchCartItems() {
    this.variantsQuantityMap.clear();
    this.skuImagesMap.clear();
    this.skuProductsMap.clear();
    this.cartItems = this.cartCookieService.getCart();

    if(!this.cartItems.length) {
      this.isLoading = false;
    }

    const cartObservables = this.cartItems.map(cartItem => {
      return this.productService.getProductVariant(cartItem.sku).pipe(
        switchMap((variant) => {
          this.variantsQuantityMap.set(variant, cartItem.quantity);
          return this.productService.getProduct(variant.productId).pipe(
            switchMap(product => {
              return this.productImageService.getImagesForSKU(variant.sku, product).pipe(
                tap(images => {
                  this.skuImagesMap.set(variant.sku, images[0]);
                  this.skuProductsMap.set(variant.sku, product);
                })
              )
            })
          );
        })
      );
    });

    forkJoin(cartObservables).subscribe(() => {
      this.calculateSubTotal();
      this.isLoading = false;
    });
  }

  calculateSubTotal() {
    this.subTotal = 0;
    this.variantsQuantityMap.forEach((value, key) => {
      this.subTotal += key.price * value;
    })
  }

  formatProductVariantName(variant: IProductVariant): string {
    const productName = this.skuProductsMap.get(variant.sku)?.name;
    if (productName) {
      const attributeValues = variant.variantAttributeValues.map(av => av.value).join(' / ');
      return `${productName} / ${attributeValues}`;
    }
    return 'Unknown';
  }

  decrementQuantity(variant: IProductVariant) {
    const currentQuantity = this.variantsQuantityMap.get(variant);
    if (currentQuantity && currentQuantity > 1) {
      if (this.cartCookieService.updateQuantityInCart(variant.sku, currentQuantity - 1)) {
        this.variantsQuantityMap.set(variant, currentQuantity - 1);
        this.calculateSubTotal();
      } else {
        //TODO
      }
    }
  }

  incrementQuantity(variant: IProductVariant) {
    const currentQuantity = this.variantsQuantityMap.get(variant);
    if (currentQuantity && currentQuantity + 1 <= variant.stock) {
      if (this.cartCookieService.updateQuantityInCart(variant.sku, currentQuantity + 1)) {
        this.variantsQuantityMap.set(variant, currentQuantity + 1);
        this.calculateSubTotal();
      } else {
        //TODO
      }
    }
  }

  removeFromCart(variant: IProductVariant) {
    this.cartCookieService.removeFromCart(variant.sku)
    this.variantsQuantityMap.delete(variant);
    this.cartItems = this.cartCookieService.getCart();
    this.calculateSubTotal();
  }

  goToProducts() {
    this.toggleCart();
    this.router.navigate(["/products"]).then();
  }

  get variants(): IProductVariant[] {
    return Array.from(this.variantsQuantityMap.keys());
  }
}
