package ewt.msvc.product.service.mapper;

import ewt.msvc.product.domain.ProductAttribute;
import ewt.msvc.product.service.dto.ProductAttributeDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductAttributeMapper {
    ProductAttribute toEntity(ProductAttributeDTO productAttributeDTO);

    ProductAttributeDTO toDTO(ProductAttribute productAttribute);
}
