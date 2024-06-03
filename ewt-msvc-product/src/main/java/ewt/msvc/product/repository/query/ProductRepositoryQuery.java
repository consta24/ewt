package ewt.msvc.product.repository.query;

import ewt.msvc.product.domain.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
@RequiredArgsConstructor
public class ProductRepositoryQuery {

    private final R2dbcEntityTemplate entityTemplate;

    public Flux<Product> findAllBy(Pageable pageable) {
        String baseQuery = "SELECT * FROM ewt.ewt_product.product";

        StringBuilder queryBuilder = new StringBuilder(baseQuery);

        if (pageable.getSort().isSorted()) {
            pageable.getSort()
                    .get()
                    .findFirst()
                    .ifPresent(order -> queryBuilder
                            .append(" ORDER BY ")
                            .append(order.getProperty())
                            .append(" ")
                            .append(order.getDirection()));
        } else {
            queryBuilder.append(" ORDER BY id ASC");
        }

        queryBuilder.append(" LIMIT $1 OFFSET $2");

        return entityTemplate.getDatabaseClient().sql(queryBuilder.toString())
                .bind("$1", pageable.getPageSize())
                .bind("$2", pageable.getOffset())
                .map((row, metadata) -> {
                    Product product = new Product();
                    product.setId(row.get("id", Long.class));
                    product.setName(row.get("name", String.class));
                    product.setDescription(row.get("description", String.class));
                    return product;
                }).all();
    }
}
