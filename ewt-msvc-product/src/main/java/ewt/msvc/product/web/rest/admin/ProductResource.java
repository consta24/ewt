package ewt.msvc.product.web.rest.admin;


import ewt.msvc.product.service.ProductService;
import ewt.msvc.product.service.dto.ProductDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.PaginationUtil;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/store-admin/product")
@RequiredArgsConstructor
public class ProductResource {

    private static final List<String> ALLOWED_ORDERED_PROPERTIES = List.of("id");

    private final ProductService productService;

    @GetMapping("/sku/{sku}")
    public Mono<ProductDTO> getProductForSku(@PathVariable String sku) {
        return this.productService.getProductForSku(sku);
    }

    @GetMapping("/{id}")
    public Mono<ProductDTO> getProduct(@PathVariable Long id) {
        return this.productService.getProduct(id);
    }

    @GetMapping
    public Mono<ResponseEntity<Flux<ProductDTO>>> getAllProducts(ServerHttpRequest request,
                                                                 Pageable pageable) {
        if (!onlyContainsAllowedProperties(pageable)) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return productService.count()
                .map(total -> new PageImpl<>(new ArrayList<>(), pageable, total))
                .map(page -> PaginationUtil.generatePaginationHttpHeaders(UriComponentsBuilder.fromHttpRequest(request), page))
                .map(headers -> ResponseEntity.ok().headers(headers).body(productService.getAllProducts(pageable)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ProductDTO> addProduct(@RequestBody ProductDTO productDTO) {
        return productService.saveProduct(productDTO);
    }

    @PutMapping("/{id}")
    public Mono<ProductDTO> updateProduct(@PathVariable Long id,
                                          @RequestBody ProductDTO productDTO) {
        return productService.updateProduct(id, productDTO);
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id);
    }

    private boolean onlyContainsAllowedProperties(Pageable pageable) {
        return pageable.getSort().stream().map(Sort.Order::getProperty).allMatch(ALLOWED_ORDERED_PROPERTIES::contains);
    }
}
