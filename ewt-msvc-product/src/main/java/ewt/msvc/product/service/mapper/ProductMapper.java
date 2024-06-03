package ewt.msvc.product.service.mapper;

import ewt.msvc.product.domain.Product;
import ewt.msvc.product.service.dto.ProductDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    Product toEntity(ProductDTO productDTO);

    ProductDTO toDTO(Product product);
}
