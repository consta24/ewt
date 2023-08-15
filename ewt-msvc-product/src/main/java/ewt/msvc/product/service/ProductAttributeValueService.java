package ewt.msvc.product.service;

import ewt.msvc.product.domain.ProductAttributeValue;
import ewt.msvc.product.repository.ProductAttributeValueRepository;
import ewt.msvc.product.service.bridge.ProductVariantAttributeValuesBridgeService;
import ewt.msvc.product.service.dto.ProductAttributeValueDTO;
import ewt.msvc.product.service.mapper.ProductAttributeValueMapper;
import ewt.msvc.product.service.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ProductAttributeValueService {

    private final ProductAttributeValueMapper productAttributeValueMapper;

    private final ProductAttributeValueRepository productAttributeValueRepository;

    private final ProductVariantAttributeValuesBridgeService productVariantAttributeValuesBridgeService;


    public Flux<ProductAttributeValueDTO> getAttributeValues(Long attributeId) {
        return productAttributeValueRepository.findAllByAttributeId(attributeId)
                .map(productAttributeValueMapper::toDTO);
    }


    public Mono<ProductAttributeValueDTO> getAttributeValueById(Long attributeValueId) {
        return productAttributeValueRepository.findById(attributeValueId)
                .map(productAttributeValueMapper::toDTO);
    }

    public Mono<ProductAttributeValueDTO> addAttributeValue(ProductAttributeValueDTO productAttributeValueDTO) {
        ProductAttributeValue productAttributeValue = productAttributeValueMapper.toEntity(productAttributeValueDTO);
        productAttributeValue.setValue(StringUtil.toTitleCase(productAttributeValue.getValue()));

        return productAttributeValueRepository.existsByValueAndAttributeId(productAttributeValue.getValue(), productAttributeValue.getAttributeId())
                .flatMap(exists -> {
                    if (Boolean.TRUE.equals(exists)) {
                        return Mono.error(new RuntimeException("Attribute value with the name " + productAttributeValue.getValue() + " already exists for the given attributeId."));
                    } else {
                        return productAttributeValueRepository.save(productAttributeValue)
                                .map(productAttributeValueMapper::toDTO);
                    }
                });
    }


    public Mono<ProductAttributeValueDTO> updateAttributeValue(Long attributeId, Long id, ProductAttributeValueDTO productAttributeValueDTO) {
        ProductAttributeValue updatedAttributeValue = productAttributeValueMapper.toEntity(productAttributeValueDTO);
        updatedAttributeValue.setValue(StringUtil.toTitleCase(updatedAttributeValue.getValue()));
        updatedAttributeValue.setId(id);

        return productAttributeValueRepository.existsByValueAndAttributeIdAndIdNot(updatedAttributeValue.getValue(), attributeId, id)
                .flatMap(exists -> {
                    if (Boolean.TRUE.equals(exists)) {
                        return Mono.error(new RuntimeException("Attribute value with the name " + updatedAttributeValue.getValue() + " already exists for the given attributeId."));
                    }
                    return productAttributeValueRepository.save(updatedAttributeValue)
                            .map(productAttributeValueMapper::toDTO);
                });
    }


    public Mono<Void> deleteAttributeValue(Long attributeId, Long id) {
        return isAttributeValueLinkedToVariants(id)
                .flatMap(isLinked -> {
                    if (Boolean.TRUE.equals(isLinked)) {
                        return Mono.error(new RuntimeException("Attribute is linked to products and cannot be deleted."));
                    }
                    return productAttributeValueRepository.findByIdAndAttributeId(id, attributeId)
                            .flatMap(productAttributeValueRepository::delete);
                });
    }

    public Mono<Boolean> isAttributeValueLinkedToVariants(Long attributeValueId) {
        return productVariantAttributeValuesBridgeService.findVariantAttributeValuesBridgesByAttributeValueId(attributeValueId)
                .hasElements();
    }
}
