package ewt.msvc.product.service.mapper;

import ewt.msvc.product.domain.ProductVariant;
import ewt.msvc.product.service.dto.ProductVariantDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {
    ProductVariant toEntity(ProductVariantDTO productVariantDTO);

    ProductVariantDTO toDTO(ProductVariant productVariant);

    List<ProductVariantDTO> toDTOList(List<ProductVariant> productVariants);
}
