package ewt.msvc.product.service;

import ewt.msvc.config.utils.StringUtil;
import ewt.msvc.product.domain.ProductCategory;
import ewt.msvc.product.repository.ProductCategoryRepository;
import ewt.msvc.product.repository.ProductRepository;
import ewt.msvc.product.service.bridge.ProductCategoryBridgeService;
import ewt.msvc.product.service.dto.ProductCategoryDTO;
import ewt.msvc.product.service.dto.ProductDTO;
import ewt.msvc.product.service.mapper.ProductCategoryMapper;
import ewt.msvc.product.service.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductCategoryService {

    private final ProductCategoryMapper productCategoryMapper;
    private final ProductMapper productMapper;

    private final ProductCategoryRepository productCategoryRepository;
    private final ProductRepository productRepository;

    private final ProductCategoryBridgeService productCategoryBridgeService;

    public Flux<ProductCategoryDTO> getAllProductCategories() {
        return productCategoryRepository.findAll().map(productCategoryMapper::toDTO);
    }

    public Mono<ProductCategoryDTO> addProductCategory(ProductCategoryDTO productCategoryDTO) {
        ProductCategory productCategory = productCategoryMapper.toEntity(productCategoryDTO);
        productCategory.setName(StringUtil.toTitleCase(productCategory.getName()));
        return productCategoryRepository.save(productCategory)
                .map(productCategoryMapper::toDTO);
    }

    public Mono<ProductCategoryDTO> updateProductCategory(Long id, ProductCategoryDTO productCategoryDTO) {
        return productCategoryRepository.findById(id)
                .flatMap(existingCategory -> {
                    existingCategory.setName(StringUtil.toTitleCase(productCategoryDTO.getName()));
                    existingCategory.setDescription(productCategoryDTO.getDescription());
                    return productCategoryRepository.save(existingCategory);
                })
                .map(productCategoryMapper::toDTO);
    }

    public Mono<Void> deleteProductCategory(Long id) {
        return isCategoryLinkedToProducts(id)
                .flatMap(isLinked -> {
                    if (Boolean.TRUE.equals(isLinked)) {
                        return Mono.error(new RuntimeException("Category is linked to products and cannot be deleted."));
                    }
                    return productCategoryRepository.deleteById(id);
                });
    }

    public Mono<ProductCategoryDTO> getCategoryById(Long categoryId) {
        return productCategoryRepository.findById(categoryId)
                .map(productCategoryMapper::toDTO);
    }

    public Mono<Boolean> isCategoryLinkedToProducts(Long categoryId) {
        return productCategoryBridgeService.findCategoryBridgesByCategoryId(categoryId)
                .hasElements();
    }

    public Flux<ProductDTO> getProductsForCategoryId(Long categoryId) {
        return productCategoryBridgeService.findCategoryBridgesByCategoryId(categoryId)
                .flatMap(bridge -> productRepository.findById(bridge.getProductId()))
                .map(productMapper::toDTO);
    }
}

