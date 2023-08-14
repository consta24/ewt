import {IProductAttributeValue} from "./product-attribute-value.model";

export interface IProductVariant {
  id: number;
  sku: string;
  productId: number;
  price: number;
  stock: number;
  productAttributeValues: IProductAttributeValue[];
}
