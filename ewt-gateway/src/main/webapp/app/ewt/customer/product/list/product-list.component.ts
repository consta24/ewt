import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {IProduct} from "../../../store-admin/product/model/product.model";
import {ProductService} from "../../../store-admin/product/service/product.service";
import {CartDrawerService} from "../../cart/service/cart-drawer.service";
import {CartService} from "../../cart/service/cart.service";
import {finalize} from "rxjs/operators";


@Component({
  selector: 'ewt-customer-product-list',
  templateUrl: 'product-list.component.html',
  styleUrls: ['product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  isLoading = true;
  products: IProduct[] = [];

  productsPerPage = 12;
  currentPage = 1;
  totalProducts = 0;

  hoveredProductId: number | null = null;

  constructor(private router: Router,
              private productService: ProductService,
              private cartService: CartService,
              private cartDrawerService: CartDrawerService) {
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts() {
    const pageable = {
      page: this.currentPage - 1,
      size: this.productsPerPage,
      sort: ["id,desc"]
    }
    this.productService.getProductsPage(pageable).pipe(finalize(() => this.isLoading = false)).subscribe({
      next: res => {
        if (res) {
          if (res.body && res.body.length) {
            this.products = res.body;
            this.totalProducts = Number(res.headers.get('X-Total-Count'));
          }
        }
      }, error: () => {
        //TODO:
      }
    });
  }

  addToCart(product: IProduct, quantity: number = 1) {
    if (product.productVariants.length > 1) {
      this.goToView(product.id);
      return;
    }

    const sku = product.productVariants[0].sku;
    this.cartService.addToCart(sku, quantity).subscribe(
      {
        next: () => {
          this.cartDrawerService.toggleCart();
        }, error: () => {
          //TODO
        }
      }
    )
  }

  goToView(id: number) {
    this.router.navigate([`/products/${id}`]).then();
  }

  onMouseLeave(): void {
    this.hoveredProductId = null;
  }


  getDefaultImageRef(product: IProduct): string {
    if (product.productVariants && product.productVariants.length > 0 && product.productVariants[0].variantImages && product.productVariants[0].variantImages.length > 0) {
      const ref = product.productVariants[0].variantImages[0].ref;
      //todo fix
      return `/services/ewt-msvc-product/api/store-admin/product/38/variant/38-heart-tennis-link-necklace-6mm-silver/image?ref=${ref}`;
    }
    return '/content/images/no-image.jpg';
  }

  getHoverImageRef(product: IProduct): string {
    let ref: string | null = null;

    if (product.productVariants && product.productVariants.length > 1 && product.productVariants[1].variantImages && product.productVariants[1].variantImages.length > 0) {
      ref = product.productVariants[1].variantImages[0].ref;
    } else if (product.productVariants && product.productVariants.length > 0 && product.productVariants[0].variantImages && product.productVariants[0].variantImages.length > 1) {
      ref = product.productVariants[0].variantImages[1].ref;
    }

    if (ref) {
      return `/services/ewt-msvc-product/api/store-admin/product/38/variant/38-heart-tennis-link-necklace-6mm-silver/image?ref=${ref}`;
    }

    return '/content/images/no-image.jpg';
  }
}

