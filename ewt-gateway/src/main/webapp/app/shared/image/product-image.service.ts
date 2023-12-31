import {ProductService} from "../../ewt/store-admin/product/service/product.service";
import {forkJoin, from, mergeAll, Observable, of, switchMap, toArray} from "rxjs";
import {Injectable} from "@angular/core";
import {map} from "rxjs/operators";
import {IProduct} from "../../ewt/store-admin/product/model/product.model";

@Injectable({
  providedIn: 'root'
})
export class ProductImageService {
  private imagesCache = new Map<string, string[]>();

  constructor(private productService: ProductService) {
  }

  public getImagesForProducts(products: IProduct[]): Observable<Map<string, string[]>> {
    const observables = products.map(product => this.getImagesForProduct(product));

    return forkJoin(observables).pipe(
      map(mapsArray => {
        const result = new Map<string, string[]>();
        for (let skuImagesMap of mapsArray) {
          for (let [sku, images] of skuImagesMap.entries()) {
            result.set(sku, images);
          }
        }
        return result;
      })
    );
  }

  public getImagesForProduct(product: IProduct): Observable<Map<string, string[]>> {
    const skus = product.productVariants.map(variant => variant.sku);
    if (skus.some(sku => !this.imagesCache.has(sku))) {
      return this.fetchImagesForProductVariants(product).pipe(
        map(() => new Map(
          skus.map(sku => [sku, this.imagesCache.get(sku) || []])
        ))
      );
    } else {
      return of(new Map(
        skus.map(sku => [sku, this.imagesCache.get(sku) || []])
      ));
    }
  }


  public getImagesForSKU(sku: string, product?: IProduct): Observable<string[]> {
    if (this.imagesCache.has(sku)) {
      return of(this.imagesCache.get(sku) || []);
    } else {
      const product$ = product ? of(product) : this.getProductIfNeeded(sku);
      return product$.pipe(
        switchMap(product => this.fetchImagesForProductVariants(product)),
        map(() => this.imagesCache.get(sku) || [])
      );
    }
  }

  private getProductIfNeeded(sku: string): Observable<IProduct> {
    return this.productService.getProductForSku(sku);
  }

  private fetchImagesForProductVariants(product: IProduct): Observable<void> {
    const observables = product.productVariants.map(variant => {
      const sku = variant.sku;

      if (!this.imagesCache.has(sku)) {
        this.imagesCache.set(sku, []);
      }

      return variant.variantImages.map(image => {
        const ref = image.ref;

        return new Observable<string>(observer => {
          this.productService.getProductVariantImageByRef(product.id, sku, ref).subscribe(blob => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const imgData = reader.result as string;
              this.imagesCache.get(sku)?.push(imgData);
              observer.next(imgData);
              observer.complete();
            };
          });
        });
      });
    }).reduce((acc, curr) => acc.concat(curr), []); // Flattens the array.

    return from(observables).pipe(mergeAll(), toArray(), map(() => {
    }));
  }
}
