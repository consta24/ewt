import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../service/product.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { IProductCategory } from '../model/product-category.model';
import { IProductAttribute } from '../model/product-attribute.model';
import { IProductAttributeValue } from '../model/product-attribute-value.model';
import { forkJoin } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct } from '../model/product.model';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'ewt-store-admin-product-add',
  templateUrl: 'product-add.component.html',
  styleUrls: ['product-add.component.scss'],
})
export class ProductAddComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  editor: Editor = new Editor();

  isLoading = true;

  fromAttributes = false;

  categoriesOption: IProductCategory[] = [];
  attributesOption: IProductAttribute[] = [];
  attributeValuesOptions: Map<number, IProductAttributeValue[]> = new Map();

  selectedAttributes: IProductAttribute[] = [];

  variantImages: string[][] = [];

  editedProduct!: IProduct;

  productForm!: FormGroup;

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private productService: ProductService) {}

  submitForm() {
    this.updateFormWithSequencedImages();

    // this.productForm.value.description = JSON.stringify(this.productForm.value.description);
    this.productForm.value.description = this.productForm.value.description.toString();
    if (!this.editedProduct) {
      this.productService.addProduct(this.productForm.value).subscribe({
        next: () => {
          this.router.navigate(['/store-admin/products']).then();
        },
        error: () => {
          //
        },
      });
    } else {
      console.log(this.productForm.value);
      this.productService.updateProduct(this.productForm.value).subscribe({
        next: () => {
          this.goBack();
        },
        error: () => {
          //
        },
      });
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['source'] === 'attributes') {
        this.fromAttributes = true;
      }
    });
    this.initForm();
    this.fetchCategoriesAndAttributes();
    this.updateForm();
  }

  private fetchCategoriesAndAttributes() {
    forkJoin({
      categories: this.productService.getCategories(),
      attributes: this.productService.getAttributes(),
    }).subscribe(result => {
      const { categories, attributes } = result;
      this.categoriesOption = categories;
      this.attributesOption = attributes;
    });
  }

  private initForm(): void {
    this.productForm = this.fb.group(
      {
        id: [null],
        productCategories: [null, Validators.required],
        name: [null, Validators.required],
        description: [null, Validators.maxLength(500)],
        productAttributes: [null, Validators.required],
        productVariants: this.fb.array([
          this.fb.group({
            id: [null],
            sku: [null],
            price: [null, Validators.required],
            stock: [null, Validators.required],
            variantAttributeValues: this.fb.array([]),
            variantImages: this.fb.array([]),
          }),
        ]),
      },
      { validators: this.uniqueCombinationOfAttributes }
    );

    this.addFormListeners();
  }

  private uniqueCombinationOfAttributes(control: AbstractControl): ValidationErrors | null {
    const formArray = control.get('productVariants') as FormArray;
    const allCombinations: string[] = [];

    formArray.controls.forEach(fg => {
      const attributesArray = (fg.get('variantAttributeValues') as FormArray).controls;
      const attributesValues: (IProductAttributeValue | null)[] = attributesArray.map(c => c.value);

      if (attributesValues.some(v => v === null)) {
        return;
      }

      const combination = attributesValues.map(av => av!.value).join('-');
      allCombinations.push(combination);
    });

    const hasDuplicates = allCombinations.some((combo, index, array) => array.indexOf(combo) !== index);
    if (hasDuplicates) {
      return { duplicateCombination: true };
    }
    return null;
  }

  private updateForm() {
    const url = this.route.snapshot.url;
    if (url[0].path === 'edit') {
      const productId = Number(url[1].path);
      this.productService.getProduct(productId).subscribe({
        next: product => {
          this.editedProduct = product;

          this.productForm.patchValue({
            id: product.id,
            productCategories: product.productCategories,
            name: product.name,
            description: product.description,
            productAttributes: product.productAttributes,
          });

          const productVariantsControl = this.productForm.get('productVariants') as FormArray;
          productVariantsControl.clear();

          product.productVariants.forEach(variant => {
            const variantFormGroup = this.createVariantFormGroup();

            variantFormGroup.patchValue({
              id: variant.id,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
            });

            const attributeValuesArray = variantFormGroup.get('variantAttributeValues') as FormArray;

            while (attributeValuesArray.length < variant.variantAttributeValues.length) {
              attributeValuesArray.push(this.fb.group({ value: '' }));
            }

            while (attributeValuesArray.length > variant.variantAttributeValues.length) {
              attributeValuesArray.removeAt(attributeValuesArray.length - 1);
            }

            variant.variantAttributeValues.sort((a, b) => a.attributeId - b.attributeId);

            for (let i = 0; i < variant.variantAttributeValues.length; i++) {
              attributeValuesArray.at(i).patchValue(variant.variantAttributeValues[i]);
            }

            productVariantsControl.push(variantFormGroup);
          });

          this.setVariantImagesForProduct(product);
        },
        error: () => {
          this.router.navigate(['/store-admin/products/add']).then();
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  private setVariantImagesForProduct(product: IProduct) {
    product.productVariants.forEach((variant, variantIndex) => {
      if (!this.variantImages[variantIndex]) {
        this.variantImages[variantIndex] = [];
      }

      variant.variantImages.forEach(image => {
        const ref = image.ref;
        this.productService.getProductVariantImageByRef(product.id, variant.sku, ref).subscribe(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64Image = reader.result as string;

            this.variantImages[variantIndex].push(base64Image);

            const variantFormGroup = (this.productForm.get('productVariants') as FormArray).at(variantIndex) as FormGroup;
            const variantImagesFormArray = variantFormGroup.get('variantImages') as FormArray;

            variantImagesFormArray.push(this.fb.control(base64Image));
          };
        });
      });
    });
    this.isLoading = false;
  }

  private createVariantFormGroup(): FormGroup {
    const attributeValuesArray = this.fb.array(
      (this.productForm.get('productAttributes')?.value || []).map(() => this.fb.control(null, Validators.required))
    );

    return this.fb.group({
      id: [null],
      sku: [null],
      price: [null, Validators.required],
      stock: [null, Validators.required],
      variantAttributeValues: attributeValuesArray,
      variantImages: this.fb.array([]),
    });
  }

  private addFormListeners() {
    this.productForm.get('productAttributes')?.valueChanges.subscribe(attributes => {
      this.onAttributeSelectionChange(attributes);
    });
  }

  onAttributeSelectionChange(selectedAttributes: IProductAttribute[]): void {
    this.selectedAttributes = selectedAttributes;

    const variants = this.productForm.get('productVariants') as FormArray;

    for (const variant of variants.controls) {
      const attributeValuesArray = variant.get('variantAttributeValues') as FormArray;

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

        if (!this.attributeValuesOptions.has(attr.id!)) {
          this.productService.getAttributeValues(attr.id!).subscribe(data => {
            this.attributeValuesOptions.set(attr.id!, data);
          });
        }
      }
    }
  }

  addVariant(): void {
    this.productVariants.push(this.createVariantFormGroup());
  }

  removeVariant(): void {
    if (this.productVariants.length > 1) {
      this.productVariants.removeAt(this.productVariants.length - 1);
    }
  }

  onImageDragOver(event: Event) {
    event.preventDefault();
  }

  onImageDrop(event: DragEvent, variantIndex: number) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.previewFiles(files, variantIndex);
    }
  }

  onImagesSelected(event: Event, variantIndex: number) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.previewFiles(input.files, variantIndex);
    }
  }

  previewFiles(files: FileList, variantIndex: number) {
    if (!this.variantImages[variantIndex]) {
      this.variantImages[variantIndex] = [];
    }
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const src = event.target?.result as string;
          if (!this.variantImages[variantIndex].includes(src)) {
            this.variantImages[variantIndex].push(event.target?.result as string);
            this.getProductVariantImages(variantIndex).push(this.fb.control(src));
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onDrop(event: CdkDragDrop<string[]>, variantIndex: number) {
    moveItemInArray(this.variantImages[variantIndex], event.previousIndex, event.currentIndex);
  }

  removeImage(variantIndex: number, imageIndex: number): void {
    this.variantImages[variantIndex].splice(imageIndex, 1);
    this.getProductVariantImages(variantIndex).removeAt(imageIndex);
  }

  private updateFormWithSequencedImages() {
    for (let variantIndex = 0; variantIndex < this.variantImages.length; variantIndex++) {
      const imagesForVariant = this.variantImages[variantIndex];
      const sequencedImages: any[] = [];
      for (let seqIndex = 0; seqIndex < imagesForVariant.length; seqIndex++) {
        const sequencedImage = {
          sequence: seqIndex + 1,
          imageUrl: imagesForVariant[seqIndex],
        };
        sequencedImages.push(sequencedImage);
      }
      this.getProductVariantImages(variantIndex).clear();
      sequencedImages.forEach(img => {
        this.getProductVariantImages(variantIndex).push(
          this.fb.group({
            sequence: img.sequence,
            ref: img.imageUrl,
          })
        );
      });
    }
  }

  goBack() {
    if (this.fromAttributes) {
      this.router.navigate(['store-admin/products/attributes']).then();
    } else {
      this.router.navigate(['store-admin/products']).then();
    }
  }

  get productVariants(): FormArray {
    return this.productForm.get('productVariants') as FormArray;
  }

  getProductVariantImages(variantIndex: number) {
    return (this.productVariants.at(variantIndex) as FormGroup).controls['variantImages'] as FormArray;
  }

  getAttributeValueControl(variantIndex: number, attributeIndex: number): FormControl {
    const variantFormGroup = this.productVariants.at(variantIndex) as FormGroup;
    const attributeValueFormArray = variantFormGroup.get('variantAttributeValues') as FormArray;
    return attributeValueFormArray.at(attributeIndex) as FormControl;
  }
}
