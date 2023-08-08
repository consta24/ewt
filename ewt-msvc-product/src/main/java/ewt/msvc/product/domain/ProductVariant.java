package ewt.msvc.product.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "product_variant")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductVariant {

    @Id
    private String skuId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @OneToMany(mappedBy = "productVariant", cascade = CascadeType.ALL)
    @NotNull
    private Set<ProductAttributeValue> attributeValues;

    @PostPersist
    public void generateSkuId() {
        String base = "PROD" + product.getProductId() + "-";

        String attributes = attributeValues.stream()
                .map(av -> av.getValue().toUpperCase().replaceAll("[^A-Z]", ""))
                .sorted()
                .collect(Collectors.joining("-"));

        this.skuId = base + attributes;
    }

}
