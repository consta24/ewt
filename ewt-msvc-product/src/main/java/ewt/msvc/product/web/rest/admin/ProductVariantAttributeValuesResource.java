package ewt.msvc.product.web.rest.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store-admin/product/{productId}/variant/{sku}/attribute-values")
@RequiredArgsConstructor
public class ProductVariantAttributeValuesResource {


}
