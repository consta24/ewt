import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {IProduct} from "../../../store-admin/product/model/product.model";
import {ProductService} from "../../../store-admin/product/service/product.service";
import {ProductImageService} from "../../../../shared/image/product-image.service";
import {CartDrawerService} from "../../cart/service/cart-drawer.service";
import {CartService} from "../../cart/service/cart.service";
import {of, switchMap} from "rxjs";


@Component({
  selector: 'ewt-customer-product-list',
  templateUrl: 'product-list.component.html',
  styleUrls: ['product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  isLoading = true;
  products: IProduct[] = [];
  skuImagesMap: Map<string, string[]> = new Map();

  productsPerPage = 12;
  currentPage = 1;
  totalProducts = 0;

  hoveredProductSku: string | null = null;
  hoveredImage: string | null = null;

  constructor(private router: Router,
              private productService: ProductService,
              private cartService: CartService,
              private cartDrawerService: CartDrawerService,
              private productImageService: ProductImageService) {
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
    this.productService.getProductsPage(pageable).pipe(
      switchMap(res => {
        if (res.body && res.body.length) {
          this.products = res.body;
          this.totalProducts = Number(res.headers.get('X-Total-Count'));
          return this.productImageService.getImagesForProducts(res.body);
        } else {
          return of(null);
        }
      })
    ).subscribe({
      next: imagesToSkuMap => {
        if (imagesToSkuMap) {
          this.skuImagesMap = imagesToSkuMap;
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      }, error: () => {
        //TODO:
      }
    });
  }


  getFirstImage(sku: string): string {
    if (this.hoveredProductSku === sku) {
      return this.hoveredImage || this.skuImagesMap.get(sku)?.[0] || '';
    }
    return this.skuImagesMap.get(sku)?.[0] || '';
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

  onHover(product: IProduct): void {
    this.hoveredProductSku = product.productVariants[0].sku;
    this.hoveredImage = this.getNextVariantFirstImage(product);
  }

  onMouseLeave(): void {
    this.hoveredProductSku = null;
    this.hoveredImage = null;
  }


  getNextVariantFirstImage(product: IProduct): string {
    const currentVariantIndex = product.productVariants.findIndex(
      variant => variant.sku === this.hoveredProductSku
    );

    if (currentVariantIndex === -1) {
      return '';
    }

    const currentVariant = product.productVariants[currentVariantIndex];

    if (
      currentVariantIndex + 1 < product.productVariants.length &&
      product.productVariants[currentVariantIndex + 1].variantImages.length > 0
    ) {
      const nextSku = product.productVariants[currentVariantIndex + 1].sku;
      return this.skuImagesMap.get(nextSku)?.[0] || '';
    } else if ((this.skuImagesMap.get(currentVariant.sku)?.length ?? 0) > 1) {
      return this.skuImagesMap.get(currentVariant.sku)?.[1] || '';
    }

    return '';
  }
}

