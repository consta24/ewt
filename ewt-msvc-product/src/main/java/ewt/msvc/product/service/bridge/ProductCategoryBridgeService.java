package ewt.msvc.product.service.bridge;

import ewt.msvc.product.domain.bridge.ProductCategoryBridge;
import ewt.msvc.product.repository.ProductCategoryRepository;
import ewt.msvc.product.repository.bridge.ProductCategoryBridgeRepository;
import ewt.msvc.product.service.dto.ProductCategoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductCategoryBridgeService {

    private final ProductCategoryRepository productCategoryRepository;

    private final ProductCategoryBridgeRepository productCategoryBridgeRepository;

    public Flux<ProductCategoryBridge> findCategoryBridges(Long productId) {
        return productCategoryBridgeRepository.findAllByProductId(productId);
    }

    public Flux<ProductCategoryBridge> saveCategoryIds(Long productId, Set<ProductCategoryDTO> productCategories) {
        return Flux.fromIterable(productCategories)
                .flatMap(productCategoryDTO -> productCategoryBridgeRepository.save(new ProductCategoryBridge(null, productId, productCategoryDTO.getId())));
    }

    public Flux<Void> deleteCategoryBridges(Long productId) {
        return productCategoryBridgeRepository.deleteByProductId(productId);
    }

    public Mono<Boolean> validateCategoryIds(Set<ProductCategoryDTO> productCategories) {
        return Flux.fromIterable(productCategories)
                .map(ProductCategoryDTO::getId)
                .flatMap(productCategoryRepository::existsById)
                .all(Boolean::booleanValue);
    }

    public Mono<Boolean> validateCategoryId(Long categoryId) {
        return productCategoryRepository.existsById(categoryId);
    }
}
