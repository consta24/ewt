import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {IProduct} from "../../../store-admin/product/model/product.model";
import {ProductService} from "../../../store-admin/product/service/product.service";
import {ProductImageService} from "../../../../shared/product/product-image.service";
import {CartDrawerService} from "../../cart/service/cart-drawer.service";
import {CartService} from "../../cart/service/cart.service";


@Component({
  selector: 'ewt-customer-product-list',
  templateUrl: 'product-list.component.html',
  styleUrls: ['product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  isLoading = true;
  products: IProduct[] = [];
  skuImagesMap: Map<string, string[]> = new Map();

  itemsPerPage = 12;
  currentPage = 1;
  totalItems = 0;

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
    const req = {
      page: this.currentPage - 1,
      size: this.itemsPerPage,
      sort: ["id,desc"]
    }
    this.productService.getProducts(req).subscribe(res => {
      if (res.body) {
        res.body.sort((a, b) => a.id - b.id);
        this.products = res.body;
        this.totalItems = Number(res.headers.get('X-Total-Count'))
        this.mapSkuToImages();
      } else {
        //TODO:
      }
    })
  }

  private mapSkuToImages(): void {
    this.productImageService.getImagesForProducts(this.products).subscribe(skuImagesMap => {
      this.skuImagesMap = skuImagesMap;
      this.isLoading = false;
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

