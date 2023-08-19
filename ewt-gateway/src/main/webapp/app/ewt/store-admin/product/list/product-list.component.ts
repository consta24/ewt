import {Component, OnInit} from "@angular/core";
import {ProductService} from "../service/product.service";
import {IProduct} from "../model/product.model";
import {IProductAttributeValue} from "../model/product-attribute-value.model";
import {IProductAttribute} from "../model/product-attribute.model";
import {Router} from "@angular/router";

@Component({
  selector: 'ewt-store-admin-product-list',
  templateUrl: 'product-list.component.html'
})
export class ProductListComponent implements OnInit {

  isLoading = true;
  products: IProduct[] = [];
  skuImageMap: { [sku: string]: string[] } = {};


  constructor(private router: Router, private productService: ProductService) {

  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  private fetchProducts() {
    this.productService.getProducts().subscribe(products => {
      products.forEach(product => product.productVariants.forEach(variant => variant.variantAttributeValues.sort((a, b) => a.attributeId - b.attributeId)));
      this.products = products;
      this.mapSkuToImages();
    })
  }

  private mapSkuToImages(): void {
    for (const product of this.products) {
      for (const variant of product.productVariants) {
        const sku = variant.sku;
        this.skuImageMap[sku] = [];

        for (const image of variant.variantImages) {
          const ref = image.ref;
          this.productService.getProductVariantImageByRef(product.id, sku, ref).subscribe(blob => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              this.skuImageMap[sku].push(reader.result as string);
            };
          });
        }
      }
    }
    this.isLoading = false;
  }

  findAttribute(attributes: IProductAttribute[], attributeValue: IProductAttributeValue) {
    return attributes.find(attribute => attribute.id === attributeValue.attributeId)?.name;
  }

  goToEdit(id: number) {
    this.router.navigate(['store-admin/products/edit', id]).then();
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe(() => {
      this.fetchProducts();
    })
  }
}
