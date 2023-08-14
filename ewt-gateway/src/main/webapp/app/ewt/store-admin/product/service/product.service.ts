import {Injectable} from "@angular/core";
import {ApplicationConfigService} from "../../../../core/config/application-config.service";
import {MSVC_PRODUCT} from "../../../../config/msvc.constants";
import {HttpClient} from "@angular/common/http";
import {IProduct} from "../model/product.model";
import {IProductCategory} from "../model/product-category.model";
import {IProductAttribute} from "../model/product-attribute.model";
import {IProductAttributeValue} from "../model/product-attribute-value.model";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productUrl = this.applicationConfigService.getEndpointFor('api/store-admin/product', MSVC_PRODUCT)
  private productCategoryUrl = this.applicationConfigService.getEndpointFor('api/store-admin/product-category', MSVC_PRODUCT)
  private productAttributeUrl = this.applicationConfigService.getEndpointFor('api/store-admin/product-attribute', MSVC_PRODUCT)

  constructor(private applicationConfigService: ApplicationConfigService, private httpClient: HttpClient) {
  }

  public getProducts() {
    return this.httpClient.get<IProduct[]>(`${this.productUrl}`);
  }

  public getCategories() {
    return this.httpClient.get<IProductCategory[]>(`${this.productCategoryUrl}`);
  }

  public getAttributes() {
    return this.httpClient.get<IProductAttribute[]>(`${this.productAttributeUrl}`);
  }

  public getAttributeValues(attributeId: number) {
    return this.httpClient.get<IProductAttributeValue[]>(`${this.productAttributeUrl}/${attributeId}/values`);
  }
}
