package ewt.msvc.cart.service.mapper;

import ewt.msvc.cart.domain.Cart;
import ewt.msvc.cart.service.dto.CartDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartMapper {

    Cart toEntity(CartDTO cartDTO);

    CartDTO toDTO(Cart cart);
}
