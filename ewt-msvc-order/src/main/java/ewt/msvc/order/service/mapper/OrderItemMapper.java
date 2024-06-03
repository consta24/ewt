package ewt.msvc.order.service.mapper;

import ewt.msvc.order.domain.OrderItem;
import ewt.msvc.order.service.dto.OrderItemDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    OrderItem toEntity(OrderItemDTO orderItemDTO);

    OrderItemDTO toDTO(OrderItem orderItem);
}
