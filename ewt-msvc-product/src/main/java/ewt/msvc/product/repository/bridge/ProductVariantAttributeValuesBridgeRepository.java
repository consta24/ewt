package ewt.msvc.product.repository.bridge;

import ewt.msvc.product.domain.bridge.ProductVariantAttributeValuesBridge;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ProductVariantAttributeValuesBridgeRepository extends R2dbcRepository<ProductVariantAttributeValuesBridge, Long> {

    @Query("SELECT * FROM ewt_product.ewt_product.product_variant_attribute_values_bridge WHERE sku = :sku")
    Flux<ProductVariantAttributeValuesBridge> findAllBySku(String sku);

    @Query("SELECT * FROM ewt_product.ewt_product.product_variant_attribute_values_bridge WHERE attribute_value_id = :attributeValueId")
    Flux<ProductVariantAttributeValuesBridge> findAllByAttributeValueId(Long attributeValueId);
}
