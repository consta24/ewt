import {Component, OnInit} from "@angular/core";
import {ProductService} from "../service/product.service";
import {IProduct} from "../model/product.model";
import {Router} from "@angular/router";
import {tap} from "rxjs/operators";
import {forkJoin} from "rxjs";
import {IProductVariant} from "../model/product-variant.model";

@Component({
  selector: 'ewt-store-admin-product-list',
  templateUrl: 'product-list.component.html'
})
export class ProductListComponent implements OnInit {

  isLoading = true;
  products: IProduct[] = [];
  skuImageMap: { [sku: string]: string[] } = {};

  itemsPerPage = 2;
  currentPage = 1;
  totalItems = 0;

  constructor(private router: Router, private productService: ProductService) {

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
        res.body.forEach(product => product.productVariants.forEach(variant => variant.variantAttributeValues.sort((a, b) => a.attributeId - b.attributeId)));
        this.products = res.body;
        this.totalItems = Number(res.headers.get('X-Total-Count'))
        this.mapSkuToImages();
      } else {
        //TODO:
      }
    })
  }

  private mapSkuToImages(): void {
    const observables = [];

    for (const product of this.products) {
      for (const variant of product.productVariants) {
        const sku = variant.sku;
        this.skuImageMap[sku] = [];

        for (const image of variant.variantImages) {
          const ref = image.ref;

          const request$ = this.productService.getProductVariantImageByRef(product.id, sku, ref).pipe(
            tap(blob => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                this.skuImageMap[sku].push(reader.result as string);
              };
            })
          );

          observables.push(request$);
        }
      }
    }

    forkJoin(observables).subscribe(() => {
      this.isLoading = false;
    });
  }

  goToEdit(id: number) {
    this.router.navigate(['store-admin/products/edit', id]).then();
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe(() => {
      this.fetchProducts();
    })
  }

  formatProductVariantName(productName: string, variant: IProductVariant): string {
    const attributeValues = variant.variantAttributeValues.map(av => av.value).join(' / ');
    return `${productName} / ${attributeValues}`;
  }
}
