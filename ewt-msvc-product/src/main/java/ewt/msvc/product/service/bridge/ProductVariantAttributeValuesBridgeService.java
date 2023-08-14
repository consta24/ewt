package ewt.msvc.product.service.bridge;

import ewt.msvc.product.domain.bridge.ProductVariantAttributeValuesBridge;
import ewt.msvc.product.repository.ProductAttributeValueRepository;
import ewt.msvc.product.repository.bridge.ProductVariantAttributeValuesBridgeRepository;
import ewt.msvc.product.service.dto.ProductAttributeValueDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductVariantAttributeValuesBridgeService {

    private final ProductAttributeValueRepository productAttributeValueRepository;

    private final ProductVariantAttributeValuesBridgeRepository productVariantAttributeValuesBridgeRepository;

    public Flux<ProductVariantAttributeValuesBridge> findVariantAttributeValuesBridges(String sku) {
        return productVariantAttributeValuesBridgeRepository.findAllBySku(sku);
    }

    public Flux<ProductVariantAttributeValuesBridge> saveVariantAttributeValuesBridges(String sku, Set<ProductAttributeValueDTO> productAttributeValues) {
        return Flux.fromIterable(productAttributeValues)
                .flatMap(productAttributeValueDTO -> productVariantAttributeValuesBridgeRepository.save(new ProductVariantAttributeValuesBridge(null, sku, productAttributeValueDTO.getId())));
    }

    public Flux<Void> deleteVariantAttributeValuesBridges(String sku) {
        return productVariantAttributeValuesBridgeRepository.deleteAllBySku(sku);
    }

    public Mono<Boolean> validateAttributeValues(Set<ProductAttributeValueDTO> productAttributeValues) {
        return Flux.fromIterable(productAttributeValues)
                .map(ProductAttributeValueDTO::getId)
                .flatMap(productAttributeValueRepository::existsById)
                .all(Boolean::booleanValue);
    }
}
