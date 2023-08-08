package ewt.msvc.product.repository;

import ewt.msvc.product.domain.Product;
import ewt.msvc.product.domain.ProductAttribute;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductAttributeRepository extends R2dbcRepository<ProductAttribute, Long> {
}
