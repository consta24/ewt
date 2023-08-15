package ewt.msvc.product.repository;

import ewt.msvc.product.domain.ProductAttributeValue;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ProductAttributeValueRepository extends R2dbcRepository<ProductAttributeValue, Long> {

    Flux<ProductAttributeValue> findAllByAttributeId(Long attributeId);

    Mono<ProductAttributeValue> findByIdAndAttributeId(Long id, Long attributeId);

    Flux<Void> deleteAllByAttributeId(Long attributeId);

    Mono<Boolean> existsByValueAndAttributeId(String value, Long attributeId);

    Mono<Boolean> existsByValueAndAttributeIdAndIdNot(String value, Long attributeId, Long id);
}
