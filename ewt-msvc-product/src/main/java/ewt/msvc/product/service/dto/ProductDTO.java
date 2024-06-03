package ewt.msvc.product.service.dto;

import ewt.msvc.product.service.http.dto.FeedbackReviewInfoDTO;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    @Size(max = 255)
    @NotNull
    private String name;

    @Size(max = 1000)
    private String description;

    private FeedbackReviewInfoDTO feedbackReviewInfo;

    private Set<ProductVariantDTO> productVariants;

    private Set<ProductCategoryDTO> productCategories;

    private Set<ProductAttributeDTO> productAttributes;
}
