import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {IProduct} from "../../../store-admin/product/model/product.model";
import {ProductService} from "../../../store-admin/product/service/product.service";
import {IProductVariant} from "../../../store-admin/product/model/product-variant.model";
import {IProductAttributeValue} from "../../../store-admin/product/model/product-attribute-value.model";
import {CartService} from "../../cart/service/cart.service";
import {CartCookieService} from "../../../../shared/cookie/cart-cookie.service";
import {ProductImageService} from "../../../../shared/product/product-image.service";
import {ProductViewReviewModalComponent} from "./review-modal/product-view-review-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ProductViewQuestionModalComponent} from "./question-modal/product-view-question-modal.component";

@Component({
  selector: 'ewt-customer-product-view',
  templateUrl: 'product-view.component.html',
  styleUrls: ['product-view.component.scss']
})
export class ProductViewComponent implements OnInit {

  isLoading = true;
  product!: IProduct;

  imagesMap: Map<string, string[]> = new Map();
  images: string[] = [];
  attributeValuesMap: { [key: number]: Set<string> } = {};
  selectedAttributes: { [key: number]: string } = {};

  currentImage: string = '';
  currentVariant!: IProductVariant;

  quantity = 1;


  constructor(private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private productService: ProductService,
              private cartService: CartService,
              private cartCookieService: CartCookieService,
              private productImageService: ProductImageService) {

  }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.fetchProduct(Number(productId));
    } else {
      this.router.navigate(["/products"]).then();
    }
  }

  fetchProduct(productId: number) {
    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        product.productAttributes.sort((a, b) => a.id - b.id);
        product.productVariants.forEach(variant => variant.variantAttributeValues.sort((a, b) => a.id - b.id))
        this.product = product;
        this.currentVariant = this.product.productVariants[0];
        this.initSelectedAttributes();
        this.initializeAttributeValuesMap();
        this.mapSkuToImages();
      }
    })
  }

  private initSelectedAttributes(): void {
    if (this.currentVariant && this.currentVariant.variantAttributeValues) {
      this.selectedAttributes = {};
      for (const attributeValue of this.currentVariant.variantAttributeValues) {
        if (!this.selectedAttributes[attributeValue.attributeId]) {
          this.selectedAttributes[attributeValue.attributeId] = attributeValue.value;
        }
      }
    }
  }

  private mapSkuToImages(): void {
    this.productImageService.getImagesForProduct(this.product).subscribe(skuImagesMap => {
      this.imagesMap = skuImagesMap;
      this.images = [...skuImagesMap.values()].reduce((acc, val) => acc.concat(val), []);
      const firstImage = this.imagesMap.get(this.currentVariant.sku);
      this.currentImage = firstImage ? firstImage[0] : '';
      this.isLoading = false;
    });
  }


  initializeAttributeValuesMap() {
    for (const variant of this.product.productVariants) {
      for (const value of variant.variantAttributeValues) {
        if (!this.attributeValuesMap[value.attributeId]) {
          this.attributeValuesMap[value.attributeId] = new Set<string>();
        }
        this.attributeValuesMap[value.attributeId].add(value.value);
      }
    }
  }


  selectAttributeValue(attributeId: number, selectedValue: string) {
    this.selectedAttributes[attributeId] = selectedValue;
    this.selectVariant();
  }

  isSelectedAttributeValue(attributeId: number, value: string): boolean {
    return this.selectedAttributes[attributeId] === value;
  }


  selectVariant() {
    const variant = this.product.productVariants.find(variant =>
      Object.keys(this.selectedAttributes).every(key => {
        const attributeId = +key;
        return variant.variantAttributeValues.some(
          (value: IProductAttributeValue) => value.attributeId === attributeId && value.value === this.selectedAttributes[attributeId]
        )
      })
    );
    if (variant) {
      this.currentVariant = variant;
      const skuImages = this.imagesMap.get(this.currentVariant.sku);
      if (skuImages) {
        this.currentImage = skuImages[0]
      }
    }
  }

  prevImage(): void {
    const idx = this.images.indexOf(this.currentImage);
    if (idx > 0) {
      this.currentImage = this.images[idx - 1];
    } else {
      this.currentImage = this.images[this.images.length - 1];
    }
  }

  nextImage(): void {
    const idx = this.images.indexOf(this.currentImage);
    if (idx < this.images.length - 1) {
      this.currentImage = this.images[idx + 1];
    } else {
      this.currentImage = this.images[0];
    }
  }

  addToCart() {
    this.cartCookieService.addToCart(this.currentVariant.sku, this.quantity);
    this.cartService.toggleCart();
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity = this.quantity - 1;
    }
  }

  incrementQuantity() {
    if (this.quantity < this.currentVariant.stock) {
      this.quantity = this.quantity + 1;
    }
  }

  isNotifyExpanded = false;
  notifyEmailInput = '';
  isDescriptionExpanded = false;
  isDeliveryAndReturnsExpanded = false;

  toggleNotify() {
    this.isNotifyExpanded = !this.isNotifyExpanded;
  }

  submitNotify() {
    if (this.notifyEmailInput && this.isValidEmail(this.notifyEmailInput)) {
      this.isNotifyExpanded = !this.isNotifyExpanded;
      this.notifyEmailInput = '';
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  toggleDeliveryAndReturns() {
    this.isDeliveryAndReturnsExpanded = !this.isDeliveryAndReturnsExpanded;
  }

  handleRatingChange(event: any) {

  }

  openReviewModal() {
    this.modalService.open(ProductViewReviewModalComponent, { centered: true });
  }

  openQuestionModal() {
    this.modalService.open(ProductViewQuestionModalComponent, { centered: true });
  }
}
