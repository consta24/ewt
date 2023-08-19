package ewt.msvc.product.service;

import ewt.msvc.product.domain.ProductVariantImage;
import ewt.msvc.product.repository.ProductVariantImageRepository;
import ewt.msvc.product.service.dto.ProductVariantImageDTO;
import ewt.msvc.product.service.mapper.ProductVariantImageMapper;
import ewt.msvc.product.service.util.Base64Util;
import io.minio.*;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import org.apache.commons.compress.utils.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class ProductVariantImageService {

    @Value("${minio.bucketName:ewt-product}")
    private String minioBucketName;
    private final MinioAsyncClient minioAsyncClient;

    private final ProductVariantImageMapper productVariantImageMapper;

    private final ProductVariantImageRepository productVariantImageRepository;


    public Mono<byte[]> getProductVariantImageByRef(String ref) {
        String[] parts = ref.split("/");
        if (parts.length != 2) {
            return Mono.error(new RuntimeException("Invalid ref format"));
        }

        String sku = parts[0];
        String sequence = parts[1];

        String objectName = String.join("/", sku, sequence);

        return Mono.create(sink -> {
            try {
                CompletableFuture<GetObjectResponse> future = minioAsyncClient.getObject(
                        GetObjectArgs.builder()
                                .bucket(minioBucketName)
                                .object(objectName)
                                .build()
                );

                future.thenAccept(response -> {
                    try {
                        byte[] imageBytes = IOUtils.toByteArray(response);
                        sink.success(imageBytes);
                    } catch (IOException e) {
                        sink.error(e);
                    }
                }).exceptionally(ex -> {
                    sink.error(ex);
                    return null;
                });
            } catch (Exception e) {
                sink.error(e);
            }
        });
    }


    public Flux<ProductVariantImageDTO> getAllProductVariantImages(String sku) {
        return productVariantImageRepository.findAllBySku(sku)
                .map(productVariantImageMapper::toDTO);
    }

    public Flux<ProductVariantImageDTO> saveProductVariantImages(String sku, Set<ProductVariantImageDTO> variantImages) {

        List<Mono<ProductVariantImageDTO>> monos = variantImages.stream()
                .map(imageDTO -> {
                    imageDTO.setSku(sku);

                    String base64Data = imageDTO.getRef().split(",")[1];

                    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                    String contentType = Base64Util.getContentTypeFromBase64(imageDTO.getRef());
                    String objectName = imageDTO.getSku() + "/" + imageDTO.getSequence();

                    return Mono.fromFuture(() -> asyncPutObject(imageBytes, minioBucketName, objectName, contentType, imageDTO))
                            .flatMap(updatedImageDTO -> {
                                ProductVariantImage productVariantImage = productVariantImageMapper.toEntity(updatedImageDTO);
                                return productVariantImageRepository.save(productVariantImage)
                                        .map(productVariantImageMapper::toDTO);
                            });
                })
                .toList();

        return Flux.merge(monos);
    }

    private CompletableFuture<ProductVariantImageDTO> asyncPutObject(byte[] imageBytes, String bucketName, String objectName, String contentType, ProductVariantImageDTO imageDTO) {
        CompletableFuture<ProductVariantImageDTO> future = new CompletableFuture<>();
        try {
            minioAsyncClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(new ByteArrayInputStream(imageBytes), imageBytes.length, -1)
                            .contentType(contentType)
                            .build()
            ).thenAccept(result -> {
                imageDTO.setRef(objectName);
                future.complete(imageDTO);
            }).exceptionally(ex -> {
                future.completeExceptionally(ex);
                return null;
            });
        } catch (Exception e) {
            future.completeExceptionally(e);
        }
        return future;
    }

    public Flux<Void> deleteAllImagesBySku(String sku) {
        return fetchObjectNames(minioBucketName, sku)
                .flatMapMany(Flux::fromIterable)
                .flatMap(objectName -> deleteObjectFromMinio(minioBucketName, objectName))
                .thenMany(deleteAllBySkuFromRepo(sku))
                .onErrorResume(e -> Mono.error(new RuntimeException("An error occurred while deleting images.", e)));
    }

    private Mono<List<String>> fetchObjectNames(String bucketName, String objectPrefix) {
        return Mono.create(sink -> {
            List<String> objectNames = new ArrayList<>();
            try {
                Iterable<Result<Item>> results = minioAsyncClient.listObjects(
                        ListObjectsArgs.builder()
                                .bucket(bucketName)
                                .prefix(objectPrefix)
                                .recursive(true)
                                .build()
                );

                for (Result<Item> result : results) {
                    Item item = result.get();
                    String objectName = item.objectName();
                    if (!objectName.endsWith("/")) {
                        objectNames.add(objectName);
                    }
                }


                sink.success(objectNames);
            } catch (Exception e) {
                sink.error(e);
            }
        });
    }


    private Mono<Void> deleteObjectFromMinio(String bucketName, String objectName) {
        return Mono.create(sink -> {
            try {
                minioAsyncClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .build()
                ).join();
                sink.success();
            } catch (Exception e) {
                sink.error(e);
            }
        });
    }

    private Flux<Void> deleteAllBySkuFromRepo(String sku) {
        return productVariantImageRepository.deleteAllBySku(sku);
    }
}
