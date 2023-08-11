package ewt.msvc.product.service;

import ewt.msvc.product.domain.ProductAttribute;
import ewt.msvc.product.repository.ProductAttributeRepository;
import ewt.msvc.product.service.dto.ProductAttributeDTO;
import ewt.msvc.product.service.mapper.ProductAttributeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ProductAttributeService {

    private final ProductAttributeMapper productAttributeMapper;

    private final ProductAttributeRepository productAttributeRepository;

    public Flux<ProductAttributeDTO> getAllAttributes() {
        return productAttributeRepository.findAll()
                .map(productAttributeMapper::toDTO);
    }

    public Mono<ProductAttributeDTO> addAttribute(ProductAttributeDTO productAttributeDTO) {
        ProductAttribute productAttribute = productAttributeMapper.toEntity(productAttributeDTO);
        return productAttributeRepository.save(productAttribute)
                .map(productAttributeMapper::toDTO);
    }

    public Mono<ProductAttributeDTO> updateAttribute(Long id, ProductAttributeDTO productAttributeDTO) {
        return productAttributeRepository.findById(id)
                .flatMap(existingAttribute -> {
                    existingAttribute.setName(productAttributeDTO.getName());
                    return productAttributeRepository.save(existingAttribute);
                })
                .map(productAttributeMapper::toDTO);
    }

    public Mono<Void> deleteAttribute(Long id) {
        return productAttributeRepository.deleteById(id);
    }

    public Mono<ProductAttributeDTO> getAttributeById(Long attributeId) {
        return productAttributeRepository.findById(attributeId)
                .map(productAttributeMapper::toDTO);
    }
}
