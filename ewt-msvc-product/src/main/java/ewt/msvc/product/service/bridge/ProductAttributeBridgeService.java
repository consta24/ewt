package ewt.msvc.product.service.bridge;

import ewt.msvc.product.domain.bridge.ProductAttributeBridge;
import ewt.msvc.product.repository.ProductAttributeRepository;
import ewt.msvc.product.repository.bridge.ProductAttributeBridgeRepository;
import ewt.msvc.product.service.dto.ProductAttributeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductAttributeBridgeService {

    private final ProductAttributeRepository productAttributeRepository;

    private final ProductAttributeBridgeRepository productAttributeBridgeRepository;

    public Flux<ProductAttributeBridge> findAttributeBridges(Long productId) {
        return productAttributeBridgeRepository.findAllByProductId(productId);
    }

    public Flux<ProductAttributeBridge> saveAttributeIds(Long productId, Set<ProductAttributeDTO> productAttributes) {
        return Flux.fromIterable(productAttributes)
                .flatMap(productAttributeDTO -> productAttributeBridgeRepository.save(new ProductAttributeBridge(null, productId, productAttributeDTO.getId())));
    }

    public Flux<Void> deleteAttributeBridges(Long productId) {
        return productAttributeBridgeRepository.deleteByProductId(productId);
    }

    public Mono<Boolean> validateAttributeIds(Set<ProductAttributeDTO> productAttributes) {
        return Flux.fromIterable(productAttributes)
                .map(ProductAttributeDTO::getId)
                .flatMap(productAttributeRepository::existsById)
                .all(Boolean::booleanValue);
    }

    public Mono<Boolean> validateAttributeId(Long attributeId) {
        return productAttributeRepository.existsById(attributeId);
    }
}
