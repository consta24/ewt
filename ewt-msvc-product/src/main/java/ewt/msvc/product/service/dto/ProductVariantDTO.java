package ewt.msvc.product.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.relational.core.mapping.Column;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductVariantDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    @Size(max = 1000)
    private String sku;

    @Column("product_id")
    @NotNull
    private Long productId;

    @NotNull
    private BigDecimal price;

    @NotNull
    private Integer stock;

    private Set<ProductAttributeValueDTO> variantAttributeValues;

    private Set<ProductVariantImageDTO> variantImages;
}
