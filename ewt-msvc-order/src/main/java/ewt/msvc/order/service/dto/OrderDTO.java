package ewt.msvc.order.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Size(max = 255)
    private String username;

    private UUID guestUuid;

    private boolean isGuest;

    @Size(max = 20)
    private String orderStatus;

    @Size(max = 20)
    private String paymentStatus;

    @Size(max = 20)
    @NotNull
    private String paymentMethod;

    private boolean receiveSms;

    @Size(max = 255)
    @NotNull
    private String firstName;

    @Size(max = 255)
    @NotNull
    private String lastName;

    @Size(max = 255)
    @NotNull
    private String country;

    @Size(max = 255)
    @NotNull
    private String city;

    @Size(max = 255)
    @NotNull
    private String address;

    @Size(max = 1000)
    private String additionalAddress;

    @Size(max = 255)
    @NotNull
    private String postalCode;

    @Size(max = 10)
    private String phone;

    private List<OrderItemDTO> orderItems;
}