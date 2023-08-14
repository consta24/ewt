package ewt.msvc.product.repository;

import ewt.msvc.product.domain.ProductVariantImage;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ProductVariantImageRepository extends R2dbcRepository<ProductVariantImage, Long> {

    Flux<ProductVariantImage> findAllBySku(String sku);
}
