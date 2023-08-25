import {Injectable} from "@angular/core";
import {ApplicationConfigService} from "../../../../core/config/application-config.service";
import {MSVC_PRODUCT} from "../../../../config/msvc.constants";
import {HttpClient, HttpParams} from "@angular/common/http";
import {IProduct} from "../model/product.model";
import {IProductCategory} from "../model/product-category.model";
import {IProductAttribute} from "../model/product-attribute.model";
import {IProductAttributeValue} from "../model/product-attribute-value.model";
import {Observable} from "rxjs";
import {IProductVariant} from "../model/product-variant.model";
import {createRequestOption} from "../../../../core/request/request-util";

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
  public getProduct(productId: number) {
    return this.httpClient.get<IProduct>(`${this.productUrl}/${productId}`);
  }

  public getProducts(req: any) {
    let options = createRequestOption(req);
    return this.httpClient.get<IProduct[]>(`${this.productUrl}`, {params: options, observe: "response"});
  }

  public addProduct(product: IProduct) {
    return this.httpClient.post<IProduct>(`${this.productUrl}`, product);
  }

  public updateProduct(product: IProduct) {
    return this.httpClient.put<IProduct>(`${this.productUrl}/${product.id}`, product);
  }

  public deleteProduct(productId: number) {
    return this.httpClient.delete<void>(`${this.productUrl}/${productId}`);
  }

  //VARIANTS
  public getProductVariant(sku: string) {
    const productId = this.extractProductIdFromSku(sku);
    return this.httpClient.get<IProductVariant>(`${this.productUrl}/${productId}/variant/${sku}`)
  }

  public getProductVariantImageByRef(productId: number, sku: string, ref: string): Observable<Blob> {
    const params = new HttpParams().set('ref', ref);
    return this.httpClient.get(`${this.productUrl}/${productId}/variant/${sku}/image`, {
      params: params,
      responseType: "blob"
    });
  }

  public canDeleteVariant(productId: number, sku: string) {
    return this.httpClient.get<boolean>(`${this.productUrl}/${productId}/variant/${sku}/canDelete`);
  }

  public deleteVariant(productId: number, sku: string) {
    return this.httpClient.delete(`${this.productUrl}/${productId}/variant/${sku}`)
  }

  private extractProductIdFromSku(sku: string) {
    return sku.split('-')[0];
  }

  //CATEGORIES
  public getCategories() {
    return this.httpClient.get<IProductCategory[]>(`${this.productCategoryUrl}`);
  }

  public isCategoryLinkedToProducts(categoryId: number) {
    return this.httpClient.get<boolean>(`${this.productCategoryUrl}/${categoryId}/linked`);
  }

  public getProductsForCategory(categoryId: number) {
    return this.httpClient.get<IProduct[]>(`${this.productCategoryUrl}/${categoryId}/products`);
  }

  public addCategory(category: IProductCategory) {
    return this.httpClient.post<IProductCategory>(`${this.productCategoryUrl}`, category);
  }

  public updateCategory(category: IProductCategory) {
    return this.httpClient.put<IProductCategory>(`${this.productCategoryUrl}/${category.id}`, category);
  }

  public deleteCategory(categoryId: number) {
    return this.httpClient.delete<void>(`${this.productCategoryUrl}/${categoryId}`)
  }

  //ATTRIBUTES
  public getAttributes() {
    return this.httpClient.get<IProductAttribute[]>(`${this.productAttributeUrl}`);
  }

  public isAttributeLinkedToProducts(attributeId: number) {
    return this.httpClient.get<boolean>(`${this.productAttributeUrl}/${attributeId}/linked`);
  }

  public getProductsForAttribute(attributeId: number) {
    return this.httpClient.get<IProduct[]>(`${this.productAttributeUrl}/${attributeId}/products`);
  }

  public addAttribute(attribute: IProductAttribute) {
    return this.httpClient.post<IProductAttribute>(`${this.productAttributeUrl}`, attribute);
  }

  public updateAttribute(attribute: IProductAttribute) {
    return this.httpClient.put<IProductAttribute>(`${this.productAttributeUrl}/${attribute.id}`, attribute);
  }

  public deleteAttribute(attributeId: number) {
    return this.httpClient.delete<void>(`${this.productAttributeUrl}/${attributeId}`)
  }

  //ATTRIBUTE VALUES
  public getAttributeValues(attributeId: number) {
    return this.httpClient.get<IProductAttributeValue[]>(`${this.productAttributeUrl}/${attributeId}/values`);
  }

  public isAttributeValueLinkedToVariants(attributeId: number, attributeValueId: number) {
    return this.httpClient.get<boolean>(`${this.productAttributeUrl}/${attributeId}/values/${attributeValueId}/linked`);
  }

  public getVariantsForAttributeValue(attributeId: number, attributeValueId: number) {
    return this.httpClient.get<IProductVariant[]>(`${this.productAttributeUrl}/${attributeId}/values/${attributeValueId}/variants`);
  }

  public updateAttributeValue(attributeValue: IProductAttributeValue) {
    return this.httpClient.put<IProductAttributeValue>(`${this.productAttributeUrl}/${attributeValue.attributeId}/values/${attributeValue.id}`, attributeValue);
  }

  public addAttributeValue(attributeId: number, value: IProductAttributeValue) {
    return this.httpClient.post<IProductAttributeValue>(`${this.productAttributeUrl}/${attributeId}/values`, value);
  }

  public deleteAttributeValue(attributeId: number, attributeValueId: number) {
    return this.httpClient.delete(`${this.productAttributeUrl}/${attributeId}/values/${attributeValueId}`);
  }
}
