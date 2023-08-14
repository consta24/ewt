package ewt.msvc.product.repository.bridge;

import ewt.msvc.product.domain.bridge.ProductCategoryBridge;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ProductCategoryBridgeRepository extends R2dbcRepository<ProductCategoryBridge, Long> {

    Flux<ProductCategoryBridge> findAllByProductId(Long productId);

    Flux<ProductCategoryBridge> findAllByCategoryId(Long categoryId);

    Flux<Void> deleteAllByProductId(Long productId);
}
