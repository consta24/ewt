package ewt.msvc.product.repository.bridge;

import ewt.msvc.product.domain.bridge.ProductCategoryBridge;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ProductCategoryBridgeRepository extends R2dbcRepository<ProductCategoryBridge, Long> {

    @Query("SELECT * FROM ewt_product.ewt_product.product_category_bridge WHERE product_id = :productId")
    Flux<ProductCategoryBridge> findAllByProductId(Long productId);

    @Query("SELECT * FROM ewt_product.ewt_product.product_category_bridge WHERE category_id = :categoryId")
    Flux<ProductCategoryBridge> findAllByCategoryId(Long categoryId);

    @Query("DELETE FROM ewt_product.ewt_product.product_category_bridge WHERE product_id = :productId")
    Flux<Void> deleteByProductId(Long productId);
}
