package ewt.msvc.product.repository.bridge;

import ewt.msvc.product.domain.bridge.ProductAttributeBridge;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ProductAttributeBridgeRepository extends R2dbcRepository<ProductAttributeBridge, Long> {

    @Query("SELECT * FROM ewt_product.ewt_product.product_attribute_bridge WHERE product_id = :productId")
    Flux<ProductAttributeBridge> findAllByProductId(Long productId);

    @Query("SELECT * FROM ewt_product.ewt_product.product_attribute_bridge WHERE attribute_id = :attributeId")
    Flux<ProductAttributeBridge> findAllByAttributeId(Long attributeId);

    @Query("DELETE FROM ewt_product.ewt_product.product_attribute_bridge WHERE product_id = :productId")
    Flux<Void> deleteByProductId(Long productId);
}
