package ewt.msvc.product.service;

import ewt.msvc.product.domain.ProductCategory;
import ewt.msvc.product.repository.ProductCategoryRepository;
import ewt.msvc.product.service.dto.ProductCategoryDTO;
import ewt.msvc.product.service.mapper.ProductCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryMapper productCategoryMapper;

    private final ProductCategoryRepository productCategoryRepository;

    public Flux<ProductCategoryDTO> getAllProductCategories() {
        return productCategoryRepository.findAll().map(productCategoryMapper::toDTO);
    }

    public Mono<ProductCategoryDTO> addProductCategory(ProductCategoryDTO productCategoryDTO) {
        ProductCategory productCategory = productCategoryMapper.toEntity(productCategoryDTO);
        return productCategoryRepository.save(productCategory).map(productCategoryMapper::toDTO);
    }

    public Mono<ProductCategoryDTO> updateProductCategory(Long id, ProductCategoryDTO productCategoryDTO) {
        return productCategoryRepository.findById(id)
                .flatMap(existingCategory -> {
                    existingCategory.setName(productCategoryDTO.getName());
                    existingCategory.setDescription(productCategoryDTO.getDescription());
                    return productCategoryRepository.save(existingCategory);
                })
                .map(productCategoryMapper::toDTO);
    }

    public Mono<Void> deleteProductCategory(Long id) {
        return productCategoryRepository.deleteById(id);
    }

    public Mono<ProductCategoryDTO> getCategoryById(Long categoryId) {
        return productCategoryRepository.findById(categoryId)
                .map(productCategoryMapper::toDTO);
    }
}

