package ewt.msvc.product.service;

import ewt.msvc.product.domain.Product;
import ewt.msvc.product.domain.bridge.ProductAttributeBridge;
import ewt.msvc.product.domain.bridge.ProductCategoryBridge;
import ewt.msvc.product.repository.ProductRepository;
import ewt.msvc.product.service.bridge.ProductAttributeBridgeService;
import ewt.msvc.product.service.bridge.ProductCategoryBridgeService;
import ewt.msvc.product.service.dto.ProductAttributeDTO;
import ewt.msvc.product.service.dto.ProductCategoryDTO;
import ewt.msvc.product.service.dto.ProductDTO;
import ewt.msvc.product.service.dto.ProductVariantDTO;
import ewt.msvc.product.service.mapper.ProductMapper;
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
public class ProductService {

    private final TransactionalOperator transactionalOperator;

    private final ProductMapper productMapper;

    private final ProductRepository productRepository;

    private final ProductCategoryService productCategoryService;
    private final ProductAttributeService productAttributeService;
    private final ProductVariantService productVariantService;
    private final ProductCategoryBridgeService productCategoryBridgeService;
    private final ProductAttributeBridgeService productAttributeBridgeService;

    public Mono<ProductDTO> getProduct(Long productId) {
        return productRepository.findById(productId)
                .flatMap(this::populateProductDTOWithAssociations);
    }

