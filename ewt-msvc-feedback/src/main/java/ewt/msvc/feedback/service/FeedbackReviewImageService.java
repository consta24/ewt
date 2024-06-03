package ewt.msvc.feedback.service;


import ewt.msvc.feedback.domain.FeedbackReviewImage;
import ewt.msvc.feedback.repository.FeedbackReviewImageRepository;
import ewt.msvc.feedback.service.dto.FeedbackReviewImageDTO;
import ewt.msvc.feedback.service.mapper.FeedbackReviewImageMapper;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MakeBucketArgs;
import io.minio.MinioAsyncClient;
import io.minio.ObjectWriteResponse;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.apache.commons.compress.utils.IOUtils;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.InputStream;
import java.io.SequenceInputStream;
import java.util.Base64;
import java.util.Collections;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackReviewImageService {

    private final String minioBucketName;

    private final MinioAsyncClient minioAsyncClient;

    private final FeedbackReviewImageMapper feedbackReviewImageMapper;

    private final FeedbackReviewImageRepository feedbackReviewImageRepository;

    public Mono<String> getFeedbackReviewImageByRef(String ref) {
        String[] parts = ref.split("/");
        if (parts.length != 3) {
            return Mono.error(new RuntimeException("Invalid ref format"));
        }

        return Mono.create(sink -> {
            try {
                CompletableFuture<GetObjectResponse> future = minioAsyncClient.getObject(
                        GetObjectArgs.builder()
                                .bucket(minioBucketName)
                                .object(ref)
                                .build()
                );

                future.thenAccept(response -> {
                    try {
                        byte[] imageBytes = IOUtils.toByteArray(response);
                        String contentType = response.headers().get("Content-Type");
                        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                        String fullData = "data:" + contentType + ";base64," + base64Image;
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

    public Flux<FeedbackReviewImageDTO> getFeedbackReviewImages(Long feedbackReviewId) {
        return feedbackReviewImageRepository.findAllByFeedbackReviewId(feedbackReviewId)
                .map(feedbackReviewImageMapper::toDTO);
    }

    public Mono<Void> saveFeedbackReviewImages(Long productId, Long feedbackReviewId, Flux<FilePart> fileParts) {
        return fileParts
                .flatMap(filePart -> {
                    String fileName = StringUtils.cleanPath(Objects.requireNonNull(filePart.filename()));
                    String objectName = productId + "/" + feedbackReviewId + "/" + fileName;
                    FeedbackReviewImage feedbackReviewImage = FeedbackReviewImage.builder()
                            .feedbackReviewId(feedbackReviewId)
                            .ref(objectName)
                            .build();
                    return feedbackReviewImageRepository.save(feedbackReviewImage)
                            .flatMap(savedImage -> asyncPutObject(filePart, minioBucketName, objectName));
                })
                .then();
    }

    private Mono<Void> asyncPutObject(FilePart file, String bucketName, String objectName) {
        return ensureBucketExists(bucketName)
                .then(file.content().collectList())
                .flatMap(dataBuffers -> {
                    InputStream is = new SequenceInputStream(
                            Collections.enumeration(dataBuffers.stream()
                                    .map(DataBuffer::asInputStream)
                                    .toList())
                    );
                    int dataSize = dataBuffers.stream().mapToInt(DataBuffer::readableByteCount).sum();

                    try {
                        PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .stream(is, dataSize, -1)
                                .contentType(Objects.requireNonNull(file.headers().getContentType()).toString())
                                .build();

                        CompletableFuture<ObjectWriteResponse> putObjectFuture = minioAsyncClient.putObject(putObjectArgs);

                        return Mono.fromFuture(() -> putObjectFuture)
                                .then()
                                .doFinally(signalType -> dataBuffers.forEach(DataBufferUtils::release));
                    } catch (Exception e) {
                        dataBuffers.forEach(DataBufferUtils::release);
                        return Mono.error(e);
                    }
                });
    }

    private Mono<Void> ensureBucketExists(String bucketName) {
        return Mono.defer(() -> Mono.fromFuture(() -> {
                    try {
                        return minioAsyncClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
                    } catch (Exception e) {
                        return CompletableFuture.failedFuture(e);
                    }
                })
                .flatMap(exists -> {
                    if (Boolean.FALSE.equals(exists)) {
                        return Mono.fromFuture(() -> {
                            try {
                                return minioAsyncClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                            } catch (Exception e) {
                                return CompletableFuture.failedFuture(e);
                            }
                        });
                    }
                    return Mono.empty();
                }));
    }
}
