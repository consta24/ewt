import {Component, OnInit} from "@angular/core";
import {IProductAttribute, ProductAttribute} from "../../model/product-attribute.model";
import {ProductService} from "../../service/product.service";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {IProductAttributeValue, ProductAttributeValue} from "../../model/product-attribute-value.model";
import {forkJoin, switchMap} from "rxjs";
import {map, tap} from "rxjs/operators";
import {IProduct} from "../../model/product.model";

@Component({
  selector: 'ewt-store-admin-attributes-list',
  templateUrl: 'attributes-list.component.html'
})
export class AttributesListComponent implements OnInit {

  isLoading = true;
  attributes: IProductAttribute[] = [];
  attributeAddToggle = false;

  attributeValues: IProductAttributeValue[] = [];
  expandedAttributeId: number | null = null;
  attributeValue: string = '';

  attributeForm!: FormGroup;

  private linkedAttributes: Map<number, boolean> = new Map();


  constructor(private fb: FormBuilder, private productService: ProductService) {

  }

  ngOnInit(): void {
    this.initForm();
    this.fetchAttributes();
  }

  private fetchAttributes() {
    this.expandedAttributeId = null;
    this.expandedAttributeIdProducts = null;
    this.linkedProducts.clear();

    this.productService.getAttributes().pipe(
      switchMap(attributes => {
        const linkedCheckObservables = attributes.map(attribute =>
          this.productService.isAttributeLinkedToProducts(attribute.id!).pipe(
            tap(isLinked => this.linkedAttributes.set(attribute.id!, isLinked))
          )
        );

        return forkJoin(linkedCheckObservables).pipe(map(() => attributes));
      })
    ).subscribe(attributes => {
      this.attributes = attributes;
      this.isLoading = false;
    });
  }

  private initForm() {
    this.attributeForm = this.fb.group({
      name: [null, Validators.required],
      values: this.fb.array([], this.uniqueAndValidValuesValidator())
    });
  }

  private uniqueAndValidValuesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null;
      }

      const valueSet = new Set<string>();
      let hasDuplicate = false;
      let hasInvalidCharacters = false;

      for (let ctrl of control.controls) {
        const value = ctrl.value?.toLowerCase().trim();

        if (value && valueSet.has(value)) {
          hasDuplicate = true;
        }
        valueSet.add(value);

        if (/[0-9~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]+/.test(value)) {
          hasInvalidCharacters = true;
        }
      }

      if (hasDuplicate) {
        return {duplicateValue: true};
      }
      if (hasInvalidCharacters) {
        return {invalidCharacters: true};
      }
      return null;
    };
  }

  addValue(): void {
    this.valuesFormArray.push(this.fb.control(null, Validators.required));
  }

  removeValue(index: number): void {
    this.valuesFormArray.removeAt(index);
  }

  toggleAttributeAdd() {
    this.attributeAddToggle = !this.attributeAddToggle;
  }

  submitForm() {
    const attribute = new ProductAttribute(null, this.attributeForm.value.name);

    this.productService.addAttribute(attribute).pipe(
      switchMap(savedAttribute => {
        const attributeValueObservables = this.attributeForm.value.values.map((value: string) => {
          const attributeValue = new ProductAttributeValue(null, savedAttribute.id!, value);
          return this.productService.addAttributeValue(savedAttribute.id!, attributeValue);
        });

        return forkJoin(attributeValueObservables);
      })
    ).subscribe({
      complete: () => {
        this.attributeAddToggle = false;
        this.initForm();
        this.fetchAttributes();
      },
      error: err => {
        console.error('Error occurred while saving attribute values:', err);
      }
    });
  }

  isAttributeLinkedToProducts(attributeId: number) {
    return this.linkedAttributes.get(attributeId) ?? true;
  }

  expandedAttributeIdProducts: number | null = null;
  linkedProducts = new Map<number, IProduct[]>();


  deleteOrExpandAttribute(attributeId: number) {
    if (this.expandedAttributeIdProducts === attributeId) {
      this.expandedAttributeIdProducts = null;
      return;
    }
    if (this.isAttributeLinkedToProducts(attributeId)) {
      this.fetchLinkedProducts(attributeId);
      return;
    }
    this.productService.deleteAttribute(attributeId).subscribe(() => {
      this.fetchAttributes();
    });
  }

  private fetchLinkedProducts(attributeId: number) {
    this.linkedProducts.clear();
    this.productService.getProductsForAttribute(attributeId).subscribe(products => {
      this.linkedProducts.set(attributeId, products);
      this.expandedAttributeIdProducts = attributeId;
    });
  }

  toggleAttributeValues(id: number) {
    this.attributeValue = '';
    if (this.expandedAttributeId === id) {
      this.expandedAttributeId = null;
      this.attributeValues = [];
    } else {
      this.productService.getAttributeValues(id).subscribe(value => {
        this.attributeValues = value;
        this.expandedAttributeId = id;
      });
    }
  }

  addAttributeValue(attributeId: number, value: string) {
    const attributeValue = new ProductAttributeValue(null, attributeId, value);
    this.productService.addAttributeValue(attributeId, attributeValue).subscribe(() => {
      this.fetchAttributes();
    })
  }


  deleteAttributeValue(attributeId: number, attributeValueId: number) {
    this.productService.deleteAttributeValue(attributeId, attributeValueId).subscribe(() => {
      this.fetchAttributes();
    });
  }

  deleteProduct(attributeId: number, productId: number) {
    this.productService.deleteProduct(productId).subscribe(() => {
      if (this.linkedProducts.size === 1) {
        this.fetchAttributes();
      } else {
        this.fetchLinkedProducts(attributeId);
      }
    })
  }

  get valuesFormArray(): FormArray {
    return this.attributeForm.get('values') as FormArray;
  }
}
