import {Component, OnInit} from "@angular/core";
import {ProductService} from "../service/product.service";
import {IProduct} from "../model/product.model";

@Component({
  selector: 'ewt-store-admin-product-list',
  templateUrl: 'product-list.component.html'
})
export class ProductListComponent implements OnInit {

  isLoading = true;
  products: IProduct[] = [];

  constructor(private productService: ProductService) {

  }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.isLoading = false;
    })
  }
}
