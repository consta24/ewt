import {IProductAttributeValue} from "./product-attribute-value.model";
import {IProductVariantImage} from "./product-variant-image.model";

export interface IProductVariant {
  id: number;
  sku: string;
  productId: number;
  price: number;
  stock: number;
  variantAttributeValues: IProductAttributeValue[];
  variantImages: IProductVariantImage[];
}
