package ewt.msvc.product.service;

import ewt.msvc.config.utils.StringUtil;
import ewt.msvc.product.domain.ProductAttribute;
import ewt.msvc.product.repository.ProductAttributeRepository;
import ewt.msvc.product.repository.ProductAttributeValueRepository;
import ewt.msvc.product.repository.ProductRepository;
import ewt.msvc.product.service.bridge.ProductAttributeBridgeService;
import ewt.msvc.product.service.dto.ProductAttributeDTO;
import ewt.msvc.product.service.dto.ProductDTO;
import ewt.msvc.product.service.mapper.ProductAttributeMapper;
import ewt.msvc.product.service.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductAttributeService {

    private final ProductAttributeMapper productAttributeMapper;
    private final ProductMapper productMapper;

    private final ProductAttributeRepository productAttributeRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final ProductRepository productRepository;

    private final ProductAttributeBridgeService productAttributeBridgeService;

    public Flux<ProductAttributeDTO> getAllAttributes() {
        return productAttributeRepository.findAll()
                .map(productAttributeMapper::toDTO);
    }

    public Mono<ProductAttributeDTO> addAttribute(ProductAttributeDTO productAttributeDTO) {
        ProductAttribute productAttribute = productAttributeMapper.toEntity(productAttributeDTO);
        productAttribute.setName(StringUtil.toTitleCase(productAttribute.getName()));

        return productAttributeRepository.save(productAttribute)
                .map(productAttributeMapper::toDTO);
    }

    public Mono<ProductAttributeDTO> updateAttribute(Long id, ProductAttributeDTO productAttributeDTO) {
        return productAttributeRepository.findById(id)
                .flatMap(existingAttribute -> {
                    existingAttribute.setName(StringUtil.toTitleCase(productAttributeDTO.getName()));
                    return productAttributeRepository.save(existingAttribute);
                })
                .map(productAttributeMapper::toDTO);
    }

    public Mono<Void> deleteAttribute(Long id) {
        return isAttributeLinkedToProducts(id)
                .flatMap(isLinked -> {
                    if (Boolean.TRUE.equals(isLinked)) {
                        return Mono.error(new RuntimeException("Attribute is linked to products and cannot be deleted."));
                    }
                    return productAttributeValueRepository.deleteAllByAttributeId(id)
                            .then(productAttributeRepository.deleteById(id));
                });
    }

    public Mono<ProductAttributeDTO> getAttributeById(Long attributeId) {
        return productAttributeRepository.findById(attributeId)
                .map(productAttributeMapper::toDTO);
    }

    public Mono<Boolean> isAttributeLinkedToProducts(Long attributeId) {
        return productAttributeBridgeService.findAttributeBridgesByAttributeId(attributeId)
                .hasElements();
    }

    public Flux<ProductDTO> getProductsForAttributeId(Long attributeId) {
        return productAttributeBridgeService.findAttributeBridgesByAttributeId(attributeId)
                .flatMap(bridge -> productRepository.findById(bridge.getProductId()))
                .map(productMapper::toDTO);
    }
}
