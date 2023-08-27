package ewt.msvc.product.service.mapper;

import ewt.msvc.product.domain.ProductVariantImage;
import ewt.msvc.product.service.dto.ProductVariantImageDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductVariantImageMapper {
    ProductVariantImage toEntity(ProductVariantImageDTO productVariantImageDTO);

    ProductVariantImageDTO toDTO(ProductVariantImage productVariantImage);
}