    public Flux<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .flatMap(this::populateProductDTOWithAssociations);
    }

    public Mono<ProductDTO> saveProduct(ProductDTO productDTO) {
        return productCategoryBridgeService.validateCategories(productDTO.getProductCategories())
                .flatMap(validCategories -> {
                    if (Boolean.FALSE.equals(validCategories)) {
                        return Mono.error(new RuntimeException("Invalid category IDs."));
                    }
                    return productAttributeBridgeService.validateAttributes(productDTO.getProductAttributes());
                })
                .flatMap(validAttributes -> {
                    if (Boolean.FALSE.equals(validAttributes)) {
                        return Mono.error(new RuntimeException("Invalid attributes IDs."));
                    }
                    return productRepository.save(productMapper.toEntity(productDTO));
                })
                .flatMap(savedProduct -> {
                    Flux<ProductCategoryBridge> saveCategoryBridges =
                            productCategoryBridgeService
                                    .saveCategoryBridges(savedProduct.getId(), productDTO.getProductCategories());
                    Flux<ProductAttributeBridge> saveAttributeBridges =
                            productAttributeBridgeService
                                    .saveAttributeBridges(savedProduct.getId(), productDTO.getProductAttributes());

                    return Flux.concat(saveCategoryBridges, saveAttributeBridges)
                            .then(Mono.just(savedProduct));
                })
                .flatMap(savedProduct -> Flux.fromIterable(productDTO.getProductVariants())
                        .flatMap(variant -> {
                            variant.setProductId(savedProduct.getId());
                            return productVariantService.saveProductVariant(savedProduct.getId(), variant);
                        })
                        .collectList()
                        .map(savedVariants -> {
                            ProductDTO savedProductDTO = productMapper.toDTO(savedProduct);
                            savedProductDTO.setProductVariants(new HashSet<>(savedVariants));
                            savedProductDTO.setProductCategories(new HashSet<>(productDTO.getProductCategories()));
                            savedProductDTO.setProductAttributes(new HashSet<>(productDTO.getProductAttributes()));
                            return savedProductDTO;
                        }))
                .as(transactionalOperator::transactional);
    }


    public Mono<ProductDTO> updateProduct(Long id, ProductDTO productDTO) {
        return productRepository.findById(id)
                .flatMap(existingProduct -> {
                    existingProduct.setName(productDTO.getName());
                    existingProduct.setDescription(productDTO.getDescription());
                    return Mono.just(existingProduct);
                })
                .then(productCategoryBridgeService.validateCategories(productDTO.getProductCategories())
                        .flatMap(validCategories -> {
                            if (Boolean.FALSE.equals(validCategories)) {
                                return Mono.error(new RuntimeException("Invalid category IDs."));
                            }
                            return productAttributeBridgeService.validateAttributes(productDTO.getProductAttributes());
                        })
                )
                .flatMap(validAttributes -> {
                    if (Boolean.FALSE.equals(validAttributes)) {
                        return Mono.error(new RuntimeException("Invalid attribute IDs."));
                    }

                    Flux<Void> deleteCategoryBridges = productCategoryBridgeService.deleteCategoryBridges(productDTO.getId());
                    Flux<Void> deleteAttributeBridges = productAttributeBridgeService.deleteAttributeBridges(productDTO.getId());

                    Flux<ProductCategoryBridge> saveCategoryBridges = productCategoryBridgeService.saveCategoryBridges(productDTO.getId(), productDTO.getProductCategories());
                    Flux<ProductAttributeBridge> saveAttributeBridges = productAttributeBridgeService.saveAttributeBridges(productDTO.getId(), productDTO.getProductAttributes());

                    return Flux.concat(deleteCategoryBridges, deleteAttributeBridges, saveCategoryBridges, saveAttributeBridges).then();
                })
                .thenMany(Flux.fromIterable(productDTO.getProductVariants())
                        .flatMap(variant -> {
                            variant.setProductId(id);

                            if (variant.getId() != null) {
                                // Variant has an ID, update it
                                return productVariantService.updateProductVariant(variant);
                            } else {
                                // Variant has no ID, create a new one
                                return productVariantService.saveProductVariant(id, variant);
                            }
                        })
                )
                .thenMany(productVariantService.getAllProductVariants(id)  // fetch all variants of this product
                        .filter(existingVariant -> productDTO.getProductVariants().stream() // filter out variants not present in updated list
                                .noneMatch(variantDTO -> variantDTO.getId().equals(existingVariant.getId())))
                        .flatMap(productVariantService::deleteProductVariant)  // delete the filtered variants
                )
                .then(productRepository.save(productMapper.toEntity(productDTO)))
                .map(productMapper::toDTO)
                .as(transactionalOperator::transactional);
    }



    public Mono<Void> deleteProduct(Long id) {
        Flux<Void> deleteCategoryBridges = productCategoryBridgeService.deleteCategoryBridges(id);
        Flux<Void> deleteAttributeBridges = productAttributeBridgeService.deleteAttributeBridges(id);
        Flux<Void> deleteVariants = productVariantService.deleteVariantsForProduct(id);

        return Flux.concat(deleteCategoryBridges, deleteAttributeBridges, deleteVariants)
                .then(productRepository.deleteById(id))
                .as(transactionalOperator::transactional);
    }

    private Mono<ProductDTO> populateProductDTOWithAssociations(Product product) {
        Mono<Set<ProductVariantDTO>> variants = productVariantService.getAllProductVariants(product.getId())
                .collect(Collectors.toSet());

        Mono<Set<ProductCategoryDTO>> categories = productCategoryBridgeService.findCategoryBridges(product.getId())
                .flatMap(bridge -> productCategoryService.getCategoryById(bridge.getCategoryId()))
                .collect(Collectors.toSet());

        Mono<Set<ProductAttributeDTO>> attributes = productAttributeBridgeService.findAttributeBridges(product.getId())
                .flatMap(bridge -> productAttributeService.getAttributeById(bridge.getAttributeId()))
                .collect(Collectors.toSet());

        return Mono.zip(categories, attributes, variants)
                .map(tuple -> {
                    ProductDTO productDTO = productMapper.toDTO(product);
                    productDTO.setProductCategories(tuple.getT1());
                    productDTO.setProductAttributes(tuple.getT2());
                    productDTO.setProductVariants(tuple.getT3());
                    return productDTO;
                });
    }
}
