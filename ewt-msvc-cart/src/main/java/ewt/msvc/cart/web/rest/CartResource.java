package ewt.msvc.cart.web.rest;


import ewt.msvc.cart.service.CartService;
import ewt.msvc.cart.service.dto.CartItemDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartResource {

    private final CartService cartService;

    @GetMapping
    public Flux<CartItemDTO> getCart(@RequestHeader("guestUuid") UUID guestUuid) {
        return cartService.getCart(guestUuid);
    }

    @GetMapping("/total-quantity")
    public Mono<Integer> getTotalQuantity(@RequestHeader("guestUuid") UUID guestUuid) {
        return cartService.getTotalQuantity(guestUuid);
    }

    @PutMapping
    public Mono<Void> updateQuantityInCart(@RequestHeader("guestUuid") UUID guestUuid,
                                           @Valid @RequestBody CartItemDTO cartItemDTO) {
        return cartService.updateQuantityInCart(guestUuid, cartItemDTO);
    }

    @PostMapping
    public Mono<Void> addToCart(@RequestHeader("guestUuid") UUID guestUuid,
                                @Valid @RequestBody CartItemDTO cartItemDTO) {
        return cartService.addToCart(guestUuid, cartItemDTO);
    }

    @DeleteMapping("/{sku}")
    public Mono<Void> removeFromCart(@RequestHeader("guestUuid") UUID guestUuid, @PathVariable String sku) {
        return cartService.removeFromCart(guestUuid, sku);
    }
}
