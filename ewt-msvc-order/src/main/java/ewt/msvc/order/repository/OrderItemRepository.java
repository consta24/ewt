package ewt.msvc.order.repository;

import ewt.msvc.order.domain.OrderItem;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface OrderItemRepository extends ReactiveCrudRepository<OrderItem, Long> {
     Flux<OrderItem> findByOrderId(Long orderId);

}