package ewt.msvc.cart.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Set<CartItemDTO> cartItems = new HashSet<>();
}
