package ewt.msvc.product.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_attribute_values")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductAttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long valueId;

    @ManyToOne
    @JoinColumn(name = "attribute_id", nullable = false)
    private ProductAttribute productAttribute;

    @ManyToOne
    @JoinColumn(name = "sku_id", nullable = false)
    private ProductVariant productVariant;

    @Size(max = 255)
    @NotNull
    private String value;
}
