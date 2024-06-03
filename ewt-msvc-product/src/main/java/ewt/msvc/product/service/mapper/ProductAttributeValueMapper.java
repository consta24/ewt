package ewt.msvc.product.service.mapper;

import ewt.msvc.product.domain.ProductAttributeValue;
import ewt.msvc.product.service.dto.ProductAttributeValueDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductAttributeValueMapper {
    ProductAttributeValue toEntity(ProductAttributeValueDTO productAttributeValueDTO);

    ProductAttributeValueDTO toDTO(ProductAttributeValue productAttributeValue);
}
