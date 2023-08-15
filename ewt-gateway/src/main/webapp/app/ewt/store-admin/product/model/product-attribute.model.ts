export interface IProductAttribute {
  id: number | null;
  name: string;
}

export class ProductAttribute implements IProductAttribute {
  constructor(
    public id: number | null,
    public name: string,
  ) {
    this.id = id;
    this.name = name;
  }
}

