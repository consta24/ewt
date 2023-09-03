package ewt.msvc.feedback.service;


import ewt.msvc.config.utils.Base64Util;
import ewt.msvc.feedback.domain.FeedbackReviewImage;
import ewt.msvc.feedback.repository.FeedbackReviewImageRepository;
import ewt.msvc.feedback.service.dto.FeedbackReviewImageDTO;
import ewt.msvc.feedback.service.mapper.FeedbackReviewImageMapper;
import io.minio.*;
import lombok.RequiredArgsConstructor;
import org.apache.commons.compress.utils.IOUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.IntStream;

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
        if(parts.length != 3) {
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

    public Mono<Void> saveFeedbackReviewImages(Long productId, Long feedbackReviewId, Set<FeedbackReviewImageDTO> feedbackReviewImages) {
        List<Mono<Void>> monos = IntStream.range(0, feedbackReviewImages.size())
                .mapToObj(index -> {
                    FeedbackReviewImageDTO imageDTO = new ArrayList<>(feedbackReviewImages).get(index);
                    imageDTO.setFeedbackReviewId(feedbackReviewId);
                    String base64Data = imageDTO.getRef().split(",")[1];

                    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                    String contentType = Base64Util.getContentTypeFromBase64(imageDTO.getRef());
                    String fileExtension = Base64Util.getFileExtensionFromBase64(imageDTO.getRef());
                    String objectName = productId + "/" + feedbackReviewId + "/" + index + 1 + "." + fileExtension;

                    imageDTO.setRef(objectName);

                    FeedbackReviewImage feedbackReviewImage = feedbackReviewImageMapper.toEntity(imageDTO);
                    return feedbackReviewImageRepository.save(feedbackReviewImage)
                            .flatMap(savedImage -> asyncPutObject(imageBytes, minioBucketName, objectName, contentType));
                })
                .toList();

        return Mono.when(monos).then();
    }

    private Mono<Void> asyncPutObject(byte[] imageBytes, String bucketName, String objectName, String contentType) {
        return ensureBucketExists(bucketName)
                .then(Mono.create(sink -> {
                    try {
                        minioAsyncClient.putObject(
                                        PutObjectArgs.builder()
                                                .bucket(bucketName)
                                                .object(objectName)
                                                .stream(new ByteArrayInputStream(imageBytes), imageBytes.length, -1)
                                                .contentType(contentType)
                                                .build()
                                ).thenAccept(result -> sink.success())
                                .exceptionally(ex -> {
                                    sink.error(ex);
                                    return null;
                                });
                    } catch (Exception e) {
                        sink.error(e);
                    }
                }));
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
