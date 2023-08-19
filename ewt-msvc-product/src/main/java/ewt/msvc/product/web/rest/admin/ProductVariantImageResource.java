package ewt.msvc.product.web.rest.admin;


import ewt.msvc.product.service.ProductVariantImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Base64;

@RestController
@RequestMapping("/api/store-admin/product/{productId}/variant/{sku}/image")
@RequiredArgsConstructor
public class ProductVariantImageResource {

    private final ProductVariantImageService productVariantImageService;

    @GetMapping
    public Mono<ResponseEntity<byte[]>> getProductVariantImageByRef(@PathVariable Long productId,
                                                                    @PathVariable String sku,
                                                                    @RequestParam String ref) {
        return productVariantImageService.getProductVariantImageByRef(ref)
                .map(dataUri -> {
                    String[] parts = dataUri.split(";base64,");
                    if (parts.length != 2) {
                        return ResponseEntity.badRequest().build();
                    }
                    byte[] imageBytes = Base64.getDecoder().decode(parts[1]);
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.parseMediaType(parts[0].substring(5)));
                    return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
                });
    }

}
