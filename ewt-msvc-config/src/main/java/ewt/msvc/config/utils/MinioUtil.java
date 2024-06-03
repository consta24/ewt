package ewt.msvc.product.util;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.ListObjectsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioAsyncClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.Result;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import org.apache.commons.compress.utils.IOUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "minio.enabled", havingValue = "true")
public class MinioUtil {

    private final String minioBucketName;

    private final MinioAsyncClient minioAsyncClient;

    public CompletableFuture<Void> createBucketIfNotExists(String bucketName) {
        return CompletableFuture.runAsync(() -> {
            try {
                boolean exists = minioAsyncClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build()).get();
                if (!exists) {
                    minioAsyncClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build()).get();
                }
            } catch (Exception e) {
                throw new RuntimeException("Error creating bucket: " + e.getMessage(), e);
            }
        });
    }

    public CompletableFuture<Void> putObject(String objectName, byte[] data, String contentType) {
        return createBucketIfNotExists(minioBucketName)
                .thenCompose(voidResult -> {
                    CompletableFuture<Void> future = new CompletableFuture<>();
                    try {
                        minioAsyncClient.putObject(
                                PutObjectArgs.builder()
                                        .bucket(minioBucketName)
                                        .object(objectName)
                                        .stream(new ByteArrayInputStream(data), data.length, -1)
                                        .contentType(contentType)
                                        .build()
                        ).thenAccept(result -> {
                            future.complete(null);
                        }).exceptionally(ex -> {
                            future.completeExceptionally(ex);
                            return null;
                        });
                    } catch (Exception e) {
                        future.completeExceptionally(e);
                    }
                    return future;
                });
    }

    public Mono<String> getObject(String objectName) {
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
                        byte[] data = IOUtils.toByteArray(response);
                        String contentType = response.headers().get("Content-Type");
                        String base64Data = java.util.Base64.getEncoder().encodeToString(data);
                        String fullData = "data:" + contentType + ";base64," + base64Data;
                        sink.success(fullData);
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

    public Mono<List<String>> listObjects(String prefix) {
        return Mono.create(sink -> {
            List<String> objectNames = new ArrayList<>();
            try {
                Iterable<Result<Item>> results = minioAsyncClient.listObjects(
                        ListObjectsArgs.builder()
                                .bucket(minioBucketName)
                                .prefix(prefix)
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

    public Mono<Void> deleteObject(String objectName) {
        return Mono.create(sink -> {
            try {
                minioAsyncClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(minioBucketName)
                                .object(objectName)
                                .build()
                ).join();
                sink.success();
            } catch (Exception e) {
                sink.error(e);
            }
        });
    }
}
