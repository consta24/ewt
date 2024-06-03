package ewt.msvc.order.domain;

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

@Table(value = "order_item", schema = "ewt_order")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItem {

    @Id
    private Long id;

    @Column("sku")
    @Size(max = 255)
    @NotNull
    private String sku;

    @Column("quantity")
    @NotNull
    private Integer quantity;

    @Column("last_modified_date")
    @NotNull
    private LocalDate lastModifiedDate;

    @Column("order_id")
    @NotNull
    private Long orderId;
}