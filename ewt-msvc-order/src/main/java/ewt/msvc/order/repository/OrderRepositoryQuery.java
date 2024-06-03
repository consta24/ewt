package ewt.msvc.order.repository;

import ewt.msvc.order.domain.Order;
import ewt.msvc.order.domain.enums.OrderStatus;
import ewt.msvc.order.domain.enums.PaymentMethod;
import ewt.msvc.order.domain.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.time.LocalDate;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class OrderRepositoryQuery {

    private final R2dbcEntityTemplate entityTemplate;

    public Flux<Order> findAllBy(Pageable pageable) {
        String baseQuery = "SELECT * FROM ewt_order.order";

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
                    Order order = new Order();
                    order.setId(row.get("id", Long.class));
                    order.setUsername(row.get("username", String.class));
                    order.setGuestUuid(row.get("guest_uuid", UUID.class));
                    order.setGuest(Boolean.TRUE.equals(row.get("is_guest", Boolean.class)));
                    order.setOrderStatus(OrderStatus.valueOf(row.get("order_status", String.class)));
                    order.setPaymentStatus(PaymentStatus.valueOf(row.get("payment_status", String.class)));
                    order.setPaymentMethod(PaymentMethod.valueOf(row.get("payment_method", String.class)));
                    order.setReceiveSms(Boolean.TRUE.equals(row.get("receive_sms", Boolean.class)));
                    order.setFirstName(row.get("first_name", String.class));
                    order.setLastName(row.get("last_name", String.class));
                    order.setCountry(row.get("country", String.class));
                    order.setCity(row.get("city", String.class));
                    order.setAddress(row.get("address", String.class));
                    order.setAdditionalAddress(row.get("additional_address", String.class));
                    order.setPostalCode(row.get("postal_code", String.class));
                    order.setPhone(row.get("phone", String.class));
                    order.setLastModifiedDate(row.get("last_modified_date", LocalDate.class));
                    return order;
                }).all();
    }
}
