package ewt.msvc.product.repository;

import ewt.msvc.product.domain.ProductVariant;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@Repository
public interface ProductVariantRepository extends R2dbcRepository<ProductVariant, String> {

    @Query("INSERT INTO ewt_product.ewt_product.product_variant (sku, product_id, price, stock) VALUES (:sku, :productId, :price, :stock)")
    Mono<Void> insertProductVariant(String sku, Long productId, BigDecimal price, Integer stock);

    Flux<ProductVariant> findAllByProductId(Long productId);
}
