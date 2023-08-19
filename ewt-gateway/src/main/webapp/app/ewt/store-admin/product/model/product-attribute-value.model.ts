export interface IProductAttributeValue {
  id: number;
  attributeId: number;
  value: string;
}

export class ProductAttributeValue implements IProductAttributeValue {
  constructor(
    public id: number,
    public attributeId: number,
    public value: string,
  ) {
    this.id = id;
    this.attributeId = attributeId;
    this.value = value;
  }
}
