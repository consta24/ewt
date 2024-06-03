package ewt.msvc.order.service.mapper;

import ewt.msvc.order.domain.Order;
import ewt.msvc.order.service.dto.OrderDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    Order toEntity(OrderDTO orderDTO);

    OrderDTO toDTO(Order order);
}
