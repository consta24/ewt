package ewt.msvc.product.domain;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.io.Serial;
import java.io.Serializable;

@Table(value = "product_attribute", schema = "ewt_product")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductAttribute implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private Long id;

    @Size(max = 255)
    @NotNull
    private String name;
}
