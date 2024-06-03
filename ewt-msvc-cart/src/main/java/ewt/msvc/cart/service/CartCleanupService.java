package ewt.msvc.cart.service;

import ewt.msvc.cart.repository.CartItemRepository;
import ewt.msvc.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CartCleanupService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Scheduled(cron = "0 0 0 * * ?")
    public void removeExpiredCarts() {
        LocalDate threshold = LocalDate.now().minusDays(30);

        cartRepository.findByLastModifiedDateBefore(threshold)
                .flatMap(cart ->
                        cartItemRepository.deleteAllByCartId(cart.getId())
                                .then(cartRepository.deleteById(cart.getId()))
                ).subscribe();
    }
}

