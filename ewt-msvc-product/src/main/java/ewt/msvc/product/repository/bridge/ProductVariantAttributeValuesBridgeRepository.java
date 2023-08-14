package ewt.msvc.product.repository.bridge;

import ewt.msvc.product.domain.bridge.ProductVariantAttributeValuesBridge;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ProductVariantAttributeValuesBridgeRepository extends R2dbcRepository<ProductVariantAttributeValuesBridge, Long> {

    Flux<ProductVariantAttributeValuesBridge> findAllBySku(String sku);

    Flux<ProductVariantAttributeValuesBridge> findAllByAttributeValueId(Long attributeValueId);

    Flux<Void> deleteAllBySku(String sku);
}
