package ewt.msvc.product.service;

import ewt.msvc.product.repository.ProductVariantRepository;
import ewt.msvc.product.service.dto.ProductVariantDTO;
import ewt.msvc.product.service.mapper.ProductVariantMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantMapper productVariantMapper;

    private final ProductVariantRepository productVariantRepository;

    private final ProductService productService;

    public Flux<ProductVariantDTO> getAllProductVariants(Long productId) {
        return productService.validateProductId(productId)
                .flatMapMany(validProduct -> {
                    if (Boolean.FALSE.equals(validProduct)) {
                        return Flux.error(new RuntimeException("Invalid product ID"));
                    }
                    return productVariantRepository.findAllByProductId(productId);
                })
                .map(productVariantMapper::toDTO);
    }


    public Mono<ProductVariantDTO> saveProductVariant(ProductVariantDTO productVariantDTO) {
        return productService.validateProductId(productVariantDTO.getProductId())
                .flatMap(validProduct -> {
                    if (Boolean.FALSE.equals(validProduct)) {
                        return Mono.error(new RuntimeException("Invalid product ID"));
                    }
                    productVariantDTO.setSku(generateSkuCode());
                    return productVariantRepository
                            .save(productVariantMapper.toEntity(productVariantDTO))
                            .map(productVariantMapper::toDTO);
                });
    }


    private String generateSkuCode() {
        return UUID.randomUUID().toString();
    }
}
