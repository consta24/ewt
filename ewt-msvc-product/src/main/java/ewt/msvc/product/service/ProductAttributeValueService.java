package ewt.msvc.product.service;

import ewt.msvc.config.utils.Base64Util;
import ewt.msvc.config.utils.StringUtil;
import ewt.msvc.product.domain.ProductAttributeValue;
import ewt.msvc.product.repository.ProductAttributeValueRepository;
import ewt.msvc.product.repository.ProductVariantRepository;
import ewt.msvc.product.service.bridge.ProductVariantAttributeValuesBridgeService;
import ewt.msvc.product.service.dto.ProductAttributeValueDTO;
import ewt.msvc.product.service.dto.ProductVariantDTO;
import ewt.msvc.product.service.mapper.ProductAttributeValueMapper;
import ewt.msvc.product.service.mapper.ProductVariantMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductAttributeValueService {

    private final ApplicationContext context;

    private final ProductAttributeValueMapper productAttributeValueMapper;
    private final ProductVariantMapper productVariantMapper;

    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final ProductVariantRepository productVariantRepository;

    private final ProductVariantAttributeValuesBridgeService productVariantAttributeValuesBridgeService;
    private final ProductVariantImageService productVariantImageService;


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
                    return productAttributeValueRepository.save(updatedAttributeValue);
                })
                .flatMap(savedAttributeValue -> getVariantsForAttributeValueId(savedAttributeValue.getId())
                        .map(ProductVariantDTO::getProductId)
                        .distinct()
                        .flatMap(this::updateAssociatedProduct)
                        .then(Mono.just(productAttributeValueMapper.toDTO(savedAttributeValue))));

    }

    private Mono<Void> updateAssociatedProduct(Long productId) {
        ProductService productService = context.getBean(ProductService.class);

        return productService.getProduct(productId)
                .flatMap(productDTO -> Flux.fromIterable(productDTO.getProductVariants())
                        .flatMap(variant -> Flux.fromIterable(variant.getVariantImages())
                                .flatMap(variantImage -> {
                                    if (!Base64Util.isLikelyBase64(variantImage.getRef())) {
                                        return productVariantImageService.getProductVariantImageByRef(variantImage.getRef())
                                                .map(imageData -> {
                                                    variantImage.setId(null);
                                                    variantImage.setRef(imageData);
                                                    return variantImage;
                                                });
                                    } else {
                                        return Mono.just(variantImage);
                                    }
                                })
                                .collectList()
                                .map(transformedVariantImages -> {
                                    variant.setVariantImages(new HashSet<>(transformedVariantImages));
                                    return variant;
                                }))
                        .collectList()
                        .flatMap(transformedVariants -> {
                            productDTO.setProductVariants(new HashSet<>(transformedVariants));
                            return productService.updateProduct(productId, productDTO);
                        }))
                .then();
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

    public Flux<ProductVariantDTO> getVariantsForAttributeValueId(Long attributeValueId) {
        return productVariantAttributeValuesBridgeService.findVariantAttributeValuesBridgesByAttributeValueId(attributeValueId)
                .flatMap(bridge -> productVariantRepository.findBySku(bridge.getSku()))
                .map(productVariantMapper::toDTO);
    }
}
