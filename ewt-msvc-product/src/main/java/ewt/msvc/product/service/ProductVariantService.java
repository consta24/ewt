package ewt.msvc.product.service;

import ewt.msvc.product.domain.ProductVariant;
import ewt.msvc.product.domain.bridge.ProductVariantAttributeValuesBridge;
import ewt.msvc.product.repository.ProductRepository;
import ewt.msvc.product.repository.ProductVariantRepository;
import ewt.msvc.product.service.bridge.ProductVariantAttributeValuesBridgeService;
import ewt.msvc.product.service.dto.ProductAttributeValueDTO;
import ewt.msvc.product.service.dto.ProductVariantDTO;
import ewt.msvc.product.service.mapper.ProductVariantMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final TransactionalOperator transactionalOperator;

    private final ProductVariantMapper productVariantMapper;

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    private final ProductAttributeValueService productAttributeValueService;
    private final ProductVariantAttributeValuesBridgeService productVariantAttributeValuesBridgeService;

    public Mono<ProductVariantDTO> getProductVariant(String sku) {
        return productVariantRepository.findBySku(sku)
                .flatMap(this::populateProductVariantDTOWithAssociations);
    }

    public Flux<ProductVariantDTO> getAllProductVariants(Long productId) {
        return productVariantRepository.findAllByProductId(productId)
                .flatMap(this::populateProductVariantDTOWithAssociations);
    }

    public Mono<ProductVariantDTO> saveProductVariant(Long productId, ProductVariantDTO productVariantDTO) {
        if (productVariantDTO.getProductId() == null) {
            productVariantDTO.setProductId(productId);
        }
        return productVariantAttributeValuesBridgeService.validateAttributeValues(productVariantDTO.getProductAttributeValues())
                .flatMap(validAttributeValues -> {
                    if (Boolean.FALSE.equals(validAttributeValues)) {
                        return Mono.error(new RuntimeException("Invalid attribute values IDs"));
                    }
                    return generateSkuCode(productId, productVariantDTO);
                })
                .flatMap(sku -> {
                    productVariantDTO.setSku(sku);
                    return productVariantRepository.save(productVariantMapper.toEntity(productVariantDTO));
                })
                .flatMap(savedProductVariant -> {
                    Flux<ProductVariantAttributeValuesBridge> saveVariantAttributeValuesBridges =
                            productVariantAttributeValuesBridgeService
                                    .saveVariantAttributeValuesBridges(savedProductVariant.getSku(), productVariantDTO.getProductAttributeValues());

                    return Flux.concat(saveVariantAttributeValuesBridges).then(Mono.just(savedProductVariant));
                })
                .map(savedProductVariant -> {
                    ProductVariantDTO savedProductVariantDTO = productVariantMapper.toDTO(savedProductVariant);
                    savedProductVariantDTO.setProductAttributeValues(new HashSet<>(productVariantDTO.getProductAttributeValues()));
                    return savedProductVariantDTO;
                })
                .as(transactionalOperator::transactional);
    }

    public Flux<Void> deleteVariantsForProduct(Long productId) {
        return productVariantRepository.findAllByProductId(productId)
                .flatMap(productVariant ->
                        productVariantAttributeValuesBridgeService.deleteVariantAttributeValuesBridges(productVariant.getSku())
                                .then(productVariantRepository.delete(productVariant))
                );
    }


    private Mono<String> generateSkuCode(Long productId, ProductVariantDTO productVariantDTO) {
        return productRepository.findById(productId)
                .flatMap(product -> {
                    String productNameFormatted = product.getName().toLowerCase().replace(" ", "-");

                    Set<String> attributeValues = productVariantDTO.getProductAttributeValues()
                            .stream()
                            .map(ProductAttributeValueDTO::getValue)
                            .map(String::toLowerCase)
                            .collect(Collectors.toSet());

                    String attributesFormatted = String.join("-", attributeValues);

                    return Mono.just(productId + "-" + productNameFormatted + "-" + attributesFormatted);
                });
    }

    private Mono<ProductVariantDTO> populateProductVariantDTOWithAssociations(ProductVariant productVariant) {
        Mono<Set<ProductAttributeValueDTO>> attributeValues = productVariantAttributeValuesBridgeService.findVariantAttributeValuesBridges(productVariant.getSku())
                .flatMap(bridge -> productAttributeValueService.getAttributeValueById(bridge.getAttributeValueId()))
                .collect(Collectors.toSet());

        return Mono.zip(attributeValues, attributeValues)
                .map(tuple -> {
                    ProductVariantDTO productVariantDTO = productVariantMapper.toDTO(productVariant);
                    productVariantDTO.setProductAttributeValues(tuple.getT1());
                    return productVariantDTO;
                });
    }
}
