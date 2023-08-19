package ewt.msvc.product.web.rest.admin;

import ewt.msvc.product.service.ProductCategoryService;
import ewt.msvc.product.service.dto.ProductCategoryDTO;
import ewt.msvc.product.service.dto.ProductDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/store-admin/product-category")
@RequiredArgsConstructor
public class ProductCategoryResource {

    private final ProductCategoryService productCategoryService;

    @GetMapping
    public Flux<ProductCategoryDTO> getAllProductCategories() {
        return productCategoryService.getAllProductCategories();
    }

    @GetMapping("/{id}/linked")
    public Mono<Boolean> isCategoryLinkedToProducts(@PathVariable Long id) {
        return productCategoryService.isCategoryLinkedToProducts(id);
    }

    @GetMapping("/{id}/products")
    public Flux<ProductDTO> getProductsForCategoryId(@PathVariable Long id) {
        return productCategoryService.getProductsForCategoryId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ProductCategoryDTO> addProductCategory(@RequestBody ProductCategoryDTO productCategoryDTO) {
        return productCategoryService.addProductCategory(productCategoryDTO);
    }

    @PutMapping("/{id}")
    public Mono<ProductCategoryDTO> updateProductCategory(@PathVariable Long id,
                                                          @RequestBody ProductCategoryDTO productCategoryDTO) {
        return productCategoryService.updateProductCategory(id, productCategoryDTO);
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteProductCategory(@PathVariable Long id) {
        return productCategoryService.deleteProductCategory(id);
    }
}

