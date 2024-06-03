package ewt.msvc.order.service;

import ewt.msvc.order.domain.Order;
import ewt.msvc.order.domain.enums.OrderStatus;
import ewt.msvc.order.domain.enums.PaymentStatus;
import ewt.msvc.order.repository.OrderRepository;
import ewt.msvc.order.repository.OrderRepositoryQuery;
import ewt.msvc.order.service.dto.OrderDTO;
import ewt.msvc.order.service.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderRepositoryQuery orderRepositoryQuery;
    private final OrderMapper orderMapper;
    private final OrderItemService orderItemService;


    public Mono<Void> saveOrder(OrderDTO orderDTO) {
        Order order = orderMapper.toEntity(orderDTO);
        order.setOrderStatus(OrderStatus.PLACED);
        order.setPaymentStatus(PaymentStatus.PENDING);

        return orderRepository.save(order)
                .flatMap(savedOrder -> orderItemService.saveOrderItems(savedOrder.getId(), orderDTO.getOrderItems()))
                .then();
    }

    public Mono<OrderDTO> getOrder(Long id) {
        return orderRepository.findById(id)
                .flatMap(order -> orderItemService.getOrderItemsByOrderId(order.getId())
                        .collectList()
                        .map(orderItems -> {
                            OrderDTO orderDTO = orderMapper.toDTO(order);
                            orderDTO.setOrderItems(orderItems);
                            return orderDTO;
                        }));
    }

    public Flux<OrderDTO> getOrdersPage(Pageable pageable) {
        return orderRepositoryQuery.findAllBy(pageable).map(orderMapper::toDTO);
    }

    public Mono<Void> deleteOrder(Long id) {
        return orderRepository.deleteById(id);
    }

    public Mono<Void> updateOrder(Order order) {
        return orderRepository.findById(order.getId())
                .flatMap(existingOrder -> {
                    existingOrder.setOrderStatus(order.getOrderStatus());
                    existingOrder.setPaymentStatus(order.getPaymentStatus());
                    // Update other fields as needed
                    return orderRepository.save(existingOrder);
                })
                .then();
    }

    public Mono<Long> count() {
        return orderRepository.count();
    }
}