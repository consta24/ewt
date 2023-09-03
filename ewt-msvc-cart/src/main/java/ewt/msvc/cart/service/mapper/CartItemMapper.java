package ewt.msvc.cart.service.mapper;

import ewt.msvc.cart.domain.CartItem;
import ewt.msvc.cart.service.dto.CartItemDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartItemMapper {

    CartItem toEntity(CartItemDTO cartItemDTO);

    CartItemDTO toDTO(CartItem cartItem);
}
