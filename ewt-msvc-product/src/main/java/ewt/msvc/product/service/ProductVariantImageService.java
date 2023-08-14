package ewt.msvc.product.service;

import ewt.msvc.product.repository.ProductVariantImageRepository;
import ewt.msvc.product.service.dto.ProductVariantImageDTO;
import ewt.msvc.product.service.mapper.ProductVariantImageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ProductVariantImageService {

    private final ProductVariantImageMapper productVariantImageMapper;

    private final ProductVariantImageRepository productVariantImageRepository;


    public Flux<ProductVariantImageDTO> getAllProductVariantImages(String sku) {
        return productVariantImageRepository.findAllBySku(sku)
                .map(productVariantImageMapper::toDTO);
    }

    public Mono<ProductVariantImageDTO> saveProductVariantImage(ProductVariantImageDTO productVariantImageDTO, MultipartFile file) {
        return null;
    }
}
