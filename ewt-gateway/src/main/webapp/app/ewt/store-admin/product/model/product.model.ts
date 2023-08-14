import {IProductVariant} from "./product-variant.model";
import {IProductCategory} from "./product-category.model";
import {IProductAttribute} from "./product-attribute.model";

export interface IProduct {
  id: number;
  name: string;
  description: string;
  productVariants: IProductVariant[];
  productCategories: IProductCategory[];
  productAttributes: IProductAttribute[];
}
