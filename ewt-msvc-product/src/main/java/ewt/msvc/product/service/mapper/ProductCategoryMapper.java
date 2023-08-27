package ewt.msvc.product.service.mapper;

import ewt.msvc.product.domain.ProductCategory;
import ewt.msvc.product.service.dto.ProductCategoryDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductCategoryMapper {
    ProductCategory toEntity(ProductCategoryDTO productAttributeValueDTO);

    ProductCategoryDTO toDTO(ProductCategory productAttributeValue);
}
