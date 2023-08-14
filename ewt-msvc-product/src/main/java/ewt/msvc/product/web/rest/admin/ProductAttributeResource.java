package ewt.msvc.product.web.rest.admin;

import ewt.msvc.product.service.ProductAttributeService;
import ewt.msvc.product.service.dto.ProductAttributeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/store-admin/product-attribute")
@RequiredArgsConstructor
public class ProductAttributeResource {

    private final ProductAttributeService productAttributeService;

    @GetMapping
    public Flux<ProductAttributeDTO> getAllAttributes() {
        return productAttributeService.getAllAttributes();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ProductAttributeDTO> addAttribute(@RequestBody ProductAttributeDTO productAttributeDTO) {
        return productAttributeService.addAttribute(productAttributeDTO);
    }

    @PutMapping("/{id}")
    public Mono<ProductAttributeDTO> updateAttribute(@PathVariable Long id,
                                                     @RequestBody ProductAttributeDTO productAttributeDTO) {
        return productAttributeService.updateAttribute(id, productAttributeDTO);
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteAttribute(@PathVariable Long id) {
        return productAttributeService.deleteAttribute(id);
    }
}
