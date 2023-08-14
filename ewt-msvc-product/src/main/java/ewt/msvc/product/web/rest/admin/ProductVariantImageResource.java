package ewt.msvc.product.web.rest.admin;

import ewt.msvc.product.service.ProductVariantImageService;
import ewt.msvc.product.service.dto.ProductVariantImageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/store-admin/product/{productId}/variant/{sku}/images")
@RequiredArgsConstructor
public class ProductVariantImageResource {

    private final ProductVariantImageService productVariantImageService;

    @GetMapping
    public Flux<ProductVariantImageDTO> getAllProductVariantImages(@PathVariable Long productId,
                                                                   @PathVariable String sku) {
        return productVariantImageService.getAllProductVariantImages(sku);
    }

    @PostMapping
    public Mono<ProductVariantImageDTO> saveProductVariantImage(@PathVariable Long productId,
                                                                @PathVariable String sku,
                                                                @RequestPart("productVariantImage") ProductVariantImageDTO productVariantImageDTO,
                                                                @RequestPart("image") MultipartFile file) {
        return productVariantImageService.saveProductVariantImage(productVariantImageDTO, file);
    }
}
