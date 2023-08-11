package ewt.msvc.product.domain.bridge;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.io.Serial;
import java.io.Serializable;

@Table(value = "product_attribute_bridge", schema = "ewt_product")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductAttributeBridge implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private Long id;

    @Column("product_id")
    @NotNull
    Long productId;

    @Column("attribute_id")
    @NotNull
    Long attributeId;
}
