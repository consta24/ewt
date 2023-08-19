export interface IProductAttribute {
  id: number;
  name: string;
}

export class ProductAttribute implements IProductAttribute {
  constructor(
    public id: number,
    public name: string,
  ) {
    this.id = id;
    this.name = name;
  }
}

