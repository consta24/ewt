package ewt.msvc.product.repository;

import ewt.msvc.product.domain.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ProductRepository extends R2dbcRepository<Product, Long> {

    @Query("""
          SELECT * FROM ewt_product.ewt_product.product
          ORDER BY CASE WHEN :#{#pageable.sort.isSorted()} THEN :#{#pageable.sort.iterator().next().property} ELSE 'id' END
          :#{#pageable.sort.iterator().next().direction == Sort.Direction.ASC ? 'ASC' : 'DESC'}
          LIMIT :#{#pageable.pageSize} OFFSET :#{#pageable.offset}
          """)
    Flux<Product> findAllBy(Pageable pageable);
}
