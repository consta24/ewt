import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {IProduct} from "../../../store-admin/product/model/product.model";
import {ProductService} from "../../../store-admin/product/service/product.service";
import {tap} from "rxjs/operators";
import {forkJoin} from "rxjs";

@Component({
  selector: 'ewt-store-admin-product-list',
  templateUrl: 'product-list.component.html',
  styleUrls: ['product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  isLoading = true;
  products: IProduct[] = [];
  skuImageMap: { [sku: string]: string[] } = {};

  itemsPerPage = 12;
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

  addToCart(product: IProduct) {

  }

  goToView(id: number) {
    this.router.navigate([`/products/${id}`]).then();
  }
}
