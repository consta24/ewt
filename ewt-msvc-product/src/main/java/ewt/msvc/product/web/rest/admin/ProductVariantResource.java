package ewt.msvc.product.web.rest.admin;


import ewt.msvc.product.service.ProductVariantService;
import ewt.msvc.product.service.dto.ProductVariantDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/store-admin/product/{productId}/variant")
@RequiredArgsConstructor
public class ProductVariantResource {

    private final ProductVariantService productVariantService;

    @GetMapping
    public Flux<ProductVariantDTO> getAllProductVariants(@PathVariable Long productId) {
        return productVariantService.getAllProductVariants(productId);
    }

    @GetMapping("{sku}/canDelete")
    public Mono<Boolean> canDeleteVariant(@PathVariable Long productId) {
        return productVariantService.canDeleteVariant(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ProductVariantDTO> saveProductVariant(@PathVariable Long productId,
                                                      @RequestBody ProductVariantDTO productVariantDTO) {
        return productVariantService.saveProductVariant(productId, productVariantDTO);
    }

    @DeleteMapping("{sku}")
    public Mono<Void> deleteProductVariant(@PathVariable Long productId,
                                           @PathVariable String sku) {
        return productVariantService.deleteProductVariant(sku);
    }
}
