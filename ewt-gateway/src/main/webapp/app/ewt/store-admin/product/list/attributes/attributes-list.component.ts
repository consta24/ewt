import {Component, OnInit} from "@angular/core";
import {IProductAttribute} from "../../model/product-attribute.model";
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
import {IProductAttributeValue} from "../../model/product-attribute-value.model";
import {forkJoin, of, switchMap} from "rxjs";
import {map, tap} from "rxjs/operators";
import {IProduct} from "../../model/product.model";
import {Router} from "@angular/router";
import {IProductVariant} from "../../model/product-variant.model";

@Component({
  selector: 'ewt-store-admin-attributes-list',
  templateUrl: 'attributes-list.component.html'
})
export class AttributesListComponent implements OnInit {

  isLoading = true;
  attributes: IProductAttribute[] = [];
  attributeAddToggle = false;

  attributeValues: IProductAttributeValue[] = [];
  expandedAttributeIdAttributeValues: number | null = null;
  attributeValue: string = '';

  attributeForm!: FormGroup;

  expandedAttributeIdDelete: number | null = null;
  linkedProducts = new Map<number, IProduct[]>();

  linkedVariants = new Map<number, IProductVariant[]>();
  expandedAttributeValueIdDelete: number | null = null;
  expandedAttributeValueIdEdit: number | null = null;

  private linkedAttributes: Map<number, boolean> = new Map();
  private linkedAttributeValues: Map<number, boolean> = new Map();


  constructor(private router: Router, private fb: FormBuilder, private productService: ProductService) {

  }

  ngOnInit(): void {
    this.fetchAttributes();
  }

  private fetchAttributes() {
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
      attributes.sort((a, b) => a.id - b.id);
      this.expandedAttributeIdAttributeValues = null;
      this.expandedAttributeIdDelete = null;
      this.linkedProducts.clear();
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
        if (!(ctrl instanceof FormGroup)) {
          continue;
        }

        const value = ctrl.get('value')?.value?.toLowerCase().trim();

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
    this.valuesFormArray.push(
      this.fb.group({
        attributeId: [null],
        value: [null, Validators.required]
      })
    );
  }

  removeValue(index: number): void {
    this.valuesFormArray.removeAt(index);
  }

  toggleAttributeAdd() {
    if(!this.attributeAddToggle) {
      this.initForm();
    }
    this.attributeAddToggle = !this.attributeAddToggle;
  }

