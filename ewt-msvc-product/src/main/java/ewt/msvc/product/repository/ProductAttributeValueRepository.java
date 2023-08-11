package ewt.msvc.product.repository;

import ewt.msvc.product.domain.ProductAttributeValue;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ProductAttributeValueRepository extends R2dbcRepository<ProductAttributeValue, Long> {

    @Query("SELECT * FROM ewt_product.ewt_product.product_attribute_value WHERE attribute_id = :attributeId")
    Flux<ProductAttributeValue> findByAttributeId(Long attributeId);

    @Query("SELECT * FROM ewt_product.ewt_product.product_attribute_value WHERE id = :id AND attribute_id = :attributeId")
    Mono<ProductAttributeValue> findByIdAndAttributeId(Long id, Long attributeId);
}
