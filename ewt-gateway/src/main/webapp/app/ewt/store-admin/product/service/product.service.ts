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


  //PRODUCTS
  public addProduct(product: IProduct) {
    return this.httpClient.post<IProduct>(`${this.productUrl}`, product);
  }

  public getProducts() {
    return this.httpClient.get<IProduct[]>(`${this.productUrl}`);
  }

  public deleteProduct(productId: number) {
    return this.httpClient.delete<void>(`${this.productUrl}/${productId}`);
  }

  //CATEGORIES
  public getCategories() {
    return this.httpClient.get<IProductCategory[]>(`${this.productCategoryUrl}`);
  }


  //ATTRIBUTES
  public getAttributes() {
    return this.httpClient.get<IProductAttribute[]>(`${this.productAttributeUrl}`);
  }

  public isAttributeLinkedToProducts(attributeId: number) {
    return this.httpClient.get<boolean>(`${this.productAttributeUrl}/${attributeId}/linked`);
  }

  public addAttribute(attribute: IProductAttribute) {
    return this.httpClient.post<IProductAttribute>(`${this.productAttributeUrl}`, attribute);
  }

  public deleteAttribute(attributeId: number) {
    return this.httpClient.delete<void>(`${this.productAttributeUrl}/${attributeId}`)
  }

  public getProductsForAttribute(attributeId: number) {
    return this.httpClient.get<IProduct[]>(`${this.productAttributeUrl}/${attributeId}/products`);
  }

  //ATTRIBUTE VALUES
  public getAttributeValues(attributeId: number) {
    return this.httpClient.get<IProductAttributeValue[]>(`${this.productAttributeUrl}/${attributeId}/values`);
  }

  public addAttributeValue(attributeId: number, value: IProductAttributeValue) {
    return this.httpClient.post<IProductAttributeValue>(`${this.productAttributeUrl}/${attributeId}/values`, value);
  }

  public deleteAttributeValue(attributeId: number, attributeValueId: number) {
    return this.httpClient.delete(`${this.productAttributeUrl}/${attributeId}/values/${attributeValueId}`);
  }
}
