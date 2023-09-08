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
import {forkJoin, Observable, of, switchMap} from "rxjs";
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
  attributeValues: IProductAttributeValue[] = [];

  attributeAddToggle = false;

  attributeValue: string = '';

  attributeForm!: FormGroup;
  attributeEditForm!: FormGroup;
  attributeValueEditForm!: FormGroup;

  linkedProducts = new Map<number, IProduct[]>();
  linkedVariants = new Map<number, IProductVariant[]>();

  expandedAttributeIdEdit: number | null = null;
  expandedAttributeIdDelete: number | null = null;
  expandedAttributeIdAttributeValues: number | null = null;

  expandedAttributeValueIdDelete: number | null = null;
  expandedAttributeValueIdEdit: number | null = null;

  variantsToRemovable = new Map<number, boolean>();

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
        if(attributes.length) {
          const linkedCheckObservables = attributes.map(attribute =>
            this.productService.isAttributeLinkedToProducts(attribute.id!).pipe(
              tap(isLinked => this.linkedAttributes.set(attribute.id!, isLinked))
            )
          );

          return forkJoin(linkedCheckObservables).pipe(map(() => attributes));
        } else {
          return of(null);
        }
      })
    ).subscribe(attributes => {
      if(attributes) {
        attributes.sort((a, b) => a.id - b.id);
        this.unexpandAll();
        this.linkedProducts.clear();
        this.attributes = attributes;
      }
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

      for (let ctrl of control.controls) {
        if (!(ctrl instanceof FormGroup)) {
          continue;
        }

        const value = ctrl.get('value')?.value?.toLowerCase().trim();

        if (value && valueSet.has(value)) {
          hasDuplicate = true;
        }
        valueSet.add(value);
      }

      if (hasDuplicate) {
        return {duplicateValue: true};
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
    if (!this.attributeAddToggle) {
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
      error: () => {
        //TODO:
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
    this.linkedProducts.clear();
    this.productService.getProductsForAttribute(attributeId).subscribe(products => {
      products.sort((a, b) => a.id - b.id);
      this.linkedProducts.set(attributeId, products);
      this.unexpandAll();
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
    ).subscribe({
        next: (result) => {
          result.values.sort((a, b) => a.id - b.id);
          this.unexpandAll();
          this.attributeValue = '';
          this.expandedAttributeIdAttributeValues = attributeId;
          this.attributeValues = result.values;
        }, error: () => {
          //TODO:
        }
      }
    );
  }


  isAttributeValueLinkedToVariants(attributeValueId: number) {
    return this.linkedAttributeValues.get(attributeValueId) ?? true;
  }

  deleteOrExpandAttributeValue(attributeId: number, attributeValueId: number) {
    if (this.expandedAttributeValueIdDelete === attributeValueId) {
      this.expandedAttributeValueIdDelete = null;
      return;
    }
    if (this.isAttributeValueLinkedToVariants(attributeValueId)) {
      this.fetchLinkedVariants(attributeId, attributeValueId);
      return;
    }
    this.productService.deleteAttributeValue(attributeId, attributeValueId).subscribe(() => {
      this.fetchAttributeValues(attributeId);
    });
  }

  private fetchLinkedVariants(attributeId: number, attributeValueId: number) {
    this.productService.getVariantsForAttributeValue(attributeId, attributeValueId).subscribe(variants => {
      variants.sort((a, b) => a.id - b.id);
      const canDeleteObservables: Observable<[number, boolean]>[] = variants.map(variant =>
        this.productService.canDeleteVariant(variant.productId, variant.sku).pipe(
          map(canDelete => [variant.id, canDelete] as [number, boolean])
        )
      );

      forkJoin(canDeleteObservables).subscribe(results => {
        this.linkedVariants.clear();
        this.variantsToRemovable.clear();
        results.forEach(([id, canDelete]) => {
          this.variantsToRemovable.set(id, canDelete);
        });
        this.linkedVariants.set(attributeValueId, variants);
        this.expandedAttributeValueIdEdit = null;
        this.expandedAttributeValueIdDelete = attributeValueId;
      });
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
          this.fetchAttributeValues(attributeId);
        } else {
          this.fetchLinkedVariants(attributeId, attributeValueId);
        }
      }, error: () => {
        //TODO:
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


  canDeleteVariant(variantId: number) {
    return this.variantsToRemovable.get(variantId);
  }

  private handleAttributeValueEdit(attributeValue: IProductAttributeValue) {
    this.productService.getVariantsForAttributeValue(attributeValue.attributeId, attributeValue.id).subscribe(variants => {
      if (variants && variants.length > 0) {
        const canDeleteObservables: Observable<[number, boolean]>[] = variants.map(variant =>
          this.productService.canDeleteVariant(variant.productId, variant.sku).pipe(
            map(canDelete => [variant.id, canDelete] as [number, boolean])
          )
        );

        forkJoin(canDeleteObservables).subscribe(results => {
          this.variantsToRemovable.clear();
          results.forEach(([id, canDelete]) => {
            this.variantsToRemovable.set(id, canDelete);
          });

          this.linkedVariants.set(attributeValue.id, variants);
          this.initAttributeValueEditForm(attributeValue);
          this.expandedAttributeValueIdDelete = null;
          this.expandedAttributeValueIdEdit = attributeValue.id;
        });
      } else {
        this.linkedVariants.clear();
        this.variantsToRemovable.clear();

        this.initAttributeValueEditForm(attributeValue);
        this.expandedAttributeValueIdDelete = null;
        this.expandedAttributeValueIdEdit = attributeValue.id;
      }
    });
  }


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


  submitAttributeEditForm() {
    this.productService.updateAttribute(this.attributeEditForm.value).subscribe({
      next: () => {
        this.fetchAttributes()
      },
      error: () => {
        //TODO:
      }
    })
  }

  toggleAttributeEdit(attribute: IProductAttribute) {
    if (this.expandedAttributeIdEdit === attribute.id) {
      this.expandedAttributeIdEdit = null;
      return;
    } else {
      this.handleAttributeEdit(attribute);
    }
  }

  private handleAttributeEdit(attribute: IProductAttribute) {
    this.productService.getProductsForAttribute(attribute.id).subscribe(products => {
      this.linkedProducts.set(attribute.id, products);
      this.initAttributeEditForm(attribute);
      this.unexpandAll();
      this.expandedAttributeIdEdit = attribute.id;
    });
  }

  private initAttributeEditForm(attribute: IProductAttribute) {
    this.attributeEditForm = this.fb.group({
      id: [attribute.id, Validators.required],
      name: [attribute.name, Validators.required]
    })
  }

  private unexpandAll() {
    this.expandedAttributeIdEdit = null;
    this.expandedAttributeIdDelete = null;
    this.expandedAttributeIdAttributeValues = null;
    this.expandedAttributeValueIdDelete = null;
    this.expandedAttributeValueIdEdit = null;
  }
}
