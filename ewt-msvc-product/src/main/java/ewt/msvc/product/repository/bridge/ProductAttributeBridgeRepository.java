package ewt.msvc.product.repository.bridge;

import ewt.msvc.product.domain.bridge.ProductAttributeBridge;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ProductAttributeBridgeRepository extends R2dbcRepository<ProductAttributeBridge, Long> {

    Flux<ProductAttributeBridge> findAllByProductId(Long productId);

    Flux<ProductAttributeBridge> findAllByAttributeId(Long attributeId);

    Flux<Void> deleteAllByProductId(Long productId);
}
