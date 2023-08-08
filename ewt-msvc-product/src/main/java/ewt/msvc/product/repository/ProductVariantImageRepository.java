package ewt.msvc.product.repository;

import ewt.msvc.product.domain.ProductAttributeValue;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantImageRepository extends R2dbcRepository<ProductVariantImageRepository, Long> {
}
