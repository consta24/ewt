package ewt.msvc.product.domain;

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
import java.math.BigDecimal;

@Table(value = "product_variant", schema = "ewt_product")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductVariant implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private Long id;

    @Size(max = 1000)
    @NotNull
    private String sku;

    @Column("product_id")
    @NotNull
    private Long productId;

    @NotNull
    private BigDecimal price;

    @NotNull
    private Integer stock;
}
