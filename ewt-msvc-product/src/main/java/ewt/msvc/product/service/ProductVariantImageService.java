package ewt.msvc.product.service;

import ewt.msvc.config.utils.Base64Util;
import ewt.msvc.product.domain.ProductVariantImage;
import ewt.msvc.product.repository.ProductVariantImageRepository;
import ewt.msvc.product.service.dto.ProductVariantImageDTO;
import ewt.msvc.product.service.mapper.ProductVariantImageMapper;
import ewt.msvc.product.util.MinioUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariantImageService {

    private final String minioBucketName;
    private final MinioUtil minioUtil;
    private final ProductVariantImageMapper productVariantImageMapper;
    private final ProductVariantImageRepository productVariantImageRepository;

    public Mono<String> getProductVariantImageByRef(String ref) {
        String[] parts = ref.split("/");
        if (parts.length != 2) {
            return Mono.error(new RuntimeException("Invalid ref format"));
        }

        String sku = parts[0];
        String sequence = parts[1];
        String objectName = String.join("/", sku, sequence);

        return minioUtil.getObject(objectName);
    }

    public Flux<ProductVariantImageDTO> getAllProductVariantImages(String sku) {
        return productVariantImageRepository.findAllBySku(sku)
                .map(productVariantImageMapper::toDTO);
    }

    public Mono<Void> saveProductVariantImages(String sku, Set<ProductVariantImageDTO> variantImages) {
        List<Mono<Void>> monos = variantImages.stream()
                .map(imageDTO -> {
                    imageDTO.setSku(sku);
                    String base64Data = imageDTO.getRef().split(",")[1];

                    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                    String contentType = Base64Util.getContentTypeFromBase64(imageDTO.getRef());
                    String fileExtension = Base64Util.getFileExtensionFromBase64(imageDTO.getRef());
                    String objectName = imageDTO.getSku() + "/" + imageDTO.getSequence() + "." + fileExtension;

                    imageDTO.setRef(objectName);

                    ProductVariantImage productVariantImage = productVariantImageMapper.toEntity(imageDTO);
                    return productVariantImageRepository.save(productVariantImage)
                            .flatMap(savedImage -> Mono.fromFuture(() -> minioUtil.putObject(objectName, imageBytes, contentType))
                                    .onErrorResume(ex -> productVariantImageRepository.deleteById(savedImage.getId()).then(Mono.error(ex)))
                                    .then());
                })
                .toList();

        return Mono.when(monos).then();
    }

    public Flux<Void> deleteAllImagesBySku(String sku) {
        return minioUtil.listObjects(sku)
                .flatMapMany(Flux::fromIterable)
                .flatMap(objectName -> minioUtil.deleteObject(objectName))
                .thenMany(deleteAllBySkuFromRepo(sku))
                .onErrorResume(e -> Mono.error(new RuntimeException("An error occurred while deleting images.", e)));
    }

    private Flux<Void> deleteAllBySkuFromRepo(String sku) {
        return productVariantImageRepository.deleteAllBySku(sku);
    }
}
