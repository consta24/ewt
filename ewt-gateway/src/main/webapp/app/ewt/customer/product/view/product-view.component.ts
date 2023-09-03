import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {IProduct} from "../../../store-admin/product/model/product.model";
import {ProductService} from "../../../store-admin/product/service/product.service";
import {IProductVariant} from "../../../store-admin/product/model/product-variant.model";
import {IProductAttributeValue} from "../../../store-admin/product/model/product-attribute-value.model";
import {CartDrawerService} from "../../cart/service/cart-drawer.service";
import {ProductImageService} from "../../../../shared/product/product-image.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {CartService} from "../../cart/service/cart.service";
import {FeedbackService} from "../../feedback/service/feedback.service";
import {IFeedbackReviewInfo} from "../../feedback/model/feedback-review-info.model";

@Component({
  selector: 'ewt-customer-product-view',
  templateUrl: 'product-view.component.html',
})
export class ProductViewComponent implements OnInit {

  isLoading = true;
  reviewInfo!: IFeedbackReviewInfo
  product!: IProduct;

  imagesMap: Map<string, string[]> = new Map();
  images: string[] = [];
  attributeValuesMap: { [key: number]: Set<string> } = {};
  selectedAttributes: { [key: number]: string } = {};

  currentImage: string = '';
  currentVariant!: IProductVariant;

  quantity = 1;

  isNotifyExpanded = false;
  notifyEmailInput = '';

  isDescriptionExpanded = false;
  isDeliveryAndReturnsExpanded = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private productService: ProductService,
              private cartService: CartService,
              private cartDrawerService: CartDrawerService,
              private productImageService: ProductImageService,
              private feedbackService: FeedbackService) {
  }

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('productId'));
    if (!isNaN(productId)) {
      this.fetchProduct(productId);
      this.fetchReviewInfo(productId);
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

  private fetchReviewInfo(productId: number) {
    this.feedbackService.getReviewInfoForProduct(productId).subscribe({
      next: (reviewInfo) => {
        this.reviewInfo = reviewInfo;
      },
      error: () => {
        //TODO:
      }
    })
  }

  private initSelectedAttributes() {
    if (this.currentVariant && this.currentVariant.variantAttributeValues) {
      this.selectedAttributes = {};
      for (const attributeValue of this.currentVariant.variantAttributeValues) {
        if (!this.selectedAttributes[attributeValue.attributeId]) {
          this.selectedAttributes[attributeValue.attributeId] = attributeValue.value;
        }
      }
    }
  }

  private mapSkuToImages() {
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
    this.cartService.addToCart(this.currentVariant.sku, this.quantity).subscribe({
      next: () => {
        this.cartDrawerService.toggleCart();
      }, error: () => {
        //TODO
      }
    })
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


  toggleNotify() {
    this.isNotifyExpanded = !this.isNotifyExpanded;
  }

  submitNotify() {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (this.notifyEmailInput && emailRegex.test(this.notifyEmailInput)) {
      this.isNotifyExpanded = !this.isNotifyExpanded;
      this.notifyEmailInput = '';
    }
  }

  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  toggleDeliveryAndReturns() {
    this.isDeliveryAndReturnsExpanded = !this.isDeliveryAndReturnsExpanded;
  }
}
