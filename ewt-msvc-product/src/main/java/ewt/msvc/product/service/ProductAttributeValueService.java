package ewt.msvc.product.service;

import ewt.msvc.product.domain.ProductAttributeValue;
import ewt.msvc.product.repository.ProductAttributeValueRepository;
import ewt.msvc.product.service.dto.ProductAttributeValueDTO;
import ewt.msvc.product.service.mapper.ProductAttributeValueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ProductAttributeValueService {

    private final ProductAttributeValueMapper productAttributeValueMapper;

    private final ProductAttributeValueRepository productAttributeValueRepository;


    public Flux<ProductAttributeValueDTO> getAttributeValues(Long attributeId) {
        return productAttributeValueRepository.findByAttributeId(attributeId)
                .map(productAttributeValueMapper::toDTO);
    }

    public Mono<ProductAttributeValueDTO> addAttributeValue(ProductAttributeValueDTO productAttributeValueDTO) {
        ProductAttributeValue productAttributeValue = productAttributeValueMapper.toEntity(productAttributeValueDTO);
        return productAttributeValueRepository.save(productAttributeValue)
                .map(productAttributeValueMapper::toDTO);
    }

    public Mono<ProductAttributeValueDTO> updateAttributeValue(Long attributeId, Long id, ProductAttributeValueDTO productAttributeValueDTO) {
        return productAttributeValueRepository.findByIdAndAttributeId(id, attributeId)
                .flatMap(existingAttributeValue -> {
                    ProductAttributeValue updatedAttributeValue = productAttributeValueMapper.toEntity(productAttributeValueDTO);
                    updatedAttributeValue.setId(id);
                    return productAttributeValueRepository.save(updatedAttributeValue);
                })
                .map(productAttributeValueMapper::toDTO);
    }

    public Mono<Void> deleteAttributeValue(Long attributeId, Long id) {
        return productAttributeValueRepository.findByIdAndAttributeId(id, attributeId)
                .flatMap(productAttributeValueRepository::delete);
    }
}
