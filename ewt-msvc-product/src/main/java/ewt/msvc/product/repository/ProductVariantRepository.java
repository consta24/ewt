package ewt.msvc.product.repository;

import ewt.msvc.product.domain.ProductVariant;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ProductVariantRepository extends R2dbcRepository<ProductVariant, String> {
    Flux<ProductVariant> findAllByProductId(Long productId);

    Mono<ProductVariant> findBySku(String sku);
}
