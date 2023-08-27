package ewt.msvc.cart.domain;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Table(value = "cart", schema = "ewt_cart")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Cart implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private Long id;

    private String username;

    private UUID guestUuid;

    @NotNull
    private Boolean isGuest;

    @NotNull
    private LocalDate lastModifiedDate;
}
