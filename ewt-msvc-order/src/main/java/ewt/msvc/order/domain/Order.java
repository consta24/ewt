package ewt.msvc.order.domain;

import ewt.msvc.order.domain.enums.OrderStatus;
import ewt.msvc.order.domain.enums.PaymentMethod;
import ewt.msvc.order.domain.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.util.UUID;

@Table(value = "order", schema = "ewt_order")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Order {

    @Id
    private Long id;

    @Column("username")
    @Size(max = 255)
    private String username;

    @Column("guest_uuid")
    private UUID guestUuid;

    @Column("is_guest")
    @NotNull
    private boolean isGuest;

    @Column("order_status")
    @Size(max = 20)
    @NotNull
    private OrderStatus orderStatus;

    @Column("payment_status")
    @Size(max = 20)
    @NotNull
    private PaymentStatus paymentStatus;

    @Column("payment_method")
    @Size(max = 20)
    @NotNull
    private PaymentMethod paymentMethod;

    @Column("receive_sms")
    @NotNull
    private boolean receiveSms;

    @Column("first_name")
    @Size(max = 255)
    @NotNull
    private String firstName;

    @Column("last_name")
    @Size(max = 255)
    @NotNull
    private String lastName;

    @Column("country")
    @Size(max = 255)
    @NotNull
    private String country;

    @Column("city")
    @Size(max = 255)
    @NotNull
    private String city;

    @Column("address")
    @Size(max = 255)
    @NotNull
    private String address;

    @Column("additional_address")
    @Size(max = 1000)
    private String additionalAddress;

    @Column("postal_code")
    @Size(max = 20)
    @NotNull
    private String postalCode;

    @Column("phone")
    @Size(max = 20)
    @NotNull
    private String phone;

    @Column("last_modified_date")
    @NotNull
    private LocalDate lastModifiedDate;
}