  submitForm() {
    this.productService.addAttribute(this.attributeForm.value).pipe(
      switchMap(savedAttribute => {
        const attributeValueObservables = this.attributeForm.value.values.map((attributeValue: IProductAttributeValue) => {
          attributeValue.attributeId = savedAttribute.id;
          return this.productService.addAttributeValue(savedAttribute.id, attributeValue);
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

  deleteOrExpandAttribute(attributeId: number) {
    if (this.expandedAttributeIdDelete === attributeId) {
      this.expandedAttributeIdDelete = null;
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
    this.productService.getProductsForAttribute(attributeId).subscribe(products => {
      this.linkedProducts.clear();
      this.linkedProducts.set(attributeId, products);
      this.expandedAttributeIdDelete = attributeId;
    });
  }

  deleteProduct(attributeId: number, productId: number) {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        if (this.linkedProducts.size === 1) {
          this.fetchAttributes();
        } else {
          this.fetchLinkedProducts(attributeId);
        }
      },
      error: () => {
        //TODO
      }
    })
  }

  toggleAttributeValues(attributeId: number) {
    this.attributeValue = '';

    if (this.expandedAttributeIdAttributeValues === attributeId) {
      this.expandedAttributeIdAttributeValues = null;
      this.attributeValues = [];
    } else {
      this.fetchAttributeValues(attributeId);
    }
  }

  private fetchAttributeValues(attributeId: number) {
    this.productService.getAttributeValues(attributeId).pipe(
      switchMap(values => {
        this.expandedAttributeIdAttributeValues = attributeId;

        if (!values.length) {
          return of({values: [], linkedChecks: []});
        }

        const linkCheckObservables = values.map(value =>
          this.productService.isAttributeValueLinkedToVariants(attributeId, value.id!).pipe(
            tap(isLinked => this.linkedAttributeValues.set(value.id!, isLinked))
          )
        );

        return forkJoin(linkCheckObservables).pipe(
          map(linkedChecks => ({values, linkedChecks}))
        );
      }),
    ).subscribe(result => {
      result.values.sort((a, b) => a.id - b.id);
      this.expandedAttributeValueIdEdit = null;
      this.expandedAttributeValueIdDelete = null;
      this.attributeValues = result.values;
    });
  }


  isAttributeValueLinkedToVariants(attributeValueId: number) {
    return this.linkedAttributeValues.get(attributeValueId) ?? true;
  }

  deleteOrExpandAttributeValue(attributeId: number, attributeValueId: number) {
    if (this.expandedAttributeValueIdDelete === attributeValueId) {
      this.expandedAttributeValueIdDelete = null;
      return;
    }
    this.expandedAttributeValueIdEdit = null;
    if (this.isAttributeValueLinkedToVariants(attributeValueId)) {
      this.fetchLinkedVariants(attributeId, attributeValueId);
      return;
    }
    this.productService.deleteAttributeValue(attributeId, attributeValueId).subscribe(() => {
      this.fetchAttributeValues(attributeId);
    });
  }

  private fetchLinkedVariants(attributeId: number, attributeValueId: number) {
    this.linkedVariants.clear();
    this.productService.getVariantsForAttributeValue(attributeId, attributeValueId).subscribe(variants => {
      this.linkedVariants.set(attributeValueId, variants);
      this.expandedAttributeValueIdDelete = attributeValueId;
    });
  }

  addAttributeValue(attributeId: number, value: string) {
    const attributeValue: any = {
      attributeId: attributeId,
      value: value
    }
    this.productService.addAttributeValue(attributeId, attributeValue).subscribe(() => {
      this.fetchAttributeValues(attributeId);
    })
  }

  deleteVariant(attributeId: number, attributeValueId: number, productId: number, sku: string) {
    this.productService.deleteVariant(productId, sku).subscribe({
      next: () => {
        if (this.linkedVariants.size === 1) {
          this.fetchAttributes();
        } else {
          this.fetchLinkedVariants(attributeId, attributeValueId);
        }
      }, error: () => {

      }
    })
  }

  get valuesFormArray(): FormArray {
    return this.attributeForm.get('values') as FormArray;
  }

  goToEdit(id: number) {
    this.router.navigate(['store-admin/products/edit', id], {queryParams: {source: 'attributes'}}).then();
  }

  toggleAttributeValueEdit(attributeValue: IProductAttributeValue) {
    if (this.expandedAttributeValueIdEdit === attributeValue.id) {
      this.expandedAttributeValueIdEdit = null;
      return;
    } else {
      this.handleAttributeValueEdit(attributeValue);
    }
  }

  private handleAttributeValueEdit(attributeValue: IProductAttributeValue) {
    this.productService.getVariantsForAttributeValue(attributeValue.attributeId, attributeValue.id).subscribe(variants => {
      this.linkedVariants.set(attributeValue.id, variants);
      this.initAttributeValueEditForm(attributeValue);
      this.expandedAttributeValueIdDelete = null;
      this.expandedAttributeValueIdEdit = attributeValue.id;
    });
  }

  attributeValueEditForm!: FormGroup;

  private initAttributeValueEditForm(attributeValue: IProductAttributeValue) {
    this.attributeValueEditForm = this.fb.group({
      id: [attributeValue.id, Validators.required],
      attributeId: [attributeValue.attributeId, Validators.required],
      value: [attributeValue.value, Validators.required]
    })
  }

  submitAttributeValueEditForm() {
    this.productService.updateAttributeValue(this.attributeValueEditForm.value).subscribe({
      next: () => {
        this.fetchAttributeValues(this.attributeValueEditForm.value.attributeId)
      },
      error: () => {
        //TODO:
      }
    })
  }
}
