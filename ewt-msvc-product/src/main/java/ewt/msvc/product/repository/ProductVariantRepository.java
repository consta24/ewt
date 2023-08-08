package ewt.msvc.product.repository;

import ewt.msvc.product.domain.Product;
import ewt.msvc.product.domain.ProductVariant;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends R2dbcRepository<ProductVariant, String> {
}
