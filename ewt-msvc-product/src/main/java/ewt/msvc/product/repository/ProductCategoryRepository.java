package ewt.msvc.product.repository;

import ewt.msvc.product.domain.ProductCategory;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductCategoryRepository extends R2dbcRepository<ProductCategory, Long> {
}
