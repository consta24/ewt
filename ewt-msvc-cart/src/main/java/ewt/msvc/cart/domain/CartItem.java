package ewt.msvc.cart.domain;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.io.Serial;
import java.io.Serializable;

@Table(value = "cart_item", schema = "ewt_cart")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItem implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private Long id;

    @NotNull
    @Size(max = 1000)
    private String sku;

    @NotNull
    private Integer quantity;

    @NotNull
    @Column("cart_id")
    private Long cartId;
}
