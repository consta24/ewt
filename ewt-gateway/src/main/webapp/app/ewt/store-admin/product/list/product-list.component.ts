import { Component, OnInit } from '@angular/core';
import { ProductService } from '../service/product.service';
import { IProduct } from '../model/product.model';
import { Router } from '@angular/router';
import { IProductVariant } from '../model/product-variant.model';
import { ProductImageService } from '../../../../shared/image/product-image.service';
import { ITEMS_PER_PAGE_20 } from '../../../../config/pagination.constants';

@Component({
  selector: 'ewt-store-admin-product-list',
  templateUrl: 'product-list.component.html',
})
export class ProductListComponent implements OnInit {
  isLoading = true;
  products: IProduct[] = [];
  skuImagesMap: Map<string, string[]> = new Map();

  itemsPerPage = ITEMS_PER_PAGE_20;
  currentPage = 1;
  totalItems = 0;

  constructor(private router: Router, private productService: ProductService, private productImageService: ProductImageService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts() {
    const req = {
      page: this.currentPage - 1,
      size: this.itemsPerPage,
      sort: ['id,desc'],
    };
    this.productService.getProductsPage(req).subscribe(res => {
      if (res.body && res.body.length) {
        res.body.forEach(product =>
          product.productVariants.forEach(variant => variant.variantAttributeValues.sort((a, b) => a.attributeId - b.attributeId))
        );
        res.body.sort((a, b) => a.id - b.id);
        this.products = res.body;
        this.totalItems = Number(res.headers.get('X-Total-Count'));
        this.mapSkuToImages();
      } else {
        this.isLoading = false;
      }
    });
  }

  private mapSkuToImages(): void {
    this.productImageService.getImagesForProducts(this.products).subscribe(skuImagesMap => {
      this.skuImagesMap = skuImagesMap;
      this.isLoading = false;
    });
  }

  getFirstImage(sku: string) {
    const images = this.skuImagesMap.get(sku);
    return images ? images[0] : '';
  }

  goToEdit(id: number) {
    this.router.navigate(['store-admin/products/edit', id]).then();
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe(() => {
      this.fetchProducts();
    });
  }

  formatProductVariantName(productName: string, variant: IProductVariant): string {
    const attributeValues = variant.variantAttributeValues.map(av => av.value).join(' / ');
    return `${productName} / ${attributeValues}`;
  }
}
