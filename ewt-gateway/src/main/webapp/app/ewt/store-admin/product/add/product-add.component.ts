import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ProductService} from "../service/product.service";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {IProductCategory} from "../model/product-category.model";
import {IProductAttribute} from "../model/product-attribute.model";
import {IProductAttributeValue} from "../model/product-attribute-value.model";
import {forkJoin} from "rxjs";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

@Component({
  selector: 'ewt-store-admin-product-add',
  templateUrl: 'product-add.component.html',
  styleUrls: ['product-add.component.scss']
})
export class ProductAddComponent implements OnInit {

  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  isLoading = false;

  categoriesOption: IProductCategory[] = [];
  attributesOption: IProductAttribute[] = [];
  attributeValuesOptions: Map<number, IProductAttributeValue[]> = new Map();

  selectedAttributes: IProductAttribute[] = [];
  selectedAttributeValues: IProductAttributeValue[] = [];

  images: string[] = [];

  productForm!: FormGroup;

  constructor(private productService: ProductService, private fb: FormBuilder) {

  }

  submitForm() {
    console.log(this.productForm.value);
  }

  ngOnInit(): void {
    this.initForm();
    this.fetchCategoriesAndAttributes();
  }

  private fetchCategoriesAndAttributes() {
    forkJoin({
      categories: this.productService.getCategories(),
      attributes: this.productService.getAttributes(),
    }).subscribe(result => {
      const {categories, attributes} = result;
      this.categoriesOption = categories;
      this.attributesOption = attributes;
      this.isLoading = false;
    });
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      categories: [null, Validators.required],
      name: [null, Validators.required],
      description: [null, Validators.maxLength(500)],
      attributes: [null, Validators.required],
      variants: this.fb.array([
        this.fb.group({
          price: [null, Validators.required],
          stock: [null, Validators.required],
          attributeValues: this.fb.array([]),
          images: this.fb.array([])
        })
      ])
    });

    this.addFormListeners();
  }

  private createVariantFormGroup(): FormGroup {
    const attributeValuesArray = this.fb.array(
      (this.productForm.get('attributes')?.value || []).map(() => this.fb.control(null, Validators.required))
    );

    return this.fb.group({
      price: [null, Validators.required],
      stock: [null, Validators.required],
      attributeValues: attributeValuesArray,
      images: this.fb.array([])
    });
  }

  private addFormListeners() {
    this.productForm.get('attributes')?.valueChanges.subscribe(attributes => {
      this.onAttributeSelectionChange(attributes);
    })
  }

  onAttributeSelectionChange(selectedAttributes: IProductAttribute[]): void {
    this.selectedAttributes = selectedAttributes;

    const variants = this.productForm.get('variants') as FormArray;

    for (const variant of variants.controls) {
      const attributeValuesArray = variant.get('attributeValues') as FormArray;

      for (let i = attributeValuesArray.length - 1; i >= 0; i--) {
        const existingAttrId = attributeValuesArray.at(i).value ? attributeValuesArray.at(i).value.attributeId : null;
        if (!selectedAttributes.some(attr => attr.id === existingAttrId)) {
          attributeValuesArray.removeAt(i);
        }
      }

      for (const attr of selectedAttributes) {
        if (!attributeValuesArray.value.some((val: IProductAttributeValue) => val && val.attributeId === attr.id)) {
          const attributeValueControl = this.fb.control(null, Validators.required);
          attributeValuesArray.push(attributeValueControl);
        }

        if (!this.attributeValuesOptions.has(attr.id)) {
          this.productService.getAttributeValues(attr.id).subscribe(data => {
            this.attributeValuesOptions.set(attr.id, data);
          });
        }
      }
    }
  }

  onAttributeValueSelectionChange(selectedAttributeValue: IProductAttributeValue, variantIndex: number, attributeIndex: number): void {
    const control = this.getAttributeValueControl(variantIndex, attributeIndex);
    control.setValue(selectedAttributeValue);
  }

  addVariant(): void {
    this.variants.push(this.createVariantFormGroup());
  }

  removeVariant(): void {
    if (this.variants.length > 1) {
      this.variants.removeAt(this.variants.length - 1);
    }
  }

  onImageDragOver(event: Event) {
    event.preventDefault();
  }

  onImageDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.previewFiles(files);
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.previewFiles(input.files);
    }
  }

  previewFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const src = event.target?.result as string;
          this.images.push(src);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.images, event.previousIndex, event.currentIndex);
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  get attributeValues(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  getAttributeValueControl(variantIndex: number, attributeIndex: number): FormControl {
    const variantFormGroup = this.variants.at(variantIndex) as FormGroup;
    const attributeValueFormArray = variantFormGroup.get('attributeValues') as FormArray;
    return attributeValueFormArray.at(attributeIndex) as FormControl;
  }
}
