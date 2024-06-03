package ewt.msvc.order.service;

import ewt.msvc.order.domain.OrderItem;
import ewt.msvc.order.repository.OrderItemRepository;
import ewt.msvc.order.service.dto.OrderItemDTO;
import ewt.msvc.order.service.mapper.OrderItemMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderItemMapper orderItemMapper;


    public Mono<Void> saveOrderItems(Long orderId, List<OrderItemDTO> orderItemDTOs) {
        return Flux.fromIterable(orderItemDTOs)
                .map(orderItemDTO -> {
                    OrderItem orderItem = orderItemMapper.toEntity(orderItemDTO);
                    orderItem.setOrderId(orderId);
                    orderItem.setLastModifiedDate(LocalDate.now());
                    return orderItem;
                })
                .flatMap(orderItemRepository::save)
                .then();
    }

    public Flux<OrderItemDTO> getOrderItemsByOrderId(Long orderId) {
        return orderItemRepository.findByOrderId(orderId).map(orderItemMapper::toDTO);
    }
}