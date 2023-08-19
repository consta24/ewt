import {Component, OnInit} from "@angular/core";
import {ProductService} from "../../service/product.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {forkJoin, switchMap} from "rxjs";
import {map, tap} from "rxjs/operators";
import {IProduct} from "../../model/product.model";
import {Router} from "@angular/router";
import {IProductCategory} from "../../model/product-category.model";

@Component({
  selector: 'ewt-store-admin-categories-list',
  templateUrl: 'categories-list.component.html'
})
export class CategoriesListComponent implements OnInit {

  isLoading = true;
  categories: IProductCategory[] = [];
  categoryAddToggle = false;

  expandedCategoryIdEdit: number | null = null;

  categoryAddForm!: FormGroup;
  categoryEditForm!: FormGroup;


  expandedCategoryIdDelete: number | null = null;
  linkedProducts = new Map<number, IProduct[]>();

  private linkedCategories: Map<number, boolean> = new Map();

  constructor(private router: Router, private fb: FormBuilder, private productService: ProductService) {

  }

  ngOnInit(): void {
    this.fetchCategories();
  }

  private fetchCategories() {
    this.expandedCategoryIdEdit = null;
    this.expandedCategoryIdDelete = null;
    this.linkedProducts.clear();

    this.productService.getCategories().pipe(
      switchMap(categories => {
        const linkedCheckObservables = categories.map(category =>
          this.productService.isCategoryLinkedToProducts(category.id!).pipe(
            tap(isLinked => this.linkedCategories.set(category.id!, isLinked))
          )
        );

        return forkJoin(linkedCheckObservables).pipe(map(() => categories));
      })
    ).subscribe(categories => {
      categories.sort((a, b) => a.id - b.id);
      this.categories = categories;
      this.isLoading = false;
    });
  }

  private initAddForm() {
    this.categoryAddForm = this.fb.group({
      name: [null, Validators.required],
      description: [null],
    });
  }


  toggleCategoryAdd() {
    if (!this.categoryAddToggle) {
      this.initAddForm();
    }
    this.categoryAddToggle = !this.categoryAddToggle;
  }

  submitAddForm() {
    this.productService.addCategory(this.categoryAddForm.value).subscribe({
      next: () => {
        this.categoryAddToggle = false;
        this.initAddForm();
        this.fetchCategories();
      },
      error: () => {
        //
      }
    });
  }

  submitEditForm() {
    console.log(this.categoryEditForm.value);
    this.productService.updateCategory(this.categoryEditForm.value).subscribe({
      next: () => {
        this.fetchCategories();
      },
      error: () => {
        //TODO:
      }
    })
  }

  isCategoryLinkedToProducts(categoryId: number) {
    return this.linkedCategories.get(categoryId) ?? true;
  }

  deleteOrExpandCategory(categoryId: number) {
    if (this.expandedCategoryIdDelete === categoryId) {
      this.expandedCategoryIdDelete = null;
      return;
    }
    this.expandedCategoryIdEdit = null;
    if (this.isCategoryLinkedToProducts(categoryId)) {
      this.fetchLinkedProducts(categoryId);
      return;
    }
    this.productService.deleteCategory(categoryId).subscribe(() => {
      this.fetchCategories();
    });
  }

  private fetchLinkedProducts(categoryId: number) {
    this.linkedProducts.clear();
    this.productService.getProductsForCategory(categoryId).subscribe(products => {
      this.linkedProducts.set(categoryId, products);
      this.expandedCategoryIdDelete = categoryId;
    });
  }

  deleteProduct(attributeId: number, productId: number) {
    this.productService.deleteProduct(productId).subscribe(() => {
      if (this.linkedProducts.size === 1) {
        this.fetchCategories();
      } else {
        this.fetchLinkedProducts(attributeId);
      }
    })
  }

  goToEdit(id: number) {
    this.router.navigate(['store-admin/products/edit', id], {queryParams: {source: 'attributes'}}).then();
  }

  toggleEdit(category: IProductCategory) {
    if (this.expandedCategoryIdEdit === category.id) {
      this.expandedCategoryIdEdit = null;
      return;
    }
    this.handleToggleEdit(category);
  }

  private handleToggleEdit(category: IProductCategory) {
    this.linkedProducts.clear();
    this.productService.getProductsForCategory(category.id).subscribe(products => {
      this.linkedProducts.set(category.id, products);
      this.initEditForm(category);
      this.expandedCategoryIdDelete = null;
      this.expandedCategoryIdEdit = category.id;
    });
  }

  private initEditForm(category: IProductCategory) {
    this.categoryEditForm = this.fb.group({
      id: [category.id, Validators.required],
      name: [category.name, Validators.required],
      description: [category.description],
    });
  }
}
