package ewt.msvc.cart.service;

import ewt.msvc.cart.domain.Cart;
import ewt.msvc.cart.domain.CartItem;
import ewt.msvc.cart.repository.CartItemRepository;
import ewt.msvc.cart.repository.CartRepository;
import ewt.msvc.cart.service.dto.CartItemDTO;
import ewt.msvc.cart.service.mapper.CartItemMapper;
import ewt.msvc.config.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private static final String USER_CART_NOT_FOUND_ERR_MSG = "User cart not found.";
    private static final String GUEST_CART_NOT_FOUND_ERR_MSG = "Guest cart not found.";

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    private final CartItemMapper cartItemMapper;

    private final WebClient webClient;

    public Flux<CartItemDTO> getCart(UUID guestUuid) {
        return SecurityUtils.getCurrentUserLogin()
                .flatMapMany(userName -> cartRepository.findByGuestUuid(guestUuid)
                        .flatMapMany(guestCart -> cartRepository.findByUsername(userName)
                                .flatMapMany(userCart -> transferCartItems(guestCart, userCart)
                                        .thenMany(cartRepository.delete(guestCart))
                                        .thenMany(getCartItemsForCart(userCart.getId()))
                                )
                        )
                        .switchIfEmpty(getCartItemsForCartByUsername(userName))
                )
                .switchIfEmpty(getCartItemsForGuest(guestUuid));
    }

    private Mono<Void> transferCartItems(Cart guestCart, Cart userCart) {
        return cartItemRepository.findAllByCartId(guestCart.getId())
                .flatMap(item -> cartItemRepository.findBySkuAndCartId(item.getSku(), userCart.getId())
                        .defaultIfEmpty(new CartItem())
                        .flatMap(existingItem -> {
                            if (existingItem.getId() != null) {
                                existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                                return cartItemRepository.save(existingItem);
                            } else {
                                item.setCartId(userCart.getId());
                                return cartItemRepository.save(item);
                            }
                        }))
                .then();
    }

    private Flux<CartItemDTO> getCartItemsForCartByUsername(String userName) {
        return cartRepository.findByUsername(userName)
                .flatMapMany(cart -> getCartItemsForCart(cart.getId()));
    }

    private Flux<CartItemDTO> getCartItemsForGuest(UUID guestUuid) {
        return cartRepository.findByGuestUuid(guestUuid)
                .flatMapMany(cart -> getCartItemsForCart(cart.getId()));
    }

    private Flux<CartItemDTO> getCartItemsForCart(Long cartId) {
        return cartItemRepository.findAllByCartId(cartId)
                .map(cartItemMapper::toDTO);
    }

    public Mono<Void> addToCart(UUID guestUuid, CartItemDTO cartItemDTO) {
        return SecurityUtils.getCurrentUserLogin()
                .flatMap(username -> cartRepository.findByUsername(username)
                        .switchIfEmpty(createNewUserCart(username))
                        .flatMap(cart -> updateOrAddCartItem(cart, cartItemDTO)))
                .switchIfEmpty(Mono.defer(() -> cartRepository.findByGuestUuid(guestUuid)
                        .switchIfEmpty(createNewGuestCart(guestUuid))
                        .flatMap(cart -> updateOrAddCartItem(cart, cartItemDTO))))
                .then();
    }

    private Mono<CartItem> updateOrAddCartItem(Cart cart, CartItemDTO cartItemDTO) {
        return getStockForProductVariant(cartItemDTO.getSku())
                .flatMap(stock -> {
                    cart.setLastModifiedDate(LocalDate.now());
                    return cartRepository.save(cart)
                            .flatMap(savedCart -> cartItemRepository.findBySkuAndCartId(cartItemDTO.getSku(), savedCart.getId())
                                    .flatMap(existingItem -> {
                                        int totalQuantity = existingItem.getQuantity() + cartItemDTO.getQuantity();
                                        if (totalQuantity > stock) {
                                            existingItem.setQuantity(stock);
                                        } else {
                                            existingItem.setQuantity(totalQuantity);
                                        }
                                        return cartItemRepository.save(existingItem);
                                    })
                                    .switchIfEmpty(saveCartItem(savedCart, cartItemDTO, stock)));
                });
    }

    private Mono<CartItem> saveCartItem(Cart savedCart, CartItemDTO cartItemDTO, int stock) {
        CartItem cartItem = cartItemMapper.toEntity(cartItemDTO);
        if (cartItem.getQuantity() > stock) {
            cartItem.setQuantity(stock);
        }
        cartItem.setCartId(savedCart.getId());
        return cartItemRepository.save(cartItem);
    }

    private Mono<Integer> getStockForProductVariant(String sku) {
        return webClient.get()
                .uri("ewt-msvc-product/api/store-admin/product/{productId}/variant/{sku}/stock", 0/*doesnt-matter, FIX THIS*/, sku)
                .retrieve()
                .bodyToMono(Integer.class);
    }

    private Mono<Cart> createNewUserCart(String username) {
        Cart userCart = Cart.builder()
                .username(username)
                .guestUuid(null)
                .isGuest(false)
                .lastModifiedDate(LocalDate.now())
                .build();

        return cartRepository.save(userCart);
    }

    private Mono<Cart> createNewGuestCart(UUID guestUuid) {
        Cart guestCart = Cart.builder()
                .username(null)
                .guestUuid(guestUuid)
                .isGuest(true)
                .lastModifiedDate(LocalDate.now())
                .build();

        return cartRepository.save(guestCart);
    }

    public Mono<Integer> getTotalQuantity(UUID guestUuid) {
        return SecurityUtils.getCurrentUserLogin()
                .flatMap(username -> fetchCart(username, guestUuid)
                        .flatMap(this::getCartTotalQuantity))
                .switchIfEmpty(Mono.defer(() -> fetchCart(null, guestUuid)
                        .flatMap(this::getCartTotalQuantity)));
    }

    private Mono<Integer> getCartTotalQuantity(Cart cart) {
        return cartItemRepository.findAllByCartId(cart.getId())
                .map(CartItem::getQuantity)
                .reduce(0, Integer::sum);
    }

    public Mono<Void> updateQuantityInCart(UUID guestUuid, CartItemDTO cartItemDTO) {
        return SecurityUtils.getCurrentUserLogin()
                .flatMap(username -> fetchCart(username, guestUuid))
                .switchIfEmpty(Mono.defer(() -> fetchCart(null, guestUuid)))
                .flatMap(cart -> updateCartItemQuantity(cart, cartItemDTO))
                .then();
    }

    private Mono<CartItem> updateCartItemQuantity(Cart cart, CartItemDTO cartItemDTO) {
        return cartItemRepository.findBySkuAndCartId(cartItemDTO.getSku(), cart.getId())
                .flatMap(existingItem -> {
                    existingItem.setQuantity(cartItemDTO.getQuantity());
                    return cartItemRepository.save(existingItem);
                });
    }

    public Mono<Void> removeFromCart(UUID guestUuid, String sku) {
        return SecurityUtils.getCurrentUserLogin()
                .flatMap(username -> fetchCart(username, guestUuid))
                .switchIfEmpty(Mono.defer(() -> fetchCart(null, guestUuid)))
                .flatMap(cart -> deleteCartItemBySku(cart, sku))
                .then();
    }

    private Mono<Void> deleteCartItemBySku(Cart cart, String sku) {
        return cartItemRepository.findBySkuAndCartId(sku, cart.getId())
                .flatMap(cartItemRepository::delete);
    }

    private Mono<Cart> fetchCart(String username, UUID guestUuid) {
        if (username != null) {
            return cartRepository.findByUsername(username)
                    .switchIfEmpty(Mono.error(new RuntimeException(USER_CART_NOT_FOUND_ERR_MSG)));
        } else {
            return cartRepository.findByGuestUuid(guestUuid)
                    .switchIfEmpty(Mono.error(new RuntimeException(GUEST_CART_NOT_FOUND_ERR_MSG)));
        }
    }
}
