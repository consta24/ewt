package ewt.msvc.product.service.bridge;

import ewt.msvc.product.domain.bridge.ProductCategoryBridge;
import ewt.msvc.product.repository.ProductCategoryRepository;
import ewt.msvc.product.repository.bridge.ProductCategoryBridgeRepository;
import ewt.msvc.product.service.dto.ProductCategoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductCategoryBridgeService {

    private final ProductCategoryRepository productCategoryRepository;

    private final ProductCategoryBridgeRepository productCategoryBridgeRepository;

    public Flux<ProductCategoryBridge> findCategoryBridges(Long productId) {
        return productCategoryBridgeRepository.findAllByProductId(productId);
    }

    public Flux<ProductCategoryBridge> findCategoryBridgesByCategoryId(Long categoryId) {
        return productCategoryBridgeRepository.findAllByCategoryId(categoryId);
    }

    public Flux<ProductCategoryBridge> saveCategoryBridges(Long productId, Set<ProductCategoryDTO> productCategories) {
        return Flux.fromIterable(productCategories)
                .flatMap(productCategoryDTO -> productCategoryBridgeRepository.save(new ProductCategoryBridge(null, productId, productCategoryDTO.getId())));
    }

    public Flux<Void> deleteCategoryBridges(Long productId) {
        return productCategoryBridgeRepository.deleteAllByProductId(productId);
    }

    public Mono<Boolean> validateCategories(Set<ProductCategoryDTO> productCategories) {
        return Flux.fromIterable(productCategories)
                .map(ProductCategoryDTO::getId)
                .flatMap(productCategoryRepository::existsById)
                .all(Boolean::booleanValue);
    }
}
