package ewt.msvc.product.domain;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_variant_images")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductVariantImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne
    @JoinColumn(name = "sku_id", nullable = false)
    @NotNull
    private ProductVariant productVariant;

    @Size(max = 1000)
    @NotNull
    private String imageRef;

    private Integer sequence;
}
