package ewt.msvc.product.web.rest.admin;


import ewt.msvc.product.service.ProductVariantImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/store-admin/product/{productId}/variant/{sku}/image")
@RequiredArgsConstructor
public class ProductVariantImageResource {

    private final ProductVariantImageService productVariantImageService;

    @GetMapping
    public Mono<byte[]> getProductVariantImageByRef(@PathVariable Long productId,
                                                    @PathVariable String sku,
                                                    @RequestParam String ref) {
        return productVariantImageService.getProductVariantImageByRef(ref);
    }
}
