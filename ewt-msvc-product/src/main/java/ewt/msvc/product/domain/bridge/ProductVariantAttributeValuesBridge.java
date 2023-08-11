package ewt.msvc.product.domain.bridge;

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

@Table(value = "product_variant_attribute_values_bridge", schema = "ewt_product")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductVariantAttributeValuesBridge implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private Long id;

    @Column("sku")
    @Size(max = 1000)
    @NotNull
    String sku;

    @Column("attribute_value_id")
    @NotNull
    Long attributeValueId;
}
