package ewt.msvc.product.web.rest.admin;

import ewt.msvc.config.web.rest.errors.BadRequestAlertException;
import ewt.msvc.product.service.ProductAttributeValueService;
import ewt.msvc.product.service.dto.ProductAttributeValueDTO;
import ewt.msvc.product.service.dto.ProductVariantDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/store-admin/product-attribute/{attributeId}/values")
@RequiredArgsConstructor
public class ProductAttributeValueResource {

    private static final String ENTITY_NAME = "product_attribute_values";

    private static final String ATTRIBUTE_ID_CANNOT_BE_NULL = "Attribute id cannot be null.";
    private static final String ATTRIBUTE_VALUE_ID_CANNOT_BE_NULL = "Attribute value id cannot be null.";
    private static final String ATTRIBUTE_VALUE_ID_NOT_NULL = "Attribute value id cannot be different than null when adding a new entry.";

    private static final String ATTRIBUTE_ID_CANNOT_BE_NULL_KEY = "attribute_id_null";
    private static final String ATTRIBUTE_VALUE_ID_CANNOT_BE_NULL_KEY = "attribute_value_id_null";
    private static final String ATTRIBUTE_VALUE_ID_NOT_NULL_KEY = "attribute_value_id_not_null";


    private final ProductAttributeValueService productAttributeValueService;

    @GetMapping
    public Flux<ProductAttributeValueDTO> getAttributeValues(@PathVariable Long attributeId) {
        if (attributeId == null) {
            throw new BadRequestAlertException(ATTRIBUTE_ID_CANNOT_BE_NULL, ENTITY_NAME, ATTRIBUTE_ID_CANNOT_BE_NULL_KEY);
        }
        return productAttributeValueService.getAttributeValues(attributeId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ProductAttributeValueDTO> addAttributeValue(@PathVariable Long attributeId,
                                                            @RequestBody ProductAttributeValueDTO productAttributeValueDTO) {
        if (attributeId == null) {
            throw new BadRequestAlertException(ATTRIBUTE_ID_CANNOT_BE_NULL, ENTITY_NAME, ATTRIBUTE_ID_CANNOT_BE_NULL_KEY);
        }
        if (productAttributeValueDTO.getId() != null) {
            throw new BadRequestAlertException(ATTRIBUTE_VALUE_ID_NOT_NULL, ENTITY_NAME, ATTRIBUTE_VALUE_ID_NOT_NULL_KEY);

        }
        return productAttributeValueService.addAttributeValue(productAttributeValueDTO);
    }

    @GetMapping("/{id}/linked")
    public Mono<Boolean> isAttributeValueLinkedToVariants(@PathVariable Long attributeId, @PathVariable Long id) {
        return productAttributeValueService.isAttributeValueLinkedToVariants(id);
    }

    @GetMapping("/{id}/variants")
    public Flux<ProductVariantDTO> getVariantsForAttributeValueId(@PathVariable Long attributeId, @PathVariable Long id) {
        return productAttributeValueService.getVariantsForAttributeValueId(id);
    }


    @PutMapping("/{id}")
    public Mono<ProductAttributeValueDTO> updateAttributeValue(@PathVariable Long attributeId,
                                                               @PathVariable Long id,
                                                               @RequestBody ProductAttributeValueDTO productAttributeValueDTO) {
        if (attributeId == null) {
            throw new BadRequestAlertException(ATTRIBUTE_ID_CANNOT_BE_NULL, ENTITY_NAME, ATTRIBUTE_ID_CANNOT_BE_NULL_KEY);
        }
        if (id == null) {
            throw new BadRequestAlertException(ATTRIBUTE_VALUE_ID_CANNOT_BE_NULL, ENTITY_NAME, ATTRIBUTE_VALUE_ID_CANNOT_BE_NULL_KEY);
        }
        return productAttributeValueService.updateAttributeValue(attributeId, id, productAttributeValueDTO);
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteAttributeValue(@PathVariable Long attributeId, @PathVariable Long id) {
        if (attributeId == null) {
            throw new BadRequestAlertException(ATTRIBUTE_ID_CANNOT_BE_NULL, ENTITY_NAME, ATTRIBUTE_ID_CANNOT_BE_NULL_KEY);
        }
        if (id == null) {
            throw new BadRequestAlertException(ATTRIBUTE_VALUE_ID_CANNOT_BE_NULL, ENTITY_NAME, ATTRIBUTE_VALUE_ID_CANNOT_BE_NULL_KEY);
        }
        return productAttributeValueService.deleteAttributeValue(attributeId, id);
    }
}
