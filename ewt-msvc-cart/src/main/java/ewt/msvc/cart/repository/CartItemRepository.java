package ewt.msvc.cart.repository;

import ewt.msvc.cart.domain.CartItem;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface CartItemRepository extends R2dbcRepository<CartItem, Long> {
    Flux<CartItem> findAllByCartId(Long id);

    Mono<CartItem> findBySkuAndCartId(String sku, Long cartId);

    Flux<Void> deleteAllByCartId(Long id);
}
