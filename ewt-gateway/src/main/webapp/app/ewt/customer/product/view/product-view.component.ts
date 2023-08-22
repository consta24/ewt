import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {IProduct} from "../../../store-admin/product/model/product.model";
import {ProductService} from "../../../store-admin/product/service/product.service";
import {forkJoin, Observable} from "rxjs";
import {IProductVariant} from "../../../store-admin/product/model/product-variant.model";
import {IProductAttributeValue} from "../../../store-admin/product/model/product-attribute-value.model";

@Component({
  selector: 'ewt-store-admin-product-view',
  templateUrl: 'product-view.component.html',
  styleUrls: ['product-view.component.scss']
})
export class ProductViewComponent implements OnInit {

  isLoading = true;
  product!: IProduct;

  imagesMap: { [sku: string]: string[] } = {};
  images: string[] = [];
  attributeValuesMap: { [key: number]: Set<string> } = {};
  selectedAttributes: { [key: number]: string } = {};

  currentImage: string = '';
  currentVariant!: IProductVariant;


  constructor(private router: Router, private route: ActivatedRoute, private productService: ProductService) {

  }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.fetchProduct(Number(productId));
    } else {
      this.router.navigate(["/products"]).then();
    }
  }

  fetchProduct(productId: number) {
    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        product.productAttributes.sort((a, b) => a.id - b.id);
        product.productVariants.forEach(variant => variant.variantAttributeValues.sort((a, b) => a.id - b.id))
        this.product = product;
        this.currentVariant = this.product.productVariants[0];
        this.initSelectedAttributes();
        this.initializeAttributeValuesMap();
        this.mapSkuToImages();
      }
    })
  }

  private initSelectedAttributes(): void {
    if (this.currentVariant && this.currentVariant.variantAttributeValues) {
      this.selectedAttributes = {};
      for (const attributeValue of this.currentVariant.variantAttributeValues) {
        if (!this.selectedAttributes[attributeValue.attributeId]) {
          this.selectedAttributes[attributeValue.attributeId] = attributeValue.value;
        }
      }
    }
  }

  private mapSkuToImages(): void {
    const observables = [];

    for (const variant of this.product.productVariants) {
      const sku = variant.sku;

      if (!this.imagesMap[sku]) {
        this.imagesMap[sku] = [];
      }

      for (const image of variant.variantImages) {
        const ref = image.ref;

        const request$ = new Observable<string>(observer => {
          this.productService.getProductVariantImageByRef(this.product.id, sku, ref).subscribe(blob => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const imgData = reader.result as string;
              this.imagesMap[sku].push(imgData);
              observer.next(imgData);
              observer.complete();
            };
          });
        });

        observables.push(request$);
      }
    }

    forkJoin(observables).subscribe(() => {
      this.currentImage = this.imagesMap[this.currentVariant.sku][0];
      this.images = Object.values(this.imagesMap).reduce((acc, val) => acc.concat(val), []);
      this.isLoading = false;
    });
  }


  initializeAttributeValuesMap() {
    for (const variant of this.product.productVariants) {
      for (const value of variant.variantAttributeValues) {
        if (!this.attributeValuesMap[value.attributeId]) {
          this.attributeValuesMap[value.attributeId] = new Set<string>();
        }
        this.attributeValuesMap[value.attributeId].add(value.value);
      }
    }
  }


  selectAttributeValue(attributeId: number, selectedValue: string) {
    this.selectedAttributes[attributeId] = selectedValue;
    this.selectVariant();
  }

  isSelectedAttributeValue(attributeId: number, value: string): boolean {
    return this.selectedAttributes[attributeId] === value;
  }


  selectVariant() {
    const variant = this.product.productVariants.find(variant =>
      Object.keys(this.selectedAttributes).every(key => {
        const attributeId = +key;
        return variant.variantAttributeValues.some(
          (value: IProductAttributeValue) => value.attributeId === attributeId && value.value === this.selectedAttributes[attributeId]
        )
      })
    );
    if (variant) {
      this.currentVariant = variant;
      if (this.imagesMap[this.currentVariant.sku][0]) {
        this.currentImage = this.imagesMap[this.currentVariant.sku][0]
      }
    }
  }

  prevImage(): void {
    const idx = this.images.indexOf(this.currentImage);
    if (idx > 0) {
      this.currentImage = this.images[idx - 1];
    } else {
      this.currentImage = this.images[this.images.length - 1];
    }
  }

  nextImage(): void {
    const idx = this.images.indexOf(this.currentImage);
    if (idx < this.images.length - 1) {
      this.currentImage = this.images[idx + 1];
    } else {
      this.currentImage = this.images[0];
    }
  }

  addToCart(product: IProduct) {

  }

}
