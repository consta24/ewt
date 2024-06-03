package ewt.msvc.cart.repository;

import ewt.msvc.cart.domain.Cart;
import io.micrometer.core.instrument.config.validate.Validated;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface CartRepository extends R2dbcRepository<Cart, Long> {

    Mono<Cart> findByGuestUuid(UUID guestUuid);

    Mono<Cart> findByUsername(String username);

    Flux<Cart> findByLastModifiedDateBefore(@NotNull LocalDate lastModifiedDate);
}
