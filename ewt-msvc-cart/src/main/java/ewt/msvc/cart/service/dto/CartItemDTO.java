package ewt.msvc.cart.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItemDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    @Size(max = 1000)
    private String sku;

    @NotNull
    private Integer quantity;
}
