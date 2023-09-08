import {Component, OnInit} from "@angular/core";
import {forkJoin, switchMap} from "rxjs";
import {ProductService} from "../../../store-admin/product/service/product.service";
import {ProductImageService} from "../../../../shared/image/product-image.service";
import {IProduct} from "../../../store-admin/product/model/product.model";
import {IProductVariant} from "../../../store-admin/product/model/product-variant.model";
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {ICartItem} from "../../cart/model/cart-item.model";
import {CartService} from "../../cart/service/cart.service";


@Component({
  selector: 'ewt-customer-checkout',
  templateUrl: 'checkout.component.html',
  styleUrls: ['checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  isLoading = true;

  cartItems: ICartItem[] = [];
  variantsQuantityMap: Map<IProductVariant, number> = new Map();
  skuImagesMap: Map<string, string> = new Map();
  skuProductsMap: Map<string, IProduct> = new Map();
  subTotal: number = 0;

  constructor(private router: Router,
              private cartService: CartService,
              private productService: ProductService,
              private productImageService: ProductImageService) {
  }

  ngOnInit() {
    this.fetchCartItems();
  }

  fetchCartItems() {
    this.variantsQuantityMap.clear();
    this.skuImagesMap.clear();
    this.skuProductsMap.clear();
    this.cartService.getCart().subscribe({
      next: (cartItems: ICartItem[]) => {
        this.cartItems = cartItems;
        if (!this.cartItems.length) {
          this.isLoading = false;
        } else {
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
      }, error: () => {
        //TODO
      }
    })
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

  get variants(): IProductVariant[] {
    return Array.from(this.variantsQuantityMap.keys());
  }
}